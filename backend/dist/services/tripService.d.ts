import { CreateAgencyResponseRequest, UpdateAgencyResponseRequest, ResponseSummary, SelectAgencyRequest, TripResponseFilters, CreateTripWithResponsesRequest, UpdateTripResponseFieldsRequest } from '../types/agencyResponse';
export interface CreateTripRequest {
    patientId: string;
    originFacilityId: string;
    destinationFacilityId: string;
    transportLevel: 'BLS' | 'ALS' | 'CCT';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    specialNeeds?: string;
    readyStart: string;
    readyEnd: string;
    isolation: boolean;
    bariatric: boolean;
    createdById: string | null;
}
export interface EnhancedCreateTripRequest {
    patientId?: string;
    patientWeight?: string;
    specialNeeds?: string;
    insuranceCompany?: string;
    fromLocation: string;
    pickupLocationId?: string;
    toLocation: string;
    scheduledTime: string;
    transportLevel: 'BLS' | 'ALS' | 'CCT' | 'Other';
    urgencyLevel: 'Routine' | 'Urgent' | 'Emergent';
    diagnosis?: string;
    mobilityLevel?: 'Ambulatory' | 'Wheelchair' | 'Stretcher' | 'Bed';
    oxygenRequired?: boolean;
    monitoringRequired?: boolean;
    generateQRCode?: boolean;
    selectedAgencies?: string[];
    notificationRadius?: number;
    notes?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdById?: string | null;
}
export interface UpdateTripStatusRequest {
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    assignedAgencyId?: string;
    assignedUnitId?: string;
    acceptedTimestamp?: string;
    pickupTimestamp?: string;
    completionTimestamp?: string;
}
export declare class TripService {
    /**
     * Create a new enhanced transport request
     */
    createEnhancedTrip(data: EnhancedCreateTripRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string;
            toLocation: string;
            scheduledTime: Date;
            transportLevel: string;
            urgencyLevel: string;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            transferRequestTime: Date | null;
            transferAcceptedTime: Date | null;
            emsArrivalTime: Date | null;
            emsDepartureTime: Date | null;
            actualStartTime: Date | null;
            actualEndTime: Date | null;
            priority: string;
            notes: string | null;
            assignedTo: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            completionTimestamp: Date | null;
            actualTripTimeMinutes: number | null;
            backhaulOpportunity: boolean;
            completionTimeMinutes: number | null;
            customerSatisfaction: number | null;
            deadheadMiles: number | null;
            destinationLatitude: number | null;
            destinationLongitude: number | null;
            distanceMiles: number | null;
            efficiency: import("@prisma/client/runtime/library").Decimal | null;
            estimatedTripTimeMinutes: number | null;
            insuranceCompany: string | null;
            insurancePayRate: import("@prisma/client/runtime/library").Decimal | null;
            loadedMiles: import("@prisma/client/runtime/library").Decimal | null;
            originLatitude: number | null;
            originLongitude: number | null;
            perMileRate: import("@prisma/client/runtime/library").Decimal | null;
            performanceScore: import("@prisma/client/runtime/library").Decimal | null;
            requestTimestamp: Date | null;
            responseTimeMinutes: number | null;
            revenuePerHour: import("@prisma/client/runtime/library").Decimal | null;
            tripCost: import("@prisma/client/runtime/library").Decimal | null;
            pickupLocationId: string | null;
            maxResponses: number;
            responseDeadline: Date | null;
            responseStatus: string;
            selectionMode: string;
        };
        message: string;
    }>;
    /**
     * Create a new transport request (legacy method)
     */
    createTrip(data: CreateTripRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string;
            toLocation: string;
            scheduledTime: Date;
            transportLevel: string;
            urgencyLevel: string;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            transferRequestTime: Date | null;
            transferAcceptedTime: Date | null;
            emsArrivalTime: Date | null;
            emsDepartureTime: Date | null;
            actualStartTime: Date | null;
            actualEndTime: Date | null;
            priority: string;
            notes: string | null;
            assignedTo: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            completionTimestamp: Date | null;
            actualTripTimeMinutes: number | null;
            backhaulOpportunity: boolean;
            completionTimeMinutes: number | null;
            customerSatisfaction: number | null;
            deadheadMiles: number | null;
            destinationLatitude: number | null;
            destinationLongitude: number | null;
            distanceMiles: number | null;
            efficiency: import("@prisma/client/runtime/library").Decimal | null;
            estimatedTripTimeMinutes: number | null;
            insuranceCompany: string | null;
            insurancePayRate: import("@prisma/client/runtime/library").Decimal | null;
            loadedMiles: import("@prisma/client/runtime/library").Decimal | null;
            originLatitude: number | null;
            originLongitude: number | null;
            perMileRate: import("@prisma/client/runtime/library").Decimal | null;
            performanceScore: import("@prisma/client/runtime/library").Decimal | null;
            requestTimestamp: Date | null;
            responseTimeMinutes: number | null;
            revenuePerHour: import("@prisma/client/runtime/library").Decimal | null;
            tripCost: import("@prisma/client/runtime/library").Decimal | null;
            pickupLocationId: string | null;
            maxResponses: number;
            responseDeadline: Date | null;
            responseStatus: string;
            selectionMode: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get all transport requests with optional filtering
     */
    getTrips(filters?: {
        status?: string;
        transportLevel?: string;
        priority?: string;
        agencyId?: string;
    }): Promise<{
        success: boolean;
        data: ({
            pickup_locations: {
                id: string;
                name: string;
                hospitals: {
                    id: string;
                    name: string;
                };
                contactPhone: string | null;
                description: string | null;
                contactEmail: string | null;
                floor: string | null;
                room: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string;
            toLocation: string;
            scheduledTime: Date;
            transportLevel: string;
            urgencyLevel: string;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            transferRequestTime: Date | null;
            transferAcceptedTime: Date | null;
            emsArrivalTime: Date | null;
            emsDepartureTime: Date | null;
            actualStartTime: Date | null;
            actualEndTime: Date | null;
            priority: string;
            notes: string | null;
            assignedTo: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            completionTimestamp: Date | null;
            actualTripTimeMinutes: number | null;
            backhaulOpportunity: boolean;
            completionTimeMinutes: number | null;
            customerSatisfaction: number | null;
            deadheadMiles: number | null;
            destinationLatitude: number | null;
            destinationLongitude: number | null;
            distanceMiles: number | null;
            efficiency: import("@prisma/client/runtime/library").Decimal | null;
            estimatedTripTimeMinutes: number | null;
            insuranceCompany: string | null;
            insurancePayRate: import("@prisma/client/runtime/library").Decimal | null;
            loadedMiles: import("@prisma/client/runtime/library").Decimal | null;
            originLatitude: number | null;
            originLongitude: number | null;
            perMileRate: import("@prisma/client/runtime/library").Decimal | null;
            performanceScore: import("@prisma/client/runtime/library").Decimal | null;
            requestTimestamp: Date | null;
            responseTimeMinutes: number | null;
            revenuePerHour: import("@prisma/client/runtime/library").Decimal | null;
            tripCost: import("@prisma/client/runtime/library").Decimal | null;
            pickupLocationId: string | null;
            maxResponses: number;
            responseDeadline: Date | null;
            responseStatus: string;
            selectionMode: string;
        })[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get a single transport request by ID
     */
    getTripById(id: string): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            pickup_locations: {
                id: string;
                name: string;
                hospitals: {
                    id: string;
                    name: string;
                };
                contactPhone: string | null;
                description: string | null;
                contactEmail: string | null;
                floor: string | null;
                room: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string;
            toLocation: string;
            scheduledTime: Date;
            transportLevel: string;
            urgencyLevel: string;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            transferRequestTime: Date | null;
            transferAcceptedTime: Date | null;
            emsArrivalTime: Date | null;
            emsDepartureTime: Date | null;
            actualStartTime: Date | null;
            actualEndTime: Date | null;
            priority: string;
            notes: string | null;
            assignedTo: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            completionTimestamp: Date | null;
            actualTripTimeMinutes: number | null;
            backhaulOpportunity: boolean;
            completionTimeMinutes: number | null;
            customerSatisfaction: number | null;
            deadheadMiles: number | null;
            destinationLatitude: number | null;
            destinationLongitude: number | null;
            distanceMiles: number | null;
            efficiency: import("@prisma/client/runtime/library").Decimal | null;
            estimatedTripTimeMinutes: number | null;
            insuranceCompany: string | null;
            insurancePayRate: import("@prisma/client/runtime/library").Decimal | null;
            loadedMiles: import("@prisma/client/runtime/library").Decimal | null;
            originLatitude: number | null;
            originLongitude: number | null;
            perMileRate: import("@prisma/client/runtime/library").Decimal | null;
            performanceScore: import("@prisma/client/runtime/library").Decimal | null;
            requestTimestamp: Date | null;
            responseTimeMinutes: number | null;
            revenuePerHour: import("@prisma/client/runtime/library").Decimal | null;
            tripCost: import("@prisma/client/runtime/library").Decimal | null;
            pickupLocationId: string | null;
            maxResponses: number;
            responseDeadline: Date | null;
            responseStatus: string;
            selectionMode: string;
        };
        error?: undefined;
    }>;
    /**
     * Update trip status (accept/decline/complete)
     */
    updateTripStatus(id: string, data: UpdateTripStatusRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string;
            toLocation: string;
            scheduledTime: Date;
            transportLevel: string;
            urgencyLevel: string;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            transferRequestTime: Date | null;
            transferAcceptedTime: Date | null;
            emsArrivalTime: Date | null;
            emsDepartureTime: Date | null;
            actualStartTime: Date | null;
            actualEndTime: Date | null;
            priority: string;
            notes: string | null;
            assignedTo: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            completionTimestamp: Date | null;
            actualTripTimeMinutes: number | null;
            backhaulOpportunity: boolean;
            completionTimeMinutes: number | null;
            customerSatisfaction: number | null;
            deadheadMiles: number | null;
            destinationLatitude: number | null;
            destinationLongitude: number | null;
            distanceMiles: number | null;
            efficiency: import("@prisma/client/runtime/library").Decimal | null;
            estimatedTripTimeMinutes: number | null;
            insuranceCompany: string | null;
            insurancePayRate: import("@prisma/client/runtime/library").Decimal | null;
            loadedMiles: import("@prisma/client/runtime/library").Decimal | null;
            originLatitude: number | null;
            originLongitude: number | null;
            perMileRate: import("@prisma/client/runtime/library").Decimal | null;
            performanceScore: import("@prisma/client/runtime/library").Decimal | null;
            requestTimestamp: Date | null;
            responseTimeMinutes: number | null;
            revenuePerHour: import("@prisma/client/runtime/library").Decimal | null;
            tripCost: import("@prisma/client/runtime/library").Decimal | null;
            pickupLocationId: string | null;
            maxResponses: number;
            responseDeadline: Date | null;
            responseStatus: string;
            selectionMode: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get available EMS agencies for assignment
     */
    getAvailableAgencies(): Promise<{
        success: boolean;
        data: {
            email: string;
            id: string;
            name: string;
            phone: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            latitude: number | null;
            longitude: number | null;
            capabilities: string[];
            operatingHours: import("@prisma/client/runtime/library").JsonValue | null;
            requiresReview: boolean;
            approvedAt: Date | null;
            approvedBy: string | null;
            contactName: string;
            serviceArea: string[];
            pricingStructure: import("@prisma/client/runtime/library").JsonValue | null;
            status: string;
            addedBy: string | null;
            addedAt: Date;
            acceptsNotifications: boolean;
            availableUnits: number;
            lastUpdated: Date;
            notificationMethods: string[];
            serviceRadius: number | null;
            totalUnits: number;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Send email notifications for new trip requests
     */
    private sendNewTripNotifications;
    /**
     * Send email notifications for trip status updates
     */
    private sendStatusUpdateNotifications;
    /**
     * Get email notification settings for a user
     */
    getNotificationSettings(userId: string): Promise<any>;
    /**
     * Update email notification settings for a user
     */
    updateNotificationSettings(userId: string, settings: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
    /**
     * Get agencies within distance for a hospital
     */
    getAgenciesForHospital(hospitalId: string, radiusMiles?: number): Promise<{
        success: boolean;
        data: {
            email: string;
            id: string;
            name: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            capabilities: string[];
            contactName: string;
            serviceArea: string[];
        }[];
        message: string;
    }>;
    /**
     * Update trip time tracking
     */
    updateTripTimes(tripId: string, timeUpdates: {
        transferAcceptedTime?: string;
        emsArrivalTime?: string;
        emsDepartureTime?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string;
            toLocation: string;
            scheduledTime: Date;
            transportLevel: string;
            urgencyLevel: string;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            transferRequestTime: Date | null;
            transferAcceptedTime: Date | null;
            emsArrivalTime: Date | null;
            emsDepartureTime: Date | null;
            actualStartTime: Date | null;
            actualEndTime: Date | null;
            priority: string;
            notes: string | null;
            assignedTo: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            completionTimestamp: Date | null;
            actualTripTimeMinutes: number | null;
            backhaulOpportunity: boolean;
            completionTimeMinutes: number | null;
            customerSatisfaction: number | null;
            deadheadMiles: number | null;
            destinationLatitude: number | null;
            destinationLongitude: number | null;
            distanceMiles: number | null;
            efficiency: import("@prisma/client/runtime/library").Decimal | null;
            estimatedTripTimeMinutes: number | null;
            insuranceCompany: string | null;
            insurancePayRate: import("@prisma/client/runtime/library").Decimal | null;
            loadedMiles: import("@prisma/client/runtime/library").Decimal | null;
            originLatitude: number | null;
            originLongitude: number | null;
            perMileRate: import("@prisma/client/runtime/library").Decimal | null;
            performanceScore: import("@prisma/client/runtime/library").Decimal | null;
            requestTimestamp: Date | null;
            responseTimeMinutes: number | null;
            revenuePerHour: import("@prisma/client/runtime/library").Decimal | null;
            tripCost: import("@prisma/client/runtime/library").Decimal | null;
            pickupLocationId: string | null;
            maxResponses: number;
            responseDeadline: Date | null;
            responseStatus: string;
            selectionMode: string;
        };
        message: string;
    }>;
    /**
     * Get diagnosis options
     */
    getDiagnosisOptions(): {
        success: boolean;
        data: readonly ["UTI", "Dialysis", "Cardiac", "Respiratory", "Neurological", "Orthopedic", "General Medical", "Other"];
        message: string;
    };
    /**
     * Get mobility options
     */
    getMobilityOptions(): {
        success: boolean;
        data: readonly ["Ambulatory", "Wheelchair", "Stretcher", "Bed"];
        message: string;
    };
    /**
     * Get transport level options
     */
    getTransportLevelOptions(): {
        success: boolean;
        data: readonly ["BLS", "ALS", "CCT", "Other"];
        message: string;
    };
    /**
     * Get urgency options
     */
    getUrgencyOptions(): {
        success: boolean;
        data: readonly ["Routine", "Urgent", "Emergent"];
        message: string;
    };
    /**
     * Get insurance company options
     */
    getInsuranceOptions(): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    /**
     * Calculate trip revenue based on transport level, priority, and special needs
     */
    private calculateTripRevenue;
    /**
     * Calculate insurance-specific pricing rates
     */
    private calculateInsurancePricing;
    /**
     * Get trip history with timeline and filtering
     */
    getTripHistory(filters: {
        status?: string;
        agencyId?: string;
        dateFrom?: string;
        dateTo?: string;
        limit: number;
        offset: number;
        search?: string;
    }): Promise<{
        success: boolean;
        data: {
            trips: {
                id: string;
                tripNumber: string;
                patientId: string;
                fromLocation: string;
                toLocation: string;
                status: string;
                priority: string;
                transportLevel: string;
                urgencyLevel: string;
                timeline: {
                    event: string;
                    timestamp: any;
                    description: string;
                }[];
                assignedAgencyId: string | null;
                assignedUnitId: string | null;
                assignedTo: string | null;
                responseTimeMinutes: number | null;
                tripDurationMinutes: number | null;
                distanceMiles: number | null;
                tripCost: import("@prisma/client/runtime/library").Decimal | null;
                createdAt: Date;
                updatedAt: Date;
                pickupLocation: {
                    name: string;
                    hospitals: {
                        name: string;
                    };
                } | null;
            }[];
            pagination: {
                total: number;
                limit: number;
                offset: number;
                hasMore: boolean;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Build timeline for a trip based on available timestamps
     */
    private buildTripTimeline;
    /**
     * Create a new agency response
     */
    createAgencyResponse(data: CreateAgencyResponseRequest): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agencyId: string;
            tripId: string;
            response: string;
            responseTimestamp: Date;
            responseNotes: string | null;
            estimatedArrival: Date | null;
            isSelected: boolean;
        };
        error?: undefined;
    }>;
    /**
     * Update an existing agency response
     */
    updateAgencyResponse(responseId: string, data: UpdateAgencyResponseRequest): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agencyId: string;
            tripId: string;
            response: string;
            responseTimestamp: Date;
            responseNotes: string | null;
            estimatedArrival: Date | null;
            isSelected: boolean;
        };
        error?: undefined;
    }>;
    /**
     * Get agency responses with optional filtering
     */
    getAgencyResponses(filters?: TripResponseFilters): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agencyId: string;
            tripId: string;
            response: string;
            responseTimestamp: Date;
            responseNotes: string | null;
            estimatedArrival: Date | null;
            isSelected: boolean;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get a single agency response by ID
     */
    getAgencyResponseById(responseId: string): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agencyId: string;
            tripId: string;
            response: string;
            responseTimestamp: Date;
            responseNotes: string | null;
            estimatedArrival: Date | null;
            isSelected: boolean;
        };
        error?: undefined;
    }>;
    /**
     * Select an agency for a trip
     */
    selectAgencyForTrip(tripId: string, data: SelectAgencyRequest): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        error?: undefined;
    }>;
    /**
     * Get trip with all agency responses
     */
    getTripWithResponses(tripId: string): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            agencyResponses: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                agencyId: string;
                tripId: string;
                response: string;
                responseTimestamp: Date;
                responseNotes: string | null;
                estimatedArrival: Date | null;
                isSelected: boolean;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string;
            toLocation: string;
            scheduledTime: Date;
            transportLevel: string;
            urgencyLevel: string;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            transferRequestTime: Date | null;
            transferAcceptedTime: Date | null;
            emsArrivalTime: Date | null;
            emsDepartureTime: Date | null;
            actualStartTime: Date | null;
            actualEndTime: Date | null;
            priority: string;
            notes: string | null;
            assignedTo: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            completionTimestamp: Date | null;
            actualTripTimeMinutes: number | null;
            backhaulOpportunity: boolean;
            completionTimeMinutes: number | null;
            customerSatisfaction: number | null;
            deadheadMiles: number | null;
            destinationLatitude: number | null;
            destinationLongitude: number | null;
            distanceMiles: number | null;
            efficiency: import("@prisma/client/runtime/library").Decimal | null;
            estimatedTripTimeMinutes: number | null;
            insuranceCompany: string | null;
            insurancePayRate: import("@prisma/client/runtime/library").Decimal | null;
            loadedMiles: import("@prisma/client/runtime/library").Decimal | null;
            originLatitude: number | null;
            originLongitude: number | null;
            perMileRate: import("@prisma/client/runtime/library").Decimal | null;
            performanceScore: import("@prisma/client/runtime/library").Decimal | null;
            requestTimestamp: Date | null;
            responseTimeMinutes: number | null;
            revenuePerHour: import("@prisma/client/runtime/library").Decimal | null;
            tripCost: import("@prisma/client/runtime/library").Decimal | null;
            pickupLocationId: string | null;
            maxResponses: number;
            responseDeadline: Date | null;
            responseStatus: string;
            selectionMode: string;
        };
        error?: undefined;
    }>;
    /**
     * Get response summary for a trip
     */
    getTripResponseSummary(tripId: string): Promise<{
        success: boolean;
        data: ResponseSummary;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Create a trip with response handling capabilities
     */
    createTripWithResponses(data: CreateTripWithResponsesRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string;
            toLocation: string;
            scheduledTime: Date;
            transportLevel: string;
            urgencyLevel: string;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            transferRequestTime: Date | null;
            transferAcceptedTime: Date | null;
            emsArrivalTime: Date | null;
            emsDepartureTime: Date | null;
            actualStartTime: Date | null;
            actualEndTime: Date | null;
            priority: string;
            notes: string | null;
            assignedTo: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            completionTimestamp: Date | null;
            actualTripTimeMinutes: number | null;
            backhaulOpportunity: boolean;
            completionTimeMinutes: number | null;
            customerSatisfaction: number | null;
            deadheadMiles: number | null;
            destinationLatitude: number | null;
            destinationLongitude: number | null;
            distanceMiles: number | null;
            efficiency: import("@prisma/client/runtime/library").Decimal | null;
            estimatedTripTimeMinutes: number | null;
            insuranceCompany: string | null;
            insurancePayRate: import("@prisma/client/runtime/library").Decimal | null;
            loadedMiles: import("@prisma/client/runtime/library").Decimal | null;
            originLatitude: number | null;
            originLongitude: number | null;
            perMileRate: import("@prisma/client/runtime/library").Decimal | null;
            performanceScore: import("@prisma/client/runtime/library").Decimal | null;
            requestTimestamp: Date | null;
            responseTimeMinutes: number | null;
            revenuePerHour: import("@prisma/client/runtime/library").Decimal | null;
            tripCost: import("@prisma/client/runtime/library").Decimal | null;
            pickupLocationId: string | null;
            maxResponses: number;
            responseDeadline: Date | null;
            responseStatus: string;
            selectionMode: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
        message?: undefined;
    }>;
    /**
     * Update trip response fields
     */
    updateTripResponseFields(tripId: string, data: UpdateTripResponseFieldsRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string;
            toLocation: string;
            scheduledTime: Date;
            transportLevel: string;
            urgencyLevel: string;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            transferRequestTime: Date | null;
            transferAcceptedTime: Date | null;
            emsArrivalTime: Date | null;
            emsDepartureTime: Date | null;
            actualStartTime: Date | null;
            actualEndTime: Date | null;
            priority: string;
            notes: string | null;
            assignedTo: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            completionTimestamp: Date | null;
            actualTripTimeMinutes: number | null;
            backhaulOpportunity: boolean;
            completionTimeMinutes: number | null;
            customerSatisfaction: number | null;
            deadheadMiles: number | null;
            destinationLatitude: number | null;
            destinationLongitude: number | null;
            distanceMiles: number | null;
            efficiency: import("@prisma/client/runtime/library").Decimal | null;
            estimatedTripTimeMinutes: number | null;
            insuranceCompany: string | null;
            insurancePayRate: import("@prisma/client/runtime/library").Decimal | null;
            loadedMiles: import("@prisma/client/runtime/library").Decimal | null;
            originLatitude: number | null;
            originLongitude: number | null;
            perMileRate: import("@prisma/client/runtime/library").Decimal | null;
            performanceScore: import("@prisma/client/runtime/library").Decimal | null;
            requestTimestamp: Date | null;
            responseTimeMinutes: number | null;
            revenuePerHour: import("@prisma/client/runtime/library").Decimal | null;
            tripCost: import("@prisma/client/runtime/library").Decimal | null;
            pickupLocationId: string | null;
            maxResponses: number;
            responseDeadline: Date | null;
            responseStatus: string;
            selectionMode: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
}
export declare const tripService: TripService;
//# sourceMappingURL=tripService.d.ts.map