"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
var databaseManager_1 = require("./databaseManager");
var AnalyticsService = /** @class */ (function () {
    function AnalyticsService() {
    }
    AnalyticsService.prototype.getSystemOverview = function () {
        return __awaiter(this, void 0, void 0, function () {
            var centerPrisma, emsPrisma, _a, totalHospitals, activeHospitals, totalAgencies, activeAgencies, totalUnits, activeUnits;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        centerPrisma = databaseManager_1.databaseManager.getCenterDB();
                        emsPrisma = databaseManager_1.databaseManager.getEMSDB();
                        return [4 /*yield*/, Promise.all([
                                centerPrisma.hospital.count(),
                                centerPrisma.hospital.count({ where: { isActive: true } }),
                                emsPrisma.eMSAgency.count(),
                                emsPrisma.eMSAgency.count({ where: { isActive: true } }),
                                emsPrisma.unit.count(),
                                emsPrisma.unit.count({ where: { isActive: true } })
                            ])];
                    case 1:
                        _a = _b.sent(), totalHospitals = _a[0], activeHospitals = _a[1], totalAgencies = _a[2], activeAgencies = _a[3], totalUnits = _a[4], activeUnits = _a[5];
                        return [2 /*return*/, {
                                totalHospitals: totalHospitals,
                                totalAgencies: totalAgencies,
                                totalFacilities: totalHospitals, // Using hospitals as facilities
                                activeHospitals: activeHospitals,
                                activeAgencies: activeAgencies,
                                activeFacilities: activeHospitals, // Using hospitals as facilities
                                totalUnits: totalUnits,
                                activeUnits: activeUnits
                            }];
                }
            });
        });
    };
    AnalyticsService.prototype.getTripStatistics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prisma, totalTrips, pendingTrips, acceptedTrips, completedTrips, cancelledTrips, tripsByLevel, tripsByLevelFormatted, tripsByPriority, tripsByPriorityFormatted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        return [4 /*yield*/, prisma.trip.count()];
                    case 1:
                        totalTrips = _a.sent();
                        return [4 /*yield*/, prisma.trip.count({ where: { status: 'PENDING' } })];
                    case 2:
                        pendingTrips = _a.sent();
                        return [4 /*yield*/, prisma.trip.count({ where: { status: 'ACCEPTED' } })];
                    case 3:
                        acceptedTrips = _a.sent();
                        return [4 /*yield*/, prisma.trip.count({ where: { status: 'COMPLETED' } })];
                    case 4:
                        completedTrips = _a.sent();
                        return [4 /*yield*/, prisma.trip.count({ where: { status: 'CANCELLED' } })];
                    case 5:
                        cancelledTrips = _a.sent();
                        return [4 /*yield*/, prisma.trip.groupBy({
                                by: ['transportLevel'],
                                _count: { transportLevel: true }
                            })];
                    case 6:
                        tripsByLevel = _a.sent();
                        tripsByLevelFormatted = {
                            BLS: 0,
                            ALS: 0,
                            CCT: 0
                        };
                        tripsByLevel.forEach(function (group) {
                            if (group.transportLevel in tripsByLevelFormatted) {
                                tripsByLevelFormatted[group.transportLevel] = group._count.transportLevel;
                            }
                        });
                        return [4 /*yield*/, prisma.trip.groupBy({
                                by: ['priority'],
                                _count: { priority: true }
                            })];
                    case 7:
                        tripsByPriority = _a.sent();
                        tripsByPriorityFormatted = {
                            LOW: 0,
                            MEDIUM: 0,
                            HIGH: 0,
                            URGENT: 0
                        };
                        tripsByPriority.forEach(function (group) {
                            if (group.priority in tripsByPriorityFormatted) {
                                tripsByPriorityFormatted[group.priority] = group._count.priority;
                            }
                        });
                        return [2 /*return*/, {
                                totalTrips: totalTrips,
                                pendingTrips: pendingTrips,
                                acceptedTrips: acceptedTrips,
                                completedTrips: completedTrips,
                                cancelledTrips: cancelledTrips,
                                tripsByLevel: tripsByLevelFormatted,
                                tripsByPriority: tripsByPriorityFormatted
                            }];
                }
            });
        });
    };
    AnalyticsService.prototype.getAgencyPerformance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var centerPrisma, emsPrisma, agencies, performanceData, _i, agencies_1, agency, totalTrips, acceptedTrips, completedTrips, totalUnits, activeUnits, responseTimeData, averageResponseTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        centerPrisma = databaseManager_1.databaseManager.getCenterDB();
                        emsPrisma = databaseManager_1.databaseManager.getEMSDB();
                        return [4 /*yield*/, emsPrisma.eMSAgency.findMany({
                                where: { isActive: true },
                            })];
                    case 1:
                        agencies = _a.sent();
                        performanceData = [];
                        _i = 0, agencies_1 = agencies;
                        _a.label = 2;
                    case 2:
                        if (!(_i < agencies_1.length)) return [3 /*break*/, 10];
                        agency = agencies_1[_i];
                        return [4 /*yield*/, centerPrisma.trip.count({
                                where: { assignedAgencyId: agency.id }
                            })];
                    case 3:
                        totalTrips = _a.sent();
                        return [4 /*yield*/, centerPrisma.trip.count({
                                where: {
                                    assignedAgencyId: agency.id,
                                    status: 'ACCEPTED'
                                }
                            })];
                    case 4:
                        acceptedTrips = _a.sent();
                        return [4 /*yield*/, centerPrisma.trip.count({
                                where: {
                                    assignedAgencyId: agency.id,
                                    status: 'COMPLETED'
                                }
                            })];
                    case 5:
                        completedTrips = _a.sent();
                        return [4 /*yield*/, emsPrisma.unit.count({
                                where: { agencyId: agency.id }
                            })];
                    case 6:
                        totalUnits = _a.sent();
                        return [4 /*yield*/, emsPrisma.unit.count({
                                where: {
                                    agencyId: agency.id,
                                    isActive: true
                                }
                            })];
                    case 7:
                        activeUnits = _a.sent();
                        return [4 /*yield*/, centerPrisma.trip.findMany({
                                where: {
                                    assignedAgencyId: agency.id,
                                    acceptedTimestamp: { not: null },
                                    completionTimestamp: { not: null }
                                },
                                select: {
                                    acceptedTimestamp: true,
                                    completionTimestamp: true
                                }
                            })];
                    case 8:
                        responseTimeData = _a.sent();
                        averageResponseTime = responseTimeData.length > 0
                            ? responseTimeData.reduce(function (sum, trip) {
                                var responseTime = trip.acceptedTimestamp && trip.completionTimestamp
                                    ? (trip.completionTimestamp.getTime() - trip.acceptedTimestamp.getTime()) / (1000 * 60) // Convert to minutes
                                    : 0;
                                return sum + responseTime;
                            }, 0) / responseTimeData.length
                            : 0;
                        performanceData.push({
                            agencyId: agency.id,
                            agencyName: agency.name,
                            totalTrips: totalTrips,
                            acceptedTrips: acceptedTrips,
                            completedTrips: completedTrips,
                            averageResponseTime: averageResponseTime,
                            totalUnits: totalUnits,
                            activeUnits: activeUnits
                        });
                        _a.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 2];
                    case 10: return [2 /*return*/, performanceData];
                }
            });
        });
    };
    AnalyticsService.prototype.getHospitalActivity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prisma, hospitals, activityData, _loop_1, _i, hospitals_1, hospital;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        return [4 /*yield*/, prisma.hospital.findMany({
                                where: { isActive: true }
                            })];
                    case 1:
                        hospitals = _a.sent();
                        activityData = [];
                        _loop_1 = function (hospital) {
                            var totalTrips, tripsByLevelData, tripsByLevel, lastTrip, lastActivity;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, prisma.trip.count({
                                            where: {
                                                OR: [
                                                    { fromLocation: hospital.name },
                                                    { toLocation: hospital.name }
                                                ]
                                            }
                                        })];
                                    case 1:
                                        totalTrips = _b.sent();
                                        return [4 /*yield*/, prisma.trip.groupBy({
                                                by: ['transportLevel'],
                                                where: {
                                                    OR: [
                                                        { fromLocation: hospital.name },
                                                        { toLocation: hospital.name }
                                                    ]
                                                },
                                                _count: { transportLevel: true }
                                            })];
                                    case 2:
                                        tripsByLevelData = _b.sent();
                                        tripsByLevel = {
                                            BLS: 0,
                                            ALS: 0,
                                            CCT: 0
                                        };
                                        tripsByLevelData.forEach(function (group) {
                                            if (group.transportLevel in tripsByLevel) {
                                                tripsByLevel[group.transportLevel] = group._count.transportLevel;
                                            }
                                        });
                                        return [4 /*yield*/, prisma.trip.findFirst({
                                                where: {
                                                    OR: [
                                                        { fromLocation: hospital.name },
                                                        { toLocation: hospital.name }
                                                    ]
                                                },
                                                orderBy: { createdAt: 'desc' },
                                                select: { createdAt: true }
                                            })];
                                    case 3:
                                        lastTrip = _b.sent();
                                        lastActivity = (lastTrip === null || lastTrip === void 0 ? void 0 : lastTrip.createdAt) || new Date();
                                        activityData.push({
                                            hospitalId: hospital.id,
                                            hospitalName: hospital.name,
                                            totalTrips: totalTrips,
                                            tripsByLevel: tripsByLevel,
                                            lastActivity: lastActivity
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, hospitals_1 = hospitals;
                        _a.label = 2;
                    case 2:
                        if (!(_i < hospitals_1.length)) return [3 /*break*/, 5];
                        hospital = hospitals_1[_i];
                        return [5 /*yield**/, _loop_1(hospital)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, activityData];
                }
            });
        });
    };
    AnalyticsService.prototype.getTripCostBreakdowns = function (tripId_1) {
        return __awaiter(this, arguments, void 0, function (tripId, limit) {
            var prisma, whereClause, breakdowns;
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        whereClause = tripId ? { tripId: tripId } : {};
                        return [4 /*yield*/, prisma.tripCostBreakdown.findMany({
                                where: whereClause,
                                orderBy: { calculatedAt: 'desc' },
                                take: limit
                            })];
                    case 1:
                        breakdowns = _a.sent();
                        return [2 /*return*/, breakdowns.map(function (breakdown) { return ({
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
                            }); })];
                }
            });
        });
    };
    AnalyticsService.prototype.getCostAnalysisSummary = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var prisma, dateFilter, breakdowns, totalRevenue, totalCost, grossProfit, averageProfitMargin, averageRevenuePerMile, averageCostPerMile, averageLoadedMileRatio, averageDeadheadMileRatio, averageUtilizationRate, tripsByTransportLevel, tripsByPriority, costCenterMap, costCenterBreakdown;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        dateFilter = startDate && endDate ? {
                            calculatedAt: {
                                gte: startDate,
                                lte: endDate
                            }
                        } : {};
                        return [4 /*yield*/, prisma.tripCostBreakdown.findMany({
                                where: dateFilter
                            })];
                    case 1:
                        breakdowns = _a.sent();
                        if (breakdowns.length === 0) {
                            return [2 /*return*/, {
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
                                }];
                        }
                        totalRevenue = breakdowns.reduce(function (sum, b) { return sum + Number(b.totalRevenue); }, 0);
                        totalCost = breakdowns.reduce(function (sum, b) { return sum + Number(b.totalCost); }, 0);
                        grossProfit = totalRevenue - totalCost;
                        averageProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
                        averageRevenuePerMile = breakdowns.reduce(function (sum, b) { return sum + Number(b.revenuePerMile); }, 0) / breakdowns.length;
                        averageCostPerMile = breakdowns.reduce(function (sum, b) { return sum + Number(b.costPerMile); }, 0) / breakdowns.length;
                        averageLoadedMileRatio = breakdowns.reduce(function (sum, b) { return sum + Number(b.loadedMileRatio); }, 0) / breakdowns.length;
                        averageDeadheadMileRatio = breakdowns.reduce(function (sum, b) { return sum + Number(b.deadheadMileRatio); }, 0) / breakdowns.length;
                        averageUtilizationRate = breakdowns.reduce(function (sum, b) { return sum + Number(b.utilizationRate); }, 0) / breakdowns.length;
                        tripsByTransportLevel = {
                            BLS: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
                            ALS: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
                            CCT: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 }
                        };
                        breakdowns.forEach(function (breakdown) {
                            var level = breakdown.transportLevel;
                            if (level in tripsByTransportLevel) {
                                var revenue = Number(breakdown.totalRevenue);
                                var cost = Number(breakdown.totalCost);
                                var profit = revenue - cost;
                                var margin = revenue > 0 ? (profit / revenue) * 100 : 0;
                                tripsByTransportLevel[level].count++;
                                tripsByTransportLevel[level].revenue += revenue;
                                tripsByTransportLevel[level].cost += cost;
                                tripsByTransportLevel[level].profit += profit;
                                tripsByTransportLevel[level].margin = tripsByTransportLevel[level].revenue > 0
                                    ? (tripsByTransportLevel[level].profit / tripsByTransportLevel[level].revenue) * 100
                                    : 0;
                            }
                        });
                        tripsByPriority = {
                            LOW: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
                            MEDIUM: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
                            HIGH: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
                            URGENT: { count: 0, revenue: 0, cost: 0, profit: 0, margin: 0 }
                        };
                        breakdowns.forEach(function (breakdown) {
                            var priority = breakdown.priorityLevel;
                            if (priority in tripsByPriority) {
                                var revenue = Number(breakdown.totalRevenue);
                                var cost = Number(breakdown.totalCost);
                                var profit = revenue - cost;
                                var margin = revenue > 0 ? (profit / revenue) * 100 : 0;
                                tripsByPriority[priority].count++;
                                tripsByPriority[priority].revenue += revenue;
                                tripsByPriority[priority].cost += cost;
                                tripsByPriority[priority].profit += profit;
                                tripsByPriority[priority].margin = tripsByPriority[priority].revenue > 0
                                    ? (tripsByPriority[priority].profit / tripsByPriority[priority].revenue) * 100
                                    : 0;
                            }
                        });
                        costCenterMap = new Map();
                        breakdowns.forEach(function (breakdown) {
                            var costCenterId = breakdown.costCenterId || 'unassigned';
                            var costCenterName = breakdown.costCenterName || 'Unassigned';
                            if (!costCenterMap.has(costCenterId)) {
                                costCenterMap.set(costCenterId, {
                                    costCenterId: costCenterId,
                                    costCenterName: costCenterName,
                                    tripCount: 0,
                                    totalRevenue: 0,
                                    totalCost: 0,
                                    grossProfit: 0,
                                    profitMargin: 0
                                });
                            }
                            var center = costCenterMap.get(costCenterId);
                            var revenue = Number(breakdown.totalRevenue);
                            var cost = Number(breakdown.totalCost);
                            var profit = revenue - cost;
                            center.tripCount++;
                            center.totalRevenue += revenue;
                            center.totalCost += cost;
                            center.grossProfit += profit;
                            center.profitMargin = center.totalRevenue > 0 ? (center.grossProfit / center.totalRevenue) * 100 : 0;
                        });
                        costCenterBreakdown = Array.from(costCenterMap.values());
                        return [2 /*return*/, {
                                totalRevenue: totalRevenue,
                                totalCost: totalCost,
                                grossProfit: grossProfit,
                                averageProfitMargin: averageProfitMargin,
                                totalTrips: breakdowns.length,
                                averageRevenuePerMile: averageRevenuePerMile,
                                averageCostPerMile: averageCostPerMile,
                                averageLoadedMileRatio: averageLoadedMileRatio,
                                averageDeadheadMileRatio: averageDeadheadMileRatio,
                                averageUtilizationRate: averageUtilizationRate,
                                tripsByTransportLevel: tripsByTransportLevel,
                                tripsByPriority: tripsByPriority,
                                costCenterBreakdown: costCenterBreakdown
                            }];
                }
            });
        });
    };
    AnalyticsService.prototype.getProfitabilityAnalysis = function () {
        return __awaiter(this, arguments, void 0, function (period) {
            var prisma, now, startDate, previousStartDate, quarter, currentPeriodEnd, previousPeriodEnd, currentBreakdowns, previousBreakdowns, currentRevenue, currentCost, currentProfit, currentMargin, previousRevenue, previousCost, previousProfit, previousMargin, revenueGrowth, costGrowth, profitGrowth, totalHours, efficiencyMetrics;
            if (period === void 0) { period = 'month'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        now = new Date();
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
                                quarter = Math.floor(now.getMonth() / 3);
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
                        currentPeriodEnd = period === 'week' ? now : new Date(startDate.getTime() + (period === 'month' ? 30 : period === 'quarter' ? 90 : 365) * 24 * 60 * 60 * 1000);
                        previousPeriodEnd = new Date(startDate.getTime());
                        return [4 /*yield*/, prisma.tripCostBreakdown.findMany({
                                where: {
                                    calculatedAt: {
                                        gte: startDate,
                                        lte: currentPeriodEnd
                                    }
                                }
                            })];
                    case 1:
                        currentBreakdowns = _a.sent();
                        return [4 /*yield*/, prisma.tripCostBreakdown.findMany({
                                where: {
                                    calculatedAt: {
                                        gte: previousStartDate,
                                        lte: previousPeriodEnd
                                    }
                                }
                            })];
                    case 2:
                        previousBreakdowns = _a.sent();
                        currentRevenue = currentBreakdowns.reduce(function (sum, b) { return sum + Number(b.totalRevenue); }, 0);
                        currentCost = currentBreakdowns.reduce(function (sum, b) { return sum + Number(b.totalCost); }, 0);
                        currentProfit = currentRevenue - currentCost;
                        currentMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
                        previousRevenue = previousBreakdowns.reduce(function (sum, b) { return sum + Number(b.totalRevenue); }, 0);
                        previousCost = previousBreakdowns.reduce(function (sum, b) { return sum + Number(b.totalCost); }, 0);
                        previousProfit = previousRevenue - previousCost;
                        previousMargin = previousRevenue > 0 ? (previousProfit / previousRevenue) * 100 : 0;
                        revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
                        costGrowth = previousCost > 0 ? ((currentCost - previousCost) / previousCost) * 100 : 0;
                        profitGrowth = previousProfit !== 0 ? ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100 : 0;
                        totalHours = currentBreakdowns.reduce(function (sum, b) { return sum + Number(b.tripDurationHours); }, 0);
                        efficiencyMetrics = {
                            loadedMileRatio: currentBreakdowns.reduce(function (sum, b) { return sum + Number(b.loadedMileRatio); }, 0) / currentBreakdowns.length || 0,
                            deadheadMileRatio: currentBreakdowns.reduce(function (sum, b) { return sum + Number(b.deadheadMileRatio); }, 0) / currentBreakdowns.length || 0,
                            utilizationRate: currentBreakdowns.reduce(function (sum, b) { return sum + Number(b.utilizationRate); }, 0) / currentBreakdowns.length || 0,
                            revenuePerHour: totalHours > 0 ? currentRevenue / totalHours : 0,
                            costPerHour: totalHours > 0 ? currentCost / totalHours : 0
                        };
                        return [2 /*return*/, {
                                period: period,
                                totalRevenue: currentRevenue,
                                totalCost: currentCost,
                                grossProfit: currentProfit,
                                profitMargin: currentMargin,
                                revenueGrowth: revenueGrowth,
                                costGrowth: costGrowth,
                                profitGrowth: profitGrowth,
                                efficiencyMetrics: efficiencyMetrics,
                                trends: {
                                    revenue: { current: currentRevenue, previous: previousRevenue, change: revenueGrowth },
                                    costs: { current: currentCost, previous: previousCost, change: costGrowth },
                                    profit: { current: currentProfit, previous: previousProfit, change: profitGrowth },
                                    margin: { current: currentMargin, previous: previousMargin, change: currentMargin - previousMargin }
                                }
                            }];
                }
            });
        });
    };
    AnalyticsService.prototype.createTripCostBreakdown = function (tripId, breakdownData) {
        return __awaiter(this, void 0, void 0, function () {
            var prisma, breakdown;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        return [4 /*yield*/, prisma.tripCostBreakdown.create({
                                data: {
                                    tripId: tripId,
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
                            })];
                    case 1:
                        breakdown = _a.sent();
                        return [2 /*return*/, {
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
                            }];
                }
            });
        });
    };
    return AnalyticsService;
}());
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
exports.default = exports.analyticsService;
