"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripService = exports.TripService = void 0;
const databaseManager_1 = require("./databaseManager");
const patientIdService_1 = require("./patientIdService");
const prisma = databaseManager_1.databaseManager.getCenterDB();
class TripService {
    /**
     * Create a new transport request
     */
    async createTrip(data) {
        console.log('TCC_DEBUG: Creating trip with data:', data);
        try {
            const tripNumber = `TRP-${Date.now()}`;
            const tripData = {
                tripNumber,
                patientId: data.patientId,
                patientWeight: null,
                specialNeeds: data.specialNeeds || null,
                // Use relation connects for facilities (Prisma expects relation objects here)
                fromLocation: null,
                toLocation: null,
                scheduledTime: new Date(data.readyStart),
                transportLevel: data.transportLevel,
                urgencyLevel: data.urgencyLevel || 'Routine',
                priority: data.priority,
                status: 'PENDING',
                specialRequirements: data.specialNeeds || null,
                diagnosis: null,
                mobilityLevel: null,
                oxygenRequired: false,
                monitoringRequired: false,
                generateQRCode: false,
                qrCodeData: null,
                selectedAgencies: [],
                notificationRadius: null,
                requestTimestamp: new Date(),
                acceptedTimestamp: null,
                pickupTimestamp: null,
                notes: null,
                isolation: data.isolation || false,
                bariatric: data.bariatric || false,
            };
            // Connect origin/destination facilities if provided
            if (data.originFacilityId) {
                tripData.originFacility = { connect: { id: data.originFacilityId } };
            }
            if (data.destinationFacilityId) {
                tripData.destinationFacility = { connect: { id: data.destinationFacilityId } };
            }
            // Connect pickup location if provided
            if (data.pickupLocationId) {
                tripData.pickupLocation = { connect: { id: data.pickupLocationId } };
            }
            const trip = await prisma.transportRequest.create({
                data: tripData
            });
            console.log('TCC_DEBUG: Trip created successfully:', trip.id);
            return { success: true, data: trip };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error creating trip:', error);
            return { success: false, error: 'Failed to create transport request' };
        }
    }
    /**
     * Get all transport requests with optional filtering
     */
    async getTrips(filters) {
        console.log('TCC_DEBUG: Getting trips with filters:', filters);
        try {
            const where = {};
            if (filters?.status) {
                // Handle comma-separated status values (e.g., "ACCEPTED,IN_PROGRESS,COMPLETED")
                if (filters.status.includes(',')) {
                    const statuses = filters.status.split(',').map(s => s.trim());
                    where.status = {
                        in: statuses
                    };
                }
                else {
                    where.status = filters.status;
                }
            }
            if (filters?.transportLevel) {
                where.transportLevel = filters.transportLevel;
            }
            if (filters?.priority) {
                where.priority = filters.priority;
            }
            // Note: assignedAgencyId doesn't exist in TransportRequest model, so we'll skip this filter for now
            const trips = await prisma.transportRequest.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    originFacility: {
                        select: {
                            id: true,
                            name: true,
                            type: true
                        }
                    },
                    destinationFacility: {
                        select: {
                            id: true,
                            name: true,
                            type: true
                        }
                    },
                    pickupLocation: {
                        select: {
                            id: true,
                            name: true,
                            floor: true,
                            room: true
                        }
                    },
                    assignedUnit: {
                        select: {
                            id: true,
                            unitNumber: true,
                            type: true,
                            agency: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            });
            console.log('TCC_DEBUG: Found trips:', trips.length);
            try {
                console.log('TCC_DEBUG: Trips sample fields →', trips.slice(0, 3).map(t => ({
                    id: t.id,
                    status: t.status,
                    assignedUnitId: t.assignedUnitId,
                    assignedUnit: t.assignedUnit ? { id: t.assignedUnit.id, unitNumber: t.assignedUnit.unitNumber, type: t.assignedUnit.type } : null
                })));
            }
            catch { }
            return { success: true, data: trips };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error getting trips:', error);
            return { success: false, error: 'Failed to fetch transport requests' };
        }
    }
    /**
     * Get a single transport request by ID
     */
    async getTripById(id) {
        console.log('TCC_DEBUG: Getting trip by ID:', id);
        try {
            const trip = await prisma.transportRequest.findUnique({
                where: { id },
                include: {
                    originFacility: {
                        select: {
                            id: true,
                            name: true,
                            type: true
                        }
                    },
                    destinationFacility: {
                        select: {
                            id: true,
                            name: true,
                            type: true
                        }
                    },
                    pickupLocation: {
                        select: {
                            id: true,
                            name: true,
                            floor: true,
                            room: true
                        }
                    },
                    assignedUnit: {
                        select: {
                            id: true,
                            unitNumber: true,
                            type: true,
                            agency: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            });
            if (!trip) {
                return { success: false, error: 'Transport request not found' };
            }
            console.log('TCC_DEBUG: Trip found:', trip.id);
            return { success: true, data: trip };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error getting trip by ID:', error);
            return { success: false, error: 'Failed to fetch transport request' };
        }
    }
    /**
     * Update trip status
     */
    async updateTripStatus(id, data) {
        console.log('TCC_DEBUG: Updating trip status:', { id, data });
        try {
            // Validate unit assignment if provided
            if (data.assignedUnitId) {
                const unit = await this.validateUnitAssignment(data.assignedUnitId, data.assignedAgencyId);
                if (!unit) {
                    return { success: false, error: 'Invalid unit assignment or unit not available' };
                }
            }
            const updateData = {
                status: data.status,
                updatedAt: new Date()
            };
            // Update optional fields if provided
            if (data.urgencyLevel !== undefined)
                updateData.urgencyLevel = data.urgencyLevel;
            if (data.transportLevel !== undefined)
                updateData.transportLevel = data.transportLevel;
            if (data.diagnosis !== undefined)
                updateData.diagnosis = data.diagnosis;
            if (data.mobilityLevel !== undefined)
                updateData.mobilityLevel = data.mobilityLevel;
            if (data.insuranceCompany !== undefined)
                updateData.insuranceCompany = data.insuranceCompany;
            if (data.specialNeeds !== undefined)
                updateData.specialNeeds = data.specialNeeds;
            if (data.oxygenRequired !== undefined)
                updateData.oxygenRequired = data.oxygenRequired;
            if (data.monitoringRequired !== undefined)
                updateData.monitoringRequired = data.monitoringRequired;
            // Handle unit assignment
            if (data.assignedUnitId) {
                updateData.assignedUnitId = data.assignedUnitId;
            }
            if (data.assignedAgencyId) {
                updateData.assignedAgencyId = data.assignedAgencyId;
            }
            // Handle timestamps
            if (data.acceptedTimestamp) {
                updateData.acceptedTimestamp = new Date(data.acceptedTimestamp);
            }
            if (data.pickupTimestamp) {
                updateData.pickupTimestamp = new Date(data.pickupTimestamp);
            }
            if (data.arrivalTimestamp) {
                updateData.arrivalTimestamp = new Date(data.arrivalTimestamp);
            }
            if (data.departureTimestamp) {
                updateData.departureTimestamp = new Date(data.departureTimestamp);
            }
            if (data.completionTimestamp) {
                updateData.completionTimestamp = new Date(data.completionTimestamp);
            }
            // Update unit status if assigning to a trip
            if (data.assignedUnitId && data.status === 'ACCEPTED') {
                await this.updateUnitStatus(data.assignedUnitId, 'COMMITTED');
            }
            // Update unit status if completing/cancelling a trip
            if (data.assignedUnitId && (data.status === 'COMPLETED' || data.status === 'CANCELLED')) {
                await this.updateUnitStatus(data.assignedUnitId, 'AVAILABLE');
            }
            const trip = await prisma.transportRequest.update({
                where: { id },
                data: updateData,
                include: {
                    assignedUnit: true,
                    pickupLocation: true,
                    originFacility: true,
                    destinationFacility: true
                }
            });
            console.log('TCC_DEBUG: Trip status updated successfully:', trip.id);
            return { success: true, data: trip };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error updating trip status:', error);
            return { success: false, error: 'Failed to update transport request status' };
        }
    }
    /**
     * Get agencies for a specific hospital (simplified version)
     */
    async getAgenciesForHospital(hospitalId) {
        console.log('TCC_DEBUG: getAgenciesForHospital called with hospitalId:', hospitalId);
        try {
            // For now, return a simple list of agencies
            // This can be expanded later to actually query agencies based on hospital location
            const agencies = await prisma.eMSAgency.findMany({
                where: {
                    isActive: true
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    city: true,
                    state: true
                }
            });
            console.log('TCC_DEBUG: Found agencies:', agencies.length);
            return { success: true, data: agencies };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error getting agencies for hospital:', error);
            return { success: false, error: 'Failed to get agencies for hospital' };
        }
    }
    /**
     * Create an enhanced transport request
     */
    async createEnhancedTrip(data) {
        console.log('TCC_DEBUG: Creating enhanced trip with data:', data);
        try {
            const tripNumber = `TRP-${Date.now()}`;
            const tripData = {
                tripNumber,
                patientId: data.patientId || 'PAT-UNKNOWN',
                patientWeight: data.patientWeight || null,
                specialNeeds: data.specialNeeds || null,
                originFacilityId: null, // Not used in enhanced version
                destinationFacilityId: null, // Not used in enhanced version
                fromLocation: data.fromLocation,
                toLocation: data.toLocation,
                scheduledTime: new Date(data.scheduledTime),
                transportLevel: data.transportLevel,
                urgencyLevel: data.urgencyLevel,
                priority: data.priority || 'MEDIUM',
                status: 'PENDING',
                specialRequirements: data.specialNeeds || null,
                diagnosis: data.diagnosis || null,
                mobilityLevel: data.mobilityLevel || null,
                oxygenRequired: data.oxygenRequired || false,
                monitoringRequired: data.monitoringRequired || false,
                generateQRCode: data.generateQRCode || false,
                qrCodeData: null,
                selectedAgencies: data.selectedAgencies || [],
                notificationRadius: data.notificationRadius || null,
                requestTimestamp: new Date(),
                acceptedTimestamp: null,
                pickupTimestamp: null,
                notes: data.notes || null,
                isolation: false,
                bariatric: false,
            };
            // Connect pickup location relation if provided
            if (data.pickupLocationId) {
                tripData.pickupLocation = { connect: { id: data.pickupLocationId } };
            }
            const trip = await prisma.transportRequest.create({
                data: tripData
            });
            console.log('TCC_DEBUG: Enhanced trip created successfully:', trip.id);
            return { success: true, data: trip };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error creating enhanced trip:', error);
            return { success: false, error: 'Failed to create enhanced transport request' };
        }
    }
    /**
     * Get trip history with filtering
     */
    async getTripHistory(filters) {
        console.log('TCC_DEBUG: Getting trip history with filters:', filters);
        try {
            const where = {};
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.dateFrom) {
                where.createdAt = { gte: new Date(filters.dateFrom) };
            }
            if (filters.dateTo) {
                where.createdAt = {
                    ...where.createdAt,
                    lte: new Date(filters.dateTo)
                };
            }
            if (filters.search) {
                where.OR = [
                    { tripNumber: { contains: filters.search } },
                    { patientId: { contains: filters.search } },
                    { fromLocation: { contains: filters.search } },
                    { toLocation: { contains: filters.search } }
                ];
            }
            const trips = await prisma.transportRequest.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                take: filters.limit,
                skip: filters.offset,
            });
            console.log('TCC_DEBUG: Found trip history:', trips.length);
            return { success: true, data: trips };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error getting trip history:', error);
            return { success: false, error: 'Failed to fetch trip history' };
        }
    }
    /**
     * Get available agencies
     */
    async getAvailableAgencies() {
        console.log('TCC_DEBUG: Getting available agencies');
        try {
            const agencies = await prisma.eMSAgency.findMany({
                where: {
                    isActive: true
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    city: true,
                    state: true,
                    capabilities: true,
                    serviceArea: true
                }
            });
            console.log('TCC_DEBUG: Found available agencies:', agencies.length);
            return { success: true, data: agencies };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error getting available agencies:', error);
            return { success: false, error: 'Failed to get available agencies' };
        }
    }
    /**
     * Get notification settings for a user
     */
    async getNotificationSettings(userId) {
        console.log('TCC_DEBUG: Getting notification settings for user:', userId);
        // For now, return default settings
        // This can be expanded to actually store/retrieve user preferences
        return {
            emailNotifications: true,
            smsNotifications: true,
            newTripAlerts: true,
            statusUpdates: true,
            emailAddress: null,
            phoneNumber: null
        };
    }
    /**
     * Update notification settings for a user
     */
    async updateNotificationSettings(userId, settings) {
        console.log('TCC_DEBUG: Updating notification settings for user:', userId, settings);
        // For now, just return success
        // This can be expanded to actually store user preferences
        return { success: true, data: settings, error: null };
    }
    /**
     * Update trip times
     */
    async updateTripTimes(id, times) {
        console.log('TCC_DEBUG: Updating trip times:', { id, times });
        try {
            const updateData = {};
            if (times.transferAcceptedTime) {
                updateData.acceptedTimestamp = new Date(times.transferAcceptedTime);
            }
            if (times.emsArrivalTime) {
                updateData.pickupTimestamp = new Date(times.emsArrivalTime);
            }
            if (times.emsDepartureTime) {
                updateData.completionTimestamp = new Date(times.emsDepartureTime);
            }
            const trip = await prisma.transportRequest.update({
                where: { id },
                data: updateData
            });
            console.log('TCC_DEBUG: Trip times updated successfully:', trip.id);
            return { success: true, data: trip };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error updating trip times:', error);
            return { success: false, error: 'Failed to update trip times' };
        }
    }
    /**
     * Get diagnosis options
     */
    getDiagnosisOptions() {
        return { success: true, data: patientIdService_1.DIAGNOSIS_OPTIONS };
    }
    /**
     * Get mobility options
     */
    getMobilityOptions() {
        return { success: true, data: patientIdService_1.MOBILITY_OPTIONS };
    }
    /**
     * Get transport level options
     */
    getTransportLevelOptions() {
        return { success: true, data: patientIdService_1.TRANSPORT_LEVEL_OPTIONS };
    }
    /**
     * Get urgency options
     */
    getUrgencyOptions() {
        return { success: true, data: patientIdService_1.URGENCY_OPTIONS };
    }
    /**
     * Get insurance options
     */
    async getInsuranceOptions() {
        console.log('TCC_DEBUG: Getting insurance options');
        // For now, return a simple list
        // This can be expanded to query from a database table
        const options = [
            'Medicare',
            'Medicaid',
            'Blue Cross Blue Shield',
            'Aetna',
            'Cigna',
            'UnitedHealth',
            'Self-Pay',
            'Other'
        ];
        return { success: true, data: options };
    }
    /**
     * Create trip with responses
     */
    async createTripWithResponses(data) {
        console.log('TCC_DEBUG: Creating trip with responses:', data);
        // For now, just create a regular trip
        // This can be expanded to handle response-specific logic
        return await this.createEnhancedTrip(data);
    }
    /**
     * Update trip response fields
     */
    async updateTripResponseFields(id, data) {
        console.log('TCC_DEBUG: Updating trip response fields:', { id, data });
        try {
            const trip = await prisma.transportRequest.update({
                where: { id },
                data: {
                    updatedAt: new Date()
                }
            });
            console.log('TCC_DEBUG: Trip response fields updated successfully:', trip.id);
            return { success: true, data: trip };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error updating trip response fields:', error);
            return { success: false, error: 'Failed to update trip response fields' };
        }
    }
    /**
     * Get trip with responses
     */
    async getTripWithResponses(id) {
        console.log('TCC_DEBUG: Getting trip with responses:', id);
        try {
            const trip = await prisma.transportRequest.findUnique({
                where: { id }
            });
            if (!trip) {
                return { success: false, error: 'Trip not found' };
            }
            // For now, return the trip without responses
            // This can be expanded to include agency responses
            return { success: true, data: trip };
        }
        catch (error) {
            console.error('TCC_DEBUG: Error getting trip with responses:', error);
            return { success: false, error: 'Failed to get trip with responses' };
        }
    }
    /**
     * Get trip response summary
     */
    async getTripResponseSummary(id) {
        console.log('TCC_DEBUG: Getting trip response summary:', id);
        // For now, return a simple summary
        // This can be expanded to calculate actual response statistics
        return {
            success: true,
            data: {
                totalResponses: 0,
                acceptedResponses: 0,
                declinedResponses: 0,
                pendingResponses: 0
            },
            error: null
        };
    }
    /**
     * Create agency response
     */
    async createAgencyResponse(data) {
        console.log('TCC_DEBUG: Creating agency response:', data);
        // For now, return a simple success response
        // This can be expanded to actually store agency responses
        return { success: true, data: { id: 'temp-response-id', ...data }, error: null };
    }
    /**
     * Update agency response
     */
    async updateAgencyResponse(id, data) {
        console.log('TCC_DEBUG: Updating agency response:', { id, data });
        // For now, return a simple success response
        // This can be expanded to actually update agency responses
        return { success: true, data: { id, ...data }, error: null };
    }
    /**
     * Get agency responses
     */
    async getAgencyResponses(filters) {
        console.log('TCC_DEBUG: Getting agency responses with filters:', filters);
        // For now, return an empty array
        // This can be expanded to actually query agency responses
        return { success: true, data: [], error: null };
    }
    /**
     * Get agency response by ID
     */
    async getAgencyResponseById(id) {
        console.log('TCC_DEBUG: Getting agency response by ID:', id);
        // For now, return a simple response
        // This can be expanded to actually query agency responses
        return { success: true, data: { id, response: 'PENDING' }, error: null };
    }
    /**
     * Select agency for trip
     */
    async selectAgencyForTrip(tripId, data) {
        console.log('TCC_DEBUG: Selecting agency for trip:', { tripId, data });
        // For now, return a simple success response
        // This can be expanded to actually update trip assignment
        return { success: true, data: { tripId, agencyResponseId: data.agencyResponseId }, error: null };
    }
    /**
     * Validate unit assignment
     */
    async validateUnitAssignment(unitId, agencyId) {
        try {
            console.log('TCC_DEBUG: Validating unit assignment:', { unitId, agencyId });
            const emsDB = databaseManager_1.databaseManager.getEMSDB();
            const unit = await emsDB.unit.findUnique({
                where: { id: unitId },
                include: { agency: true }
            });
            if (!unit) {
                console.log('TCC_DEBUG: Unit not found:', unitId);
                return null;
            }
            if (!unit.isActive) {
                console.log('TCC_DEBUG: Unit is not active:', unitId);
                return null;
            }
            if (unit.status !== 'AVAILABLE') {
                console.log('TCC_DEBUG: Unit is not available:', unitId, 'status:', unit.status);
                return null;
            }
            // If agencyId is provided, validate unit belongs to that agency
            if (agencyId && unit.agencyId !== agencyId) {
                console.log('TCC_DEBUG: Unit does not belong to agency:', unitId, 'agencyId:', agencyId);
                return null;
            }
            console.log('TCC_DEBUG: Unit assignment validated successfully:', unitId);
            return unit;
        }
        catch (error) {
            console.error('TCC_DEBUG: Error validating unit assignment:', error);
            return null;
        }
    }
    /**
     * Update unit status
     */
    async updateUnitStatus(unitId, status) {
        try {
            console.log('TCC_DEBUG: Updating unit status:', { unitId, status });
            const emsDB = databaseManager_1.databaseManager.getEMSDB();
            await emsDB.unit.update({
                where: { id: unitId },
                data: {
                    status: status,
                    updatedAt: new Date()
                }
            });
            console.log('TCC_DEBUG: Unit status updated successfully:', unitId, 'to', status);
        }
        catch (error) {
            console.error('TCC_DEBUG: Error updating unit status:', error);
            // Don't throw error as this is not critical to trip update
        }
    }
}
exports.TripService = TripService;
exports.tripService = new TripService();
//# sourceMappingURL=tripService.js.map