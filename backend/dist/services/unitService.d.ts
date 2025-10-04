export interface Unit {
    id: string;
    agencyId: string;
    unitNumber: string;
    type: string;
    capabilities: string[];
    currentStatus: string;
    currentLocation?: any;
    isActive: boolean;
    assignedTripId?: string;
    lastStatusUpdate: Date;
    statusHistory?: any[];
    currentTripDetails?: any;
    lastKnownLocation?: any;
    locationUpdatedAt?: Date;
    totalTripsCompleted: number;
    averageResponseTime?: number;
    lastMaintenanceDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface UnitFormData {
    unitNumber: string;
    type: string;
    capabilities: string[];
    customCapabilities?: string[];
    isActive: boolean;
}
export interface UnitStatusUpdate {
    status: string;
    reason?: string;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
}
export interface UnitAnalytics {
    totalUnits: number;
    availableUnits: number;
    committedUnits: number;
    outOfServiceUnits: number;
    maintenanceUnits: number;
    offDutyUnits: number;
    averageResponseTime: number;
    totalTripsToday: number;
    efficiency: number;
}
export declare class UnitService {
    private prisma;
    constructor();
    /**
     * Get all units for an agency
     */
    getUnitsByAgency(agencyId: string): Promise<Unit[]>;
    /**
     * Get a single unit by ID
     */
    getUnitById(unitId: string): Promise<Unit | null>;
    /**
     * Create a new unit
     */
    createUnit(agencyId: string, unitData: UnitFormData): Promise<Unit>;
    /**
     * Update unit details
     */
    updateUnit(unitId: string, unitData: Partial<UnitFormData>): Promise<Unit>;
    /**
     * Update unit status
     */
    updateUnitStatus(unitId: string, statusUpdate: UnitStatusUpdate): Promise<Unit>;
    /**
     * Assign trip to unit
     */
    assignTripToUnit(unitId: string, tripId: string, tripDetails: any): Promise<Unit>;
    /**
     * Complete trip assignment
     */
    completeTripAssignment(unitId: string): Promise<Unit>;
    /**
     * Deactivate unit (soft delete)
     */
    deactivateUnit(unitId: string): Promise<Unit>;
    /**
     * Get unit analytics for an agency
     */
    getUnitAnalytics(agencyId: string): Promise<UnitAnalytics>;
    /**
     * Get available units for optimization
     */
    getAvailableUnits(agencyId: string): Promise<Unit[]>;
    /**
     * Map Prisma unit to Unit interface
     */
    private mapPrismaUnitToUnit;
}
//# sourceMappingURL=unitService.d.ts.map