export interface SystemOverview {
    totalHospitals: number;
    totalAgencies: number;
    totalFacilities: number;
    activeHospitals: number;
    activeAgencies: number;
    activeFacilities: number;
    totalUnits: number;
    activeUnits: number;
}
export interface TripStatistics {
    totalTrips: number;
    pendingTrips: number;
    acceptedTrips: number;
    completedTrips: number;
    cancelledTrips: number;
    tripsByLevel: {
        BLS: number;
        ALS: number;
        CCT: number;
    };
    tripsByPriority: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
        URGENT: number;
    };
}
export interface AgencyPerformance {
    agencyId: string;
    agencyName: string;
    totalTrips: number;
    acceptedTrips: number;
    completedTrips: number;
    averageResponseTime: number;
    totalUnits: number;
    activeUnits: number;
}
export interface HospitalActivity {
    hospitalId: string;
    hospitalName: string;
    totalTrips: number;
    tripsByLevel: {
        BLS: number;
        ALS: number;
        CCT: number;
    };
    lastActivity: Date;
}
export interface TripCostBreakdown {
    id: string;
    tripId: string;
    baseRevenue: number;
    mileageRevenue: number;
    priorityRevenue: number;
    specialRequirementsRevenue: number;
    insuranceAdjustment: number;
    totalRevenue: number;
    crewLaborCost: number;
    vehicleCost: number;
    fuelCost: number;
    maintenanceCost: number;
    overheadCost: number;
    totalCost: number;
    grossProfit: number;
    profitMargin: number;
    revenuePerMile: number;
    costPerMile: number;
    loadedMileRatio: number;
    deadheadMileRatio: number;
    utilizationRate: number;
    tripDistance: number;
    loadedMiles: number;
    deadheadMiles: number;
    tripDurationHours: number;
    transportLevel: string;
    priorityLevel: string;
    costCenterId?: string;
    costCenterName?: string;
    calculatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface CostAnalysisSummary {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    averageProfitMargin: number;
    totalTrips: number;
    averageRevenuePerMile: number;
    averageCostPerMile: number;
    averageLoadedMileRatio: number;
    averageDeadheadMileRatio: number;
    averageUtilizationRate: number;
    tripsByTransportLevel: {
        BLS: {
            count: number;
            revenue: number;
            cost: number;
            profit: number;
            margin: number;
        };
        ALS: {
            count: number;
            revenue: number;
            cost: number;
            profit: number;
            margin: number;
        };
        CCT: {
            count: number;
            revenue: number;
            cost: number;
            profit: number;
            margin: number;
        };
    };
    tripsByPriority: {
        LOW: {
            count: number;
            revenue: number;
            cost: number;
            profit: number;
            margin: number;
        };
        MEDIUM: {
            count: number;
            revenue: number;
            cost: number;
            profit: number;
            margin: number;
        };
        HIGH: {
            count: number;
            revenue: number;
            cost: number;
            profit: number;
            margin: number;
        };
        URGENT: {
            count: number;
            revenue: number;
            cost: number;
            profit: number;
            margin: number;
        };
    };
    costCenterBreakdown: {
        costCenterId: string;
        costCenterName: string;
        tripCount: number;
        totalRevenue: number;
        totalCost: number;
        grossProfit: number;
        profitMargin: number;
    }[];
}
export interface ProfitabilityAnalysis {
    period: string;
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    profitMargin: number;
    revenueGrowth: number;
    costGrowth: number;
    profitGrowth: number;
    efficiencyMetrics: {
        loadedMileRatio: number;
        deadheadMileRatio: number;
        utilizationRate: number;
        revenuePerHour: number;
        costPerHour: number;
    };
    trends: {
        revenue: {
            current: number;
            previous: number;
            change: number;
        };
        costs: {
            current: number;
            previous: number;
            change: number;
        };
        profit: {
            current: number;
            previous: number;
            change: number;
        };
        margin: {
            current: number;
            previous: number;
            change: number;
        };
    };
}
export declare class AnalyticsService {
    getSystemOverview(): Promise<SystemOverview>;
    getTripStatistics(): Promise<TripStatistics>;
    getAgencyPerformance(): Promise<AgencyPerformance[]>;
    getHospitalActivity(): Promise<HospitalActivity[]>;
    getTripCostBreakdowns(tripId?: string, limit?: number): Promise<TripCostBreakdown[]>;
    getCostAnalysisSummary(startDate?: Date, endDate?: Date): Promise<CostAnalysisSummary>;
    getProfitabilityAnalysis(period?: string): Promise<ProfitabilityAnalysis>;
    createTripCostBreakdown(tripId: string, breakdownData: Partial<TripCostBreakdown>): Promise<TripCostBreakdown>;
}
export declare const analyticsService: AnalyticsService;
export default analyticsService;
//# sourceMappingURL=analyticsService.d.ts.map