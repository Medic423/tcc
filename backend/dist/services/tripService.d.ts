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
export interface UpdateTripStatusRequest {
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    assignedAgencyId?: string;
    assignedUnitId?: string;
    acceptedTimestamp?: string;
    pickupTimestamp?: string;
    completionTimestamp?: string;
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
}
export declare class TripService {
    /**
     * Create a new transport request
     */
    createTrip(data: CreateTripRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            priority: string;
            notes: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            requestTimestamp: Date;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            specialRequirements: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
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
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            priority: string;
            notes: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            requestTimestamp: Date;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            specialRequirements: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
        }[];
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            priority: string;
            notes: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            requestTimestamp: Date;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            specialRequirements: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
        };
        error?: undefined;
    }>;
    /**
     * Update trip status
     */
    updateTripStatus(id: string, data: UpdateTripStatusRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            priority: string;
            notes: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            requestTimestamp: Date;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            specialRequirements: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get agencies for a specific hospital (simplified version)
     */
    getAgenciesForHospital(hospitalId: string): Promise<{
        success: boolean;
        data: {
            email: string;
            id: string;
            name: string;
            phone: string;
            city: string;
            state: string;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Create an enhanced transport request
     */
    createEnhancedTrip(data: EnhancedCreateTripRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            priority: string;
            notes: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            requestTimestamp: Date;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            specialRequirements: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get trip history with filtering
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            priority: string;
            notes: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            requestTimestamp: Date;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            specialRequirements: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get available agencies
     */
    getAvailableAgencies(): Promise<{
        success: boolean;
        data: {
            email: string;
            id: string;
            name: string;
            phone: string;
            city: string;
            state: string;
            capabilities: string[];
            serviceArea: string[];
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get notification settings for a user
     */
    getNotificationSettings(userId: string): Promise<{
        emailNotifications: boolean;
        smsNotifications: boolean;
        newTripAlerts: boolean;
        statusUpdates: boolean;
        emailAddress: null;
        phoneNumber: null;
    }>;
    /**
     * Update notification settings for a user
     */
    updateNotificationSettings(userId: string, settings: any): Promise<{
        success: boolean;
        data: any;
        error: null;
    }>;
    /**
     * Update trip times
     */
    updateTripTimes(id: string, times: {
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
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            priority: string;
            notes: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            requestTimestamp: Date;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            specialRequirements: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get diagnosis options
     */
    getDiagnosisOptions(): {
        success: boolean;
        data: readonly ["UTI", "Dialysis", "Cardiac", "Respiratory", "Neurological", "Orthopedic", "General Medical", "Other"];
    };
    /**
     * Get mobility options
     */
    getMobilityOptions(): {
        success: boolean;
        data: readonly ["Ambulatory", "Wheelchair", "Stretcher", "Bed"];
    };
    /**
     * Get transport level options
     */
    getTransportLevelOptions(): {
        success: boolean;
        data: readonly ["BLS", "ALS", "CCT", "Other"];
    };
    /**
     * Get urgency options
     */
    getUrgencyOptions(): {
        success: boolean;
        data: readonly ["Routine", "Urgent", "Emergent"];
    };
    /**
     * Get insurance options
     */
    getInsuranceOptions(): Promise<{
        success: boolean;
        data: string[];
    }>;
    /**
     * Create trip with responses
     */
    createTripWithResponses(data: any): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            priority: string;
            notes: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            requestTimestamp: Date;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            specialRequirements: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Update trip response fields
     */
    updateTripResponseFields(id: string, data: any): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            priority: string;
            notes: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            requestTimestamp: Date;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            specialRequirements: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get trip with responses
     */
    getTripWithResponses(id: string): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            priority: string;
            notes: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            requestTimestamp: Date;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            specialRequirements: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
        };
        error?: undefined;
    }>;
    /**
     * Get trip response summary
     */
    getTripResponseSummary(id: string): Promise<{
        success: boolean;
        data: {
            totalResponses: number;
            acceptedResponses: number;
            declinedResponses: number;
            pendingResponses: number;
        };
        error: null;
    }>;
    /**
     * Create agency response
     */
    createAgencyResponse(data: any): Promise<{
        success: boolean;
        data: any;
        error: null;
    }>;
    /**
     * Update agency response
     */
    updateAgencyResponse(id: string, data: any): Promise<{
        success: boolean;
        data: any;
        error: null;
    }>;
    /**
     * Get agency responses
     */
    getAgencyResponses(filters: any): Promise<{
        success: boolean;
        data: never[];
        error: null;
    }>;
    /**
     * Get agency response by ID
     */
    getAgencyResponseById(id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            response: string;
        };
        error: null;
    }>;
    /**
     * Select agency for trip
     */
    selectAgencyForTrip(tripId: string, data: any): Promise<{
        success: boolean;
        data: {
            tripId: string;
            agencyResponseId: any;
        };
        error: null;
    }>;
}
export declare const tripService: TripService;
//# sourceMappingURL=tripService.d.ts.map