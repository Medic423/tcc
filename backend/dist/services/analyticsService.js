"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const databaseManager_1 = require("./databaseManager");
class AnalyticsService {
    async getSystemOverview() {
        const centerPrisma = databaseManager_1.databaseManager.getCenterDB();
        const emsPrisma = databaseManager_1.databaseManager.getEMSDB();
        const [totalHospitals, activeHospitals, totalAgencies, activeAgencies, totalUnits, activeUnits] = await Promise.all([
            centerPrisma.hospital.count(),
            centerPrisma.hospital.count({ where: { isActive: true } }),
            emsPrisma.eMSAgency.count(),
            emsPrisma.eMSAgency.count({ where: { isActive: true } }),
            emsPrisma.unit.count(),
            emsPrisma.unit.count({ where: { isActive: true } })
        ]);
        return {
            totalHospitals,
            totalAgencies,
            totalFacilities: totalHospitals, // Using hospitals as facilities
            activeHospitals,
            activeAgencies,
            activeFacilities: activeHospitals, // Using hospitals as facilities
            totalUnits,
            activeUnits
        };
    }
    async getTripStatistics() {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const totalTrips = await prisma.trip.count();
        const pendingTrips = await prisma.trip.count({ where: { status: 'PENDING' } });
        const acceptedTrips = await prisma.trip.count({ where: { status: 'ACCEPTED' } });
        const completedTrips = await prisma.trip.count({ where: { status: 'COMPLETED' } });
        const cancelledTrips = await prisma.trip.count({ where: { status: 'CANCELLED' } });
        // Get trips by transport level
        const tripsByLevel = await prisma.trip.groupBy({
            by: ['transportLevel'],
            _count: { transportLevel: true }
        });
        const tripsByLevelFormatted = {
            BLS: 0,
            ALS: 0,
            CCT: 0
        };
        tripsByLevel.forEach((group) => {
            if (group.transportLevel in tripsByLevelFormatted) {
                tripsByLevelFormatted[group.transportLevel] = group._count.transportLevel;
            }
        });
        // Get trips by priority
        const tripsByPriority = await prisma.trip.groupBy({
            by: ['priority'],
            _count: { priority: true }
        });
        const tripsByPriorityFormatted = {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            URGENT: 0
        };
        tripsByPriority.forEach((group) => {
            if (group.priority in tripsByPriorityFormatted) {
                tripsByPriorityFormatted[group.priority] = group._count.priority;
            }
        });
        return {
            totalTrips,
            pendingTrips,
            acceptedTrips,
            completedTrips,
            cancelledTrips,
            tripsByLevel: tripsByLevelFormatted,
            tripsByPriority: tripsByPriorityFormatted
        };
    }
    async getAgencyPerformance() {
        const centerPrisma = databaseManager_1.databaseManager.getCenterDB();
        const emsPrisma = databaseManager_1.databaseManager.getEMSDB();
        const agencies = await emsPrisma.eMSAgency.findMany({
            where: { isActive: true },
        });
        const performanceData = [];
        for (const agency of agencies) {
            // Get trip data for this agency
            const totalTrips = await centerPrisma.trip.count({
                where: { assignedAgencyId: agency.id }
            });
            const acceptedTrips = await centerPrisma.trip.count({
                where: {
                    assignedAgencyId: agency.id,
                    status: 'ACCEPTED'
                }
            });
            const completedTrips = await centerPrisma.trip.count({
                where: {
                    assignedAgencyId: agency.id,
                    status: 'COMPLETED'
                }
            });
            // Get unit data for this agency
            const totalUnits = await emsPrisma.unit.count({
                where: { agencyId: agency.id }
            });
            const activeUnits = await emsPrisma.unit.count({
                where: {
                    agencyId: agency.id,
                    isActive: true
                }
            });
            // Calculate average response time (using completionTimestamp - acceptedTimestamp as proxy)
            const responseTimeData = await centerPrisma.trip.findMany({
                where: {
                    assignedAgencyId: agency.id,
                    acceptedTimestamp: { not: null },
                    completionTimestamp: { not: null }
                },
                select: {
                    acceptedTimestamp: true,
                    completionTimestamp: true
                }
            });
            const averageResponseTime = responseTimeData.length > 0
                ? responseTimeData.reduce((sum, trip) => {
                    const responseTime = trip.acceptedTimestamp && trip.completionTimestamp
                        ? (trip.completionTimestamp.getTime() - trip.acceptedTimestamp.getTime()) / (1000 * 60) // Convert to minutes
                        : 0;
                    return sum + responseTime;
                }, 0) / responseTimeData.length
                : 0;
            performanceData.push({
                agencyId: agency.id,
                agencyName: agency.name,
                totalTrips,
                acceptedTrips,
                completedTrips,
                averageResponseTime,
                totalUnits,
                activeUnits
            });
        }
        return performanceData;
    }
    async getHospitalActivity() {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const hospitals = await prisma.hospital.findMany({
            where: { isActive: true }
        });
        const activityData = [];
        for (const hospital of hospitals) {
            // Get trips for this hospital by location
            const totalTrips = await prisma.trip.count({
                where: {
                    OR: [
                        { fromLocation: hospital.name },
                        { toLocation: hospital.name }
                    ]
                }
            });
            // Get trips by level for this hospital
            const tripsByLevelData = await prisma.trip.groupBy({
                by: ['transportLevel'],
                where: {
                    OR: [
                        { fromLocation: hospital.name },
                        { toLocation: hospital.name }
                    ]
                },
                _count: { transportLevel: true }
            });
            const tripsByLevel = {
                BLS: 0,
                ALS: 0,
                CCT: 0
            };
            tripsByLevelData.forEach((group) => {
                if (group.transportLevel in tripsByLevel) {
                    tripsByLevel[group.transportLevel] = group._count.transportLevel;
                }
            });
            // Get last activity (most recent trip)
            const lastTrip = await prisma.trip.findFirst({
                where: {
                    OR: [
                        { fromLocation: hospital.name },
                        { toLocation: hospital.name }
                    ]
                },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true }
            });
            const lastActivity = lastTrip?.createdAt || new Date();
            activityData.push({
                hospitalId: hospital.id,
                hospitalName: hospital.name,
                totalTrips,
                tripsByLevel,
                lastActivity
            });
        }
        return activityData;
    }
    async getTripCostBreakdowns(tripId, limit = 100) {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const whereClause = tripId ? { tripId } : {};
        const breakdowns = await prisma.tripCostBreakdown.findMany({
            where: whereClause,
            orderBy: { calculatedAt: 'desc' },
            take: limit
        });
        return breakdowns.map((breakdown) => ({
            id: breakdown.id,
            tripId: breakdown.tripId,
            baseRevenue: Number(breakdown.baseRevenue),
            mileageRevenue: Number(breakdown.mileageRevenue),
            priorityRevenue: Number(breakdown.priorityRevenue),
            specialRequirementsRevenue: Number(breakdown.specialRequirementsRevenue),
            insuranceAdjustment: Number(breakdown.insuranceAdjustment),
            totalRevenue: Number(breakdown.totalRevenue),
            crewLaborCost: Number(breakdown.crewLaborCost),
            vehicleCost: Number(breakdown.vehicleCost),
            fuelCost: Number(breakdown.fuelCost),
            maintenanceCost: Number(breakdown.maintenanceCost),
            overheadCost: Number(breakdown.overheadCost),
            totalCost: Number(breakdown.totalCost),
            grossProfit: Number(breakdown.grossProfit),
            profitMargin: Number(breakdown.profitMargin),
            revenuePerMile: Number(breakdown.revenuePerMile),
            costPerMile: Number(breakdown.costPerMile),
            loadedMileRatio: Number(breakdown.loadedMileRatio),
            deadheadMileRatio: Number(breakdown.deadheadMileRatio),
            utilizationRate: Number(breakdown.utilizationRate),
            tripDistance: Number(breakdown.tripDistance),
            loadedMiles: Number(breakdown.loadedMiles),
            deadheadMiles: Number(breakdown.deadheadMiles),
            tripDurationHours: Number(breakdown.tripDurationHours),
            transportLevel: breakdown.transportLevel,
            priorityLevel: breakdown.priorityLevel,
            costCenterId: breakdown.costCenterId,
            costCenterName: breakdown.costCenterName,
            calculatedAt: breakdown.calculatedAt,
            createdAt: breakdown.createdAt,
            updatedAt: breakdown.updatedAt
        }));
    }
    async getCostAnalysisSummary(startDate, endDate) {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const dateFilter = startDate && endDate ? {
            calculatedAt: {
                gte: startDate,
                lte: endDate
            }
        } : {};
        const breakdowns = await prisma.tripCostBreakdown.findMany({
            where: dateFilter
        });
        if (breakdowns.length === 0) {
            return {
                totalRevenue: 0,
                totalCost: 0,
                grossProfit: 0,
                averageProfitMargin: 0,
                totalTrips: 0,
                averageRevenuePerMile: 0,
                averageCostPerMile: 0,
                averageLoadedMileRatio: 0,
                averageDeadheadMileRatio: 0,
                averageUtilizationRate: 0,
                tripsByTransportLevel: {
                    BLS: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
                    ALS: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
                    CCT: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 }
                },
                tripsByPriority: {
                    LOW: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
                    MEDIUM: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
                    HIGH: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
                    URGENT: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 }
                },
                costCenterBreakdown: []
            };
        }
        // Calculate totals
        const totalRevenue = breakdowns.reduce((sum, b) => sum + Number(b.totalRevenue), 0);
        const totalCost = breakdowns.reduce((sum, b) => sum + Number(b.totalCost), 0);
        const grossProfit = totalRevenue - totalCost;
        const averageProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        // Calculate averages
        const averageRevenuePerMile = breakdowns.reduce((sum, b) => sum + Number(b.revenuePerMile), 0) / breakdowns.length;
        const averageCostPerMile = breakdowns.reduce((sum, b) => sum + Number(b.costPerMile), 0) / breakdowns.length;
        const averageLoadedMileRatio = breakdowns.reduce((sum, b) => sum + Number(b.loadedMileRatio), 0) / breakdowns.length;
        const averageDeadheadMileRatio = breakdowns.reduce((sum, b) => sum + Number(b.deadheadMileRatio), 0) / breakdowns.length;
        const averageUtilizationRate = breakdowns.reduce((sum, b) => sum + Number(b.utilizationRate), 0) / breakdowns.length;
        // Group by transport level
        const tripsByTransportLevel = {
            BLS: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
            ALS: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
            CCT: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 }
        };
        breakdowns.forEach((breakdown) => {
            const level = breakdown.transportLevel;
            if (level in tripsByTransportLevel) {
                const revenue = Number(breakdown.totalRevenue);
                const cost = Number(breakdown.totalCost);
                const profit = revenue - cost;
                const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
                tripsByTransportLevel[level].count++;
                tripsByTransportLevel[level].revenue += revenue;
                tripsByTransportLevel[level].cost += cost;
                tripsByTransportLevel[level].profit += profit;
                tripsByTransportLevel[level].margin = tripsByTransportLevel[level].revenue > 0
                    ? (tripsByTransportLevel[level].profit / tripsByTransportLevel[level].revenue) * 100
                    : 0;
            }
        });
        // Group by priority
        const tripsByPriority = {
            LOW: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
            MEDIUM: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
            HIGH: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
            URGENT: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 }
        };
        breakdowns.forEach((breakdown) => {
            const priority = breakdown.priorityLevel;
            if (priority in tripsByPriority) {
                const revenue = Number(breakdown.totalRevenue);
                const cost = Number(breakdown.totalCost);
                const profit = revenue - cost;
                const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
                tripsByPriority[priority].count++;
                tripsByPriority[priority].revenue += revenue;
                tripsByPriority[priority].cost += cost;
                tripsByPriority[priority].profit += profit;
                tripsByPriority[priority].margin = tripsByPriority[priority].revenue > 0
                    ? (tripsByPriority[priority].profit / tripsByPriority[priority].revenue) * 100
                    : 0;
            }
        });
        // Group by cost center
        const costCenterMap = new Map();
        breakdowns.forEach((breakdown) => {
            const costCenterId = breakdown.costCenterId || 'unassigned';
            const costCenterName = breakdown.costCenterName || 'Unassigned';
            if (!costCenterMap.has(costCenterId)) {
                costCenterMap.set(costCenterId, {
                    costCenterId,
                    costCenterName,
                    tripCount: 0,
                    totalRevenue: 0,
                    totalCost: 0,
                    grossProfit: 0,
                    profitMargin: 0
                });
            }
            const center = costCenterMap.get(costCenterId);
            const revenue = Number(breakdown.totalRevenue);
            const cost = Number(breakdown.totalCost);
            const profit = revenue - cost;
            center.tripCount++;
            center.totalRevenue += revenue;
            center.totalCost += cost;
            center.grossProfit += profit;
            center.profitMargin = center.totalRevenue > 0 ? (center.grossProfit / center.totalRevenue) * 100 : 0;
        });
        const costCenterBreakdown = Array.from(costCenterMap.values());
        return {
            totalRevenue,
            totalCost,
            grossProfit,
            averageProfitMargin,
            totalTrips: breakdowns.length,
            averageRevenuePerMile,
            averageCostPerMile,
            averageLoadedMileRatio,
            averageDeadheadMileRatio,
            averageUtilizationRate,
            tripsByTransportLevel,
            tripsByPriority,
            costCenterBreakdown
        };
    }
    async getProfitabilityAnalysis(period = 'month') {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const now = new Date();
        let startDate;
        let previousStartDate;
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                previousStartDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        const currentPeriodEnd = period === 'week' ? now : new Date(startDate.getTime() + (period === 'month' ? 30 : period === 'quarter' ? 90 : 365) * 24 * 60 * 60 * 1000);
        const previousPeriodEnd = new Date(startDate.getTime());
        // Get current period data
        const currentBreakdowns = await prisma.tripCostBreakdown.findMany({
            where: {
                calculatedAt: {
                    gte: startDate,
                    lte: currentPeriodEnd
                }
            }
        });
        // Get previous period data
        const previousBreakdowns = await prisma.tripCostBreakdown.findMany({
            where: {
                calculatedAt: {
                    gte: previousStartDate,
                    lte: previousPeriodEnd
                }
            }
        });
        // Calculate current period metrics
        const currentRevenue = currentBreakdowns.reduce((sum, b) => sum + Number(b.totalRevenue), 0);
        const currentCost = currentBreakdowns.reduce((sum, b) => sum + Number(b.totalCost), 0);
        const currentProfit = currentRevenue - currentCost;
        const currentMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
        // Calculate previous period metrics
        const previousRevenue = previousBreakdowns.reduce((sum, b) => sum + Number(b.totalRevenue), 0);
        const previousCost = previousBreakdowns.reduce((sum, b) => sum + Number(b.totalCost), 0);
        const previousProfit = previousRevenue - previousCost;
        const previousMargin = previousRevenue > 0 ? (previousProfit / previousRevenue) * 100 : 0;
        // Calculate growth rates
        const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        const costGrowth = previousCost > 0 ? ((currentCost - previousCost) / previousCost) * 100 : 0;
        const profitGrowth = previousProfit !== 0 ? ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100 : 0;
        // Calculate efficiency metrics
        const totalHours = currentBreakdowns.reduce((sum, b) => sum + Number(b.tripDurationHours), 0);
        const efficiencyMetrics = {
            loadedMileRatio: currentBreakdowns.reduce((sum, b) => sum + Number(b.loadedMileRatio), 0) / currentBreakdowns.length || 0,
            deadheadMileRatio: currentBreakdowns.reduce((sum, b) => sum + Number(b.deadheadMileRatio), 0) / currentBreakdowns.length || 0,
            utilizationRate: currentBreakdowns.reduce((sum, b) => sum + Number(b.utilizationRate), 0) / currentBreakdowns.length || 0,
            revenuePerHour: totalHours > 0 ? currentRevenue / totalHours : 0,
            costPerHour: totalHours > 0 ? currentCost / totalHours : 0
        };
        return {
            period,
            totalRevenue: currentRevenue,
            totalCost: currentCost,
            grossProfit: currentProfit,
            profitMargin: currentMargin,
            revenueGrowth,
            costGrowth,
            profitGrowth,
            efficiencyMetrics,
            trends: {
                revenue: { current: currentRevenue, previous: previousRevenue, change: revenueGrowth },
                costs: { current: currentCost, previous: previousCost, change: costGrowth },
                profit: { current: currentProfit, previous: previousProfit, change: profitGrowth },
                margin: { current: currentMargin, previous: previousMargin, change: currentMargin - previousMargin }
            }
        };
    }
    async createTripCostBreakdown(tripId, breakdownData) {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const breakdown = await prisma.tripCostBreakdown.create({
            data: {
                tripId,
                baseRevenue: breakdownData.baseRevenue || 0,
                mileageRevenue: breakdownData.mileageRevenue || 0,
                priorityRevenue: breakdownData.priorityRevenue || 0,
                specialRequirementsRevenue: breakdownData.specialRequirementsRevenue || 0,
                insuranceAdjustment: breakdownData.insuranceAdjustment || 0,
                totalRevenue: breakdownData.totalRevenue || 0,
                crewLaborCost: breakdownData.crewLaborCost || 0,
                vehicleCost: breakdownData.vehicleCost || 0,
                fuelCost: breakdownData.fuelCost || 0,
                maintenanceCost: breakdownData.maintenanceCost || 0,
                overheadCost: breakdownData.overheadCost || 0,
                totalCost: breakdownData.totalCost || 0,
                grossProfit: breakdownData.grossProfit || 0,
                profitMargin: breakdownData.profitMargin || 0,
                revenuePerMile: breakdownData.revenuePerMile || 0,
                costPerMile: breakdownData.costPerMile || 0,
                loadedMileRatio: breakdownData.loadedMileRatio || 0,
                deadheadMileRatio: breakdownData.deadheadMileRatio || 0,
                utilizationRate: breakdownData.utilizationRate || 0,
                tripDistance: breakdownData.tripDistance || 0,
                loadedMiles: breakdownData.loadedMiles || 0,
                deadheadMiles: breakdownData.deadheadMiles || 0,
                tripDurationHours: breakdownData.tripDurationHours || 0,
                transportLevel: breakdownData.transportLevel || 'BLS',
                priorityLevel: breakdownData.priorityLevel || 'LOW',
                costCenterId: breakdownData.costCenterId || undefined,
                costCenterName: breakdownData.costCenterName || undefined,
                calculatedAt: breakdownData.calculatedAt || undefined
            }
        });
        return {
            id: breakdown.id,
            tripId: breakdown.tripId,
            baseRevenue: Number(breakdown.baseRevenue),
            mileageRevenue: Number(breakdown.mileageRevenue),
            priorityRevenue: Number(breakdown.priorityRevenue),
            specialRequirementsRevenue: Number(breakdown.specialRequirementsRevenue),
            insuranceAdjustment: Number(breakdown.insuranceAdjustment),
            totalRevenue: Number(breakdown.totalRevenue),
            crewLaborCost: Number(breakdown.crewLaborCost),
            vehicleCost: Number(breakdown.vehicleCost),
            fuelCost: Number(breakdown.fuelCost),
            maintenanceCost: Number(breakdown.maintenanceCost),
            overheadCost: Number(breakdown.overheadCost),
            totalCost: Number(breakdown.totalCost),
            grossProfit: Number(breakdown.grossProfit),
            profitMargin: Number(breakdown.profitMargin),
            revenuePerMile: Number(breakdown.revenuePerMile),
            costPerMile: Number(breakdown.costPerMile),
            loadedMileRatio: Number(breakdown.loadedMileRatio),
            deadheadMileRatio: Number(breakdown.deadheadMileRatio),
            utilizationRate: Number(breakdown.utilizationRate),
            tripDistance: Number(breakdown.tripDistance),
            loadedMiles: Number(breakdown.loadedMiles),
            deadheadMiles: Number(breakdown.deadheadMiles),
            tripDurationHours: Number(breakdown.tripDurationHours),
            transportLevel: breakdown.transportLevel,
            priorityLevel: breakdown.priorityLevel,
            costCenterId: breakdown.costCenterId || undefined,
            costCenterName: breakdown.costCenterName || undefined,
            calculatedAt: breakdown.calculatedAt,
            createdAt: breakdown.createdAt,
            updatedAt: breakdown.updatedAt
        };
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
exports.default = exports.analyticsService;
//# sourceMappingURL=analyticsService.js.map