"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var revenueOptimizer_1 = require("../services/revenueOptimizer");
var backhaulDetector_1 = require("../services/backhaulDetector");
var multiUnitOptimizer_1 = require("../services/multiUnitOptimizer");
var databaseManager_1 = require("../services/databaseManager");
var authService_1 = require("../services/authService");
var router = express_1.default.Router();
// Initialize optimization services
var revenueOptimizer = new revenueOptimizer_1.RevenueOptimizer(databaseManager_1.databaseManager);
var backhaulDetector = new backhaulDetector_1.BackhaulDetector();
var multiUnitOptimizer = new multiUnitOptimizer_1.MultiUnitOptimizer(revenueOptimizer, backhaulDetector);
/**
 * POST /api/optimize/routes
 * Optimize routes for a specific unit
 */
router.post('/routes', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, unitId, requestIds, constraints, unit_1, requests, currentTime_1, optimizationResults, backhaulPairs, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, unitId = _a.unitId, requestIds = _a.requestIds, constraints = _a.constraints;
                if (!unitId || !requestIds || !Array.isArray(requestIds)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'unitId and requestIds array are required'
                        })];
                }
                return [4 /*yield*/, getUnitById(unitId)];
            case 1:
                unit_1 = _b.sent();
                if (!unit_1) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Unit not found'
                        })];
                }
                return [4 /*yield*/, getRequestsByIds(requestIds)];
            case 2:
                requests = _b.sent();
                if (requests.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'No valid requests found'
                        })];
                }
                currentTime_1 = new Date();
                optimizationResults = requests
                    .filter(function (request) { return revenueOptimizer.canHandleRequest(unit_1, request); })
                    .map(function (request) {
                    var score = revenueOptimizer.calculateScore(unit_1, request, currentTime_1);
                    var revenue = revenueOptimizer.calculateRevenue(request);
                    var deadheadMiles = revenueOptimizer.calculateDeadheadMiles(unit_1, request);
                    var waitTime = revenueOptimizer.calculateWaitTime(unit_1, request, currentTime_1);
                    var overtimeRisk = revenueOptimizer.calculateOvertimeRisk(unit_1, request, currentTime_1);
                    return {
                        requestId: request.id,
                        score: score,
                        revenue: revenue,
                        deadheadMiles: deadheadMiles,
                        waitTime: waitTime,
                        overtimeRisk: overtimeRisk,
                        canHandle: true
                    };
                })
                    .sort(function (a, b) { return b.score - a.score; });
                backhaulPairs = backhaulDetector.findPairs(requests);
                res.json({
                    success: true,
                    data: {
                        unitId: unitId,
                        optimizedRequests: optimizationResults,
                        backhaulPairs: backhaulPairs.slice(0, 5), // Top 5 pairs
                        totalRevenue: optimizationResults.reduce(function (sum, result) { return sum + result.revenue; }, 0),
                        totalDeadheadMiles: optimizationResults.reduce(function (sum, result) { return sum + result.deadheadMiles; }, 0),
                        totalWaitTime: optimizationResults.reduce(function (sum, result) { return sum + result.waitTime; }, 0),
                        averageScore: optimizationResults.length > 0
                            ? optimizationResults.reduce(function (sum, result) { return sum + result.score; }, 0) / optimizationResults.length
                            : 0
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error('Route optimization error:', error_1);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error during route optimization'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/optimize/revenue
 * Get revenue analytics for a time period
 */
router.get('/revenue', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, timeframe, agencyId, now, timeRanges, timeRange, startTime, trips, totalRevenue, totalMiles, loadedMiles, loadedMileRatio, storedRevenuePerHour, revenuePerHour, error_2;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.query, _b = _a.timeframe, timeframe = _b === void 0 ? '24h' : _b, agencyId = _a.agencyId;
                now = new Date();
                timeRanges = {
                    '1h': 1 * 60 * 60 * 1000,
                    '24h': 24 * 60 * 60 * 1000,
                    '7d': 7 * 24 * 60 * 60 * 1000,
                    '30d': 30 * 24 * 60 * 60 * 1000
                };
                timeRange = timeRanges[timeframe] || timeRanges['24h'];
                startTime = new Date(now.getTime() - timeRange);
                return [4 /*yield*/, getCompletedTripsInRange(startTime, now, agencyId)];
            case 1:
                trips = _d.sent();
                console.log('TCC_DEBUG: Revenue analytics - trips found:', trips.length);
                console.log('TCC_DEBUG: Revenue analytics - sample trip:', trips[0]);
                totalRevenue = trips.reduce(function (sum, trip) { return sum + calculateTripRevenue(trip); }, 0);
                totalMiles = trips.reduce(function (sum, trip) { return sum + calculateTripMiles(trip); }, 0);
                loadedMiles = trips.reduce(function (sum, trip) { return sum + calculateLoadedMiles(trip); }, 0);
                loadedMileRatio = totalMiles > 0 ? loadedMiles / totalMiles : 0;
                storedRevenuePerHour = (_c = trips.find(function (trip) { return trip.revenuePerHour; })) === null || _c === void 0 ? void 0 : _c.revenuePerHour;
                revenuePerHour = storedRevenuePerHour ? Number(storedRevenuePerHour) : totalRevenue / (timeRange / (1000 * 60 * 60));
                console.log('TCC_DEBUG: Revenue analytics - calculated values:', {
                    totalRevenue: totalRevenue,
                    totalMiles: totalMiles,
                    loadedMiles: loadedMiles,
                    loadedMileRatio: loadedMileRatio,
                    revenuePerHour: revenuePerHour
                });
                res.json({
                    success: true,
                    data: {
                        timeframe: timeframe,
                        totalRevenue: totalRevenue,
                        loadedMileRatio: loadedMileRatio,
                        revenuePerHour: revenuePerHour,
                        totalTrips: trips.length,
                        averageRevenuePerTrip: trips.length > 0 ? totalRevenue / trips.length : 0,
                        totalMiles: totalMiles,
                        loadedMiles: loadedMiles
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _d.sent();
                console.error('Revenue analytics error:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error during revenue analytics'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/optimize/backhaul
 * Find backhaul opportunities for given requests
 */
router.post('/backhaul', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requestIds, requests, pairs, statistics, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requestIds = req.body.requestIds;
                if (!requestIds || !Array.isArray(requestIds)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'requestIds array is required'
                        })];
                }
                return [4 /*yield*/, getRequestsByIds(requestIds)];
            case 1:
                requests = _a.sent();
                if (requests.length < 2) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'At least 2 requests are required for backhaul analysis'
                        })];
                }
                pairs = backhaulDetector.findPairs(requests);
                statistics = backhaulDetector.getBackhaulStatistics(requests);
                res.json({
                    success: true,
                    data: {
                        pairs: pairs,
                        statistics: statistics,
                        recommendations: pairs.slice(0, 10).map(function (pair) { return ({
                            pairId: "".concat(pair.request1.id, "-").concat(pair.request2.id),
                            efficiency: pair.efficiency,
                            distance: pair.distance,
                            timeWindow: pair.timeWindow,
                            revenueBonus: pair.revenueBonus,
                            potentialRevenue: backhaulDetector.calculatePairingRevenue(pair)
                        }); })
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Backhaul analysis error:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error during backhaul analysis'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/optimize/return-trips
 * Find return trip opportunities in the system (e.g., Altoona → Pittsburgh → Altoona)
 */
router.get('/return-trips', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var allRequests, returnTrips, statistics, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Finding return trip opportunities...');
                return [4 /*yield*/, getAllPendingRequests()];
            case 1:
                allRequests = _a.sent();
                console.log('TCC_DEBUG: Found pending requests:', allRequests.length);
                returnTrips = backhaulDetector.findAllReturnTripOpportunities(allRequests);
                console.log('TCC_DEBUG: Found return trip opportunities:', returnTrips.length);
                statistics = {
                    totalRequests: allRequests.length,
                    returnTripOpportunities: returnTrips.length,
                    averageEfficiency: returnTrips.length > 0
                        ? returnTrips.reduce(function (sum, pair) { return sum + pair.efficiency; }, 0) / returnTrips.length
                        : 0,
                    potentialRevenueIncrease: returnTrips.reduce(function (sum, pair) {
                        return sum + backhaulDetector.calculatePairingRevenue(pair);
                    }, 0)
                };
                res.json({
                    success: true,
                    data: {
                        returnTrips: returnTrips.slice(0, 20), // Limit to top 20
                        statistics: statistics,
                        recommendations: returnTrips.slice(0, 10).map(function (pair) { return ({
                            pairId: "".concat(pair.request1.id, "-").concat(pair.request2.id),
                            efficiency: pair.efficiency,
                            distance: pair.distance,
                            timeWindow: pair.timeWindow,
                            revenueBonus: pair.revenueBonus,
                            potentialRevenue: backhaulDetector.calculatePairingRevenue(pair),
                            isReturnTrip: true
                        }); })
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Return trip analysis error:', error_4);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error during return trip analysis'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/optimize/multi-unit
 * Optimize assignments across multiple units
 */
router.post('/multi-unit', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, unitIds, requestIds, constraints, units, requests, currentTime, optimizationResult, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, unitIds = _a.unitIds, requestIds = _a.requestIds, constraints = _a.constraints;
                if (!unitIds || !Array.isArray(unitIds) || !requestIds || !Array.isArray(requestIds)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'unitIds and requestIds arrays are required'
                        })];
                }
                return [4 /*yield*/, getUnitsByIds(unitIds)];
            case 1:
                units = _b.sent();
                if (units.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'No valid units found'
                        })];
                }
                return [4 /*yield*/, getRequestsByIds(requestIds)];
            case 2:
                requests = _b.sent();
                if (requests.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'No valid requests found'
                        })];
                }
                // Update constraints if provided
                if (constraints) {
                    multiUnitOptimizer.updateConstraints(constraints);
                }
                currentTime = new Date();
                return [4 /*yield*/, multiUnitOptimizer.optimizeMultiUnit(units, requests, currentTime)];
            case 3:
                optimizationResult = _b.sent();
                res.json({
                    success: true,
                    data: optimizationResult
                });
                return [3 /*break*/, 5];
            case 4:
                error_5 = _b.sent();
                console.error('Multi-unit optimization error:', error_5);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error during multi-unit optimization'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/optimize/performance
 * Get performance metrics for units
 */
router.get('/performance', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, timeframe, unitId, now, timeRanges, timeRange, startTime, performanceData, error_6;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.query, _b = _a.timeframe, timeframe = _b === void 0 ? '24h' : _b, unitId = _a.unitId;
                now = new Date();
                timeRanges = {
                    '1h': 1 * 60 * 60 * 1000,
                    '24h': 24 * 60 * 60 * 1000,
                    '7d': 7 * 24 * 60 * 60 * 1000,
                    '30d': 30 * 24 * 60 * 60 * 1000
                };
                timeRange = timeRanges[timeframe] || timeRanges['24h'];
                startTime = new Date(now.getTime() - timeRange);
                return [4 /*yield*/, getPerformanceMetrics(startTime, now, unitId)];
            case 1:
                performanceData = _c.sent();
                console.log('TCC_DEBUG: Performance metrics - data:', performanceData);
                res.json({
                    success: true,
                    data: __assign({ timeframe: timeframe }, performanceData)
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _c.sent();
                console.error('Performance metrics error:', error_6);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error during performance analysis'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ===== ROUTE OPTIMIZATION SETTINGS ENDPOINTS (Phase 3) =====
/**
 * GET /api/optimize/settings
 * Get route optimization settings for an agency or global defaults
 */
router.get('/settings', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var agencyId, prisma, settings, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                agencyId = req.query.agencyId;
                prisma = databaseManager_1.databaseManager.getCenterDB();
                return [4 /*yield*/, prisma.route_optimization_settings.findFirst({
                        where: {
                            agencyId: agencyId || null,
                            isActive: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    })];
            case 1:
                settings = _a.sent();
                if (!(!settings && agencyId)) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.route_optimization_settings.findFirst({
                        where: {
                            agencyId: null,
                            isActive: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    })];
            case 2:
                settings = _a.sent();
                _a.label = 3;
            case 3:
                if (!!settings) return [3 /*break*/, 5];
                return [4 /*yield*/, prisma.route_optimization_settings.create({
                        data: {
                            id: "global-".concat(Date.now()),
                            agencyId: null,
                            updatedAt: new Date()
                        }
                    })];
            case 4:
                settings = _a.sent();
                _a.label = 5;
            case 5:
                res.json({
                    success: true,
                    data: settings
                });
                return [3 /*break*/, 7];
            case 6:
                error_7 = _a.sent();
                console.error('Get optimization settings error:', error_7);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error getting optimization settings'
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/optimize/settings
 * Create or update route optimization settings
 */
router.post('/settings', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, agencyId, settingsData, prisma, existingSettings, settings, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                _a = req.body, agencyId = _a.agencyId, settingsData = __rest(_a, ["agencyId"]);
                prisma = databaseManager_1.databaseManager.getCenterDB();
                return [4 /*yield*/, prisma.route_optimization_settings.findFirst({
                        where: {
                            agencyId: agencyId || null,
                            isActive: true
                        }
                    })];
            case 1:
                existingSettings = _b.sent();
                settings = void 0;
                if (!existingSettings) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.route_optimization_settings.update({
                        where: { id: existingSettings.id },
                        data: __assign(__assign({}, settingsData), { updatedAt: new Date() })
                    })];
            case 2:
                // Update existing settings
                settings = _b.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, prisma.route_optimization_settings.create({
                    data: __assign(__assign({ id: "agency-".concat(agencyId, "-").concat(Date.now()), agencyId: agencyId || null }, settingsData), { updatedAt: new Date() })
                })];
            case 4:
                // Create new settings
                settings = _b.sent();
                _b.label = 5;
            case 5:
                res.json({
                    success: true,
                    data: settings
                });
                return [3 /*break*/, 7];
            case 6:
                error_8 = _b.sent();
                console.error('Create/update optimization settings error:', error_8);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error creating/updating optimization settings'
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/optimize/settings/reset
 * Reset optimization settings to defaults
 */
router.post('/settings/reset', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var agencyId, prisma, settings, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                agencyId = req.body.agencyId;
                prisma = databaseManager_1.databaseManager.getCenterDB();
                // Deactivate existing settings
                return [4 /*yield*/, prisma.route_optimization_settings.updateMany({
                        where: {
                            agencyId: agencyId || null,
                            isActive: true
                        },
                        data: {
                            isActive: false
                        }
                    })];
            case 1:
                // Deactivate existing settings
                _a.sent();
                return [4 /*yield*/, prisma.route_optimization_settings.create({
                        data: {
                            id: "default-".concat(agencyId || 'global', "-").concat(Date.now()),
                            agencyId: agencyId || null,
                            updatedAt: new Date()
                        }
                    })];
            case 2:
                settings = _a.sent();
                res.json({
                    success: true,
                    data: settings
                });
                return [3 /*break*/, 4];
            case 3:
                error_9 = _a.sent();
                console.error('Reset optimization settings error:', error_9);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error resetting optimization settings'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/optimize/preview
 * Preview optimization results with current settings
 */
router.post('/preview', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, unitIds, requestIds, settings, units, requests, optimizationSettings, prisma, dbSettings, currentTime, previewResults, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                _a = req.body, unitIds = _a.unitIds, requestIds = _a.requestIds, settings = _a.settings;
                if (!unitIds || !Array.isArray(unitIds) || !requestIds || !Array.isArray(requestIds)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'unitIds and requestIds arrays are required'
                        })];
                }
                return [4 /*yield*/, getUnitsByIds(unitIds)];
            case 1:
                units = _b.sent();
                return [4 /*yield*/, getRequestsByIds(requestIds)];
            case 2:
                requests = _b.sent();
                if (units.length === 0 || requests.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'No valid units or requests found'
                        })];
                }
                optimizationSettings = settings;
                if (!!optimizationSettings) return [3 /*break*/, 4];
                prisma = databaseManager_1.databaseManager.getCenterDB();
                return [4 /*yield*/, prisma.route_optimization_settings.findFirst({
                        where: { isActive: true },
                        orderBy: { createdAt: 'desc' }
                    })];
            case 3:
                dbSettings = _b.sent();
                optimizationSettings = dbSettings;
                _b.label = 4;
            case 4:
                currentTime = new Date();
                return [4 /*yield*/, runOptimizationPreview(units, requests, optimizationSettings, currentTime)];
            case 5:
                previewResults = _b.sent();
                res.json({
                    success: true,
                    data: previewResults
                });
                return [3 /*break*/, 7];
            case 6:
                error_10 = _b.sent();
                console.error('Optimization preview error:', error_10);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error during optimization preview'
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/optimize/what-if
 * Run what-if scenario analysis
 */
router.post('/what-if', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, unitIds, requestIds, scenarioSettings, baseSettings, units, requests, currentTime, baseResults, whatIfResults, comparison, error_11;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, unitIds = _a.unitIds, requestIds = _a.requestIds, scenarioSettings = _a.scenarioSettings, baseSettings = _a.baseSettings;
                if (!unitIds || !Array.isArray(unitIds) || !requestIds || !Array.isArray(requestIds)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'unitIds and requestIds arrays are required'
                        })];
                }
                return [4 /*yield*/, getUnitsByIds(unitIds)];
            case 1:
                units = _b.sent();
                return [4 /*yield*/, getRequestsByIds(requestIds)];
            case 2:
                requests = _b.sent();
                if (units.length === 0 || requests.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'No valid units or requests found'
                        })];
                }
                currentTime = new Date();
                return [4 /*yield*/, runOptimizationPreview(units, requests, baseSettings, currentTime)];
            case 3:
                baseResults = _b.sent();
                return [4 /*yield*/, runOptimizationPreview(units, requests, scenarioSettings, currentTime)];
            case 4:
                whatIfResults = _b.sent();
                comparison = {
                    baseScenario: baseResults,
                    whatIfScenario: whatIfResults,
                    differences: {
                        revenueDifference: whatIfResults.totalRevenue - baseResults.totalRevenue,
                        deadheadMilesDifference: whatIfResults.totalDeadheadMiles - baseResults.totalDeadheadMiles,
                        efficiencyDifference: whatIfResults.averageEfficiency - baseResults.averageEfficiency,
                        responseTimeDifference: whatIfResults.averageResponseTime - baseResults.averageResponseTime
                    }
                };
                res.json({
                    success: true,
                    data: comparison
                });
                return [3 /*break*/, 6];
            case 5:
                error_11 = _b.sent();
                console.error('What-if analysis error:', error_11);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error during what-if analysis'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/optimize/stream
 * Server-Sent Events stream for real-time optimization metrics
 */
router.get('/stream', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, user, error_12, writeEvent, isClosed, interval;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                token = req.query.token || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '')) || ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.tcc_token);
                if (!token) {
                    res.status(401).json({ success: false, error: 'Access token required' });
                    return [2 /*return*/];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                return [4 /*yield*/, authService_1.authService.verifyToken(token)];
            case 2:
                user = _d.sent();
                if (!user) {
                    res.status(401).json({ success: false, error: 'Invalid or expired token' });
                    return [2 /*return*/];
                }
                // Set user for the request
                req.user = user;
                return [3 /*break*/, 4];
            case 3:
                error_12 = _d.sent();
                console.error('SSE authentication error:', error_12);
                res.status(401).json({ success: false, error: 'Authentication failed' });
                return [2 /*return*/];
            case 4:
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                (_c = res.flushHeaders) === null || _c === void 0 ? void 0 : _c.call(res);
                writeEvent = function (event, data) {
                    res.write("event: ".concat(event, "\n"));
                    res.write("data: ".concat(JSON.stringify(data), "\n\n"));
                };
                writeEvent('connected', { ok: true, timestamp: new Date().toISOString() });
                isClosed = false;
                req.on('close', function () {
                    isClosed = true;
                });
                interval = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var now, start, snapshot, error_13;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (isClosed) {
                                    clearInterval(interval);
                                    return [2 /*return*/];
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                now = new Date();
                                start = new Date(now.getTime() - 5 * 60 * 1000);
                                return [4 /*yield*/, getPerformanceMetrics(start, now)];
                            case 2:
                                snapshot = _a.sent();
                                writeEvent('metrics', {
                                    timestamp: new Date().toISOString(),
                                    summary: snapshot
                                });
                                return [3 /*break*/, 4];
                            case 3:
                                error_13 = _a.sent();
                                writeEvent('error', { message: 'Failed to compute metrics' });
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }, 5000);
                return [2 /*return*/];
        }
    });
}); });
// Helper functions - Real database queries
function getAllPendingRequests() {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, trips, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    prisma = databaseManager_1.databaseManager.getCenterDB();
                    return [4 /*yield*/, prisma.trip.findMany({
                            where: {
                                status: 'PENDING'
                            },
                            select: {
                                id: true,
                                patientId: true,
                                fromLocation: true,
                                toLocation: true,
                                transportLevel: true,
                                priority: true,
                                scheduledTime: true,
                                specialNeeds: true,
                                originLatitude: true,
                                originLongitude: true,
                                destinationLatitude: true,
                                destinationLongitude: true,
                                createdAt: true
                            }
                        })];
                case 1:
                    trips = _a.sent();
                    // Convert to TransportRequest format
                    return [2 /*return*/, trips.map(function (trip) { return ({
                            id: trip.id,
                            patientId: trip.patientId,
                            originFacilityId: trip.fromLocation,
                            destinationFacilityId: trip.toLocation,
                            transportLevel: trip.transportLevel,
                            priority: trip.priority,
                            status: 'PENDING',
                            specialRequirements: trip.specialNeeds || '',
                            requestTimestamp: new Date(trip.createdAt),
                            readyStart: new Date(trip.scheduledTime),
                            readyEnd: new Date(new Date(trip.scheduledTime).getTime() + 60 * 60 * 1000), // 1 hour window
                            originLocation: {
                                lat: trip.originLatitude || 40.7128,
                                lng: trip.originLongitude || -74.0060
                            },
                            destinationLocation: {
                                lat: trip.destinationLatitude || 40.7589,
                                lng: trip.destinationLongitude || -73.9851
                            }
                        }); })];
                case 2:
                    error_14 = _a.sent();
                    console.error('Error getting pending requests:', error_14);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getUnitById(unitId) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, unit, error_15;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    prisma = databaseManager_1.databaseManager.getEMSDB();
                    return [4 /*yield*/, prisma.unit.findUnique({
                            where: { id: unitId },
                            include: {
                                agency: true
                            }
                        })];
                case 1:
                    unit = _a.sent();
                    if (!unit) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            id: unit.id,
                            agencyId: unit.agencyId,
                            unitNumber: unit.unitNumber,
                            type: unit.type,
                            capabilities: unit.capabilities || [],
                            currentStatus: unit.currentStatus,
                            currentLocation: unit.currentLocation && typeof unit.currentLocation === 'object' && 'lat' in unit.currentLocation ? {
                                lat: unit.currentLocation.lat,
                                lng: unit.currentLocation.lng
                            } : { lat: 0, lng: 0 },
                            shiftStart: unit.shiftStart || new Date(),
                            shiftEnd: unit.shiftEnd || new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
                            isActive: unit.isActive
                        }];
                case 2:
                    error_15 = _a.sent();
                    console.error('Error fetching unit by ID:', error_15);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getUnitsByIds(unitIds) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, units, error_16;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    prisma = databaseManager_1.databaseManager.getEMSDB();
                    return [4 /*yield*/, prisma.unit.findMany({
                            where: {
                                id: { in: unitIds },
                                isActive: true
                            },
                            include: {
                                agency: true
                            }
                        })];
                case 1:
                    units = _a.sent();
                    return [2 /*return*/, units.map(function (unit) { return ({
                            id: unit.id,
                            agencyId: unit.agencyId,
                            unitNumber: unit.unitNumber,
                            type: unit.type,
                            capabilities: unit.capabilities || [],
                            currentStatus: unit.currentStatus,
                            currentLocation: unit.currentLocation && typeof unit.currentLocation === 'object' && 'lat' in unit.currentLocation ? {
                                lat: unit.currentLocation.lat,
                                lng: unit.currentLocation.lng
                            } : { lat: 0, lng: 0 },
                            shiftStart: unit.shiftStart || new Date(),
                            shiftEnd: unit.shiftEnd || new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
                            isActive: unit.isActive
                        }); })];
                case 2:
                    error_16 = _a.sent();
                    console.error('Error fetching units by IDs:', error_16);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getRequestsByIds(requestIds) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, trips, error_17;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    prisma = databaseManager_1.databaseManager.getCenterDB();
                    return [4 /*yield*/, prisma.trip.findMany({
                            where: {
                                id: { in: requestIds },
                                status: 'PENDING'
                            }
                        })];
                case 1:
                    trips = _a.sent();
                    return [2 /*return*/, trips.map(function (trip) { return ({
                            id: trip.id,
                            patientId: trip.patientId,
                            originFacilityId: trip.fromLocation,
                            destinationFacilityId: trip.toLocation,
                            transportLevel: trip.transportLevel,
                            priority: trip.priority,
                            status: trip.status,
                            specialRequirements: trip.specialNeeds || '',
                            requestTimestamp: trip.requestTimestamp || trip.createdAt,
                            readyStart: trip.scheduledTime,
                            readyEnd: new Date(trip.scheduledTime.getTime() + 30 * 60 * 1000), // 30 minutes window
                            originLocation: trip.originLatitude && trip.originLongitude ? {
                                lat: trip.originLatitude,
                                lng: trip.originLongitude
                            } : { lat: 0, lng: 0 },
                            destinationLocation: trip.destinationLatitude && trip.destinationLongitude ? {
                                lat: trip.destinationLatitude,
                                lng: trip.destinationLongitude
                            } : { lat: 0, lng: 0 },
                            // Revenue and distance data
                            tripCost: trip.tripCost,
                            distanceMiles: trip.distanceMiles,
                            insurancePayRate: trip.insurancePayRate,
                            perMileRate: trip.perMileRate
                        }); })];
                case 2:
                    error_17 = _a.sent();
                    console.error('Error fetching requests by IDs:', error_17);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getCompletedTripsInRange(startTime, endTime, agencyId) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, whereClause, trips, error_18;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    prisma = databaseManager_1.databaseManager.getCenterDB();
                    whereClause = {
                        status: 'COMPLETED',
                        completionTimestamp: {
                            gte: startTime,
                            lte: endTime
                        }
                    };
                    // If agencyId is provided, filter by assigned agency
                    if (agencyId) {
                        whereClause.assignedAgencyId = agencyId;
                    }
                    return [4 /*yield*/, prisma.trip.findMany({
                            where: whereClause,
                            select: {
                                id: true,
                                transportLevel: true,
                                priority: true,
                                completionTimestamp: true,
                                tripCost: true,
                                distanceMiles: true,
                                responseTimeMinutes: true,
                                actualTripTimeMinutes: true,
                                assignedAgencyId: true,
                                // New analytics fields
                                loadedMiles: true,
                                customerSatisfaction: true,
                                efficiency: true,
                                performanceScore: true,
                                revenuePerHour: true,
                                backhaulOpportunity: true
                            }
                        })];
                case 1:
                    trips = _a.sent();
                    return [2 /*return*/, trips.map(function (trip) { return ({
                            id: trip.id,
                            transportLevel: trip.transportLevel,
                            priority: trip.priority,
                            completedAt: trip.completionTimestamp,
                            revenue: trip.tripCost || 0,
                            miles: trip.distanceMiles || 0,
                            loadedMiles: trip.loadedMiles || trip.distanceMiles || 0, // Use stored loadedMiles if available
                            responseTimeMinutes: trip.responseTimeMinutes || 0,
                            actualTripTimeMinutes: trip.actualTripTimeMinutes || 0,
                            assignedAgencyId: trip.assignedAgencyId,
                            // New analytics fields
                            customerSatisfaction: trip.customerSatisfaction,
                            efficiency: trip.efficiency,
                            performanceScore: trip.performanceScore,
                            revenuePerHour: trip.revenuePerHour,
                            backhaulOpportunity: trip.backhaulOpportunity
                        }); })];
                case 2:
                    error_18 = _a.sent();
                    console.error('Error fetching completed trips in range:', error_18);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function calculateTripRevenue(trip) {
    // Use stored trip cost if available
    if (trip.tripCost && trip.tripCost > 0) {
        return Number(trip.tripCost);
    }
    // Use stored revenue if available (new field)
    if (trip.revenue && trip.revenue > 0) {
        return Number(trip.revenue);
    }
    // Fallback to calculated revenue
    var baseRates = { 'BLS': 150.0, 'ALS': 250.0, 'CCT': 400.0 };
    var baseRate = baseRates[trip.transportLevel] || 150.0;
    var priorityMultipliers = { 'LOW': 1.0, 'MEDIUM': 1.1, 'HIGH': 1.25, 'URGENT': 1.5 };
    var multiplier = priorityMultipliers[trip.priority] || 1.0;
    return baseRate * multiplier;
}
function calculateTripMiles(trip) {
    return trip.distanceMiles || trip.miles || 0;
}
function calculateLoadedMiles(trip) {
    // Use stored loadedMiles if available (new field)
    if (trip.loadedMiles && trip.loadedMiles > 0) {
        return Number(trip.loadedMiles);
    }
    // Fallback to calculated loaded miles (same as total miles for now)
    return trip.distanceMiles || trip.miles || 0;
}
function getPerformanceMetrics(startTime, endTime, unitId) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, whereClause, trips, totalTrips, completedTrips, totalRevenue, responseTimes, averageResponseTime, tripTimes, averageTripTime, efficiency, error_19;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    prisma = databaseManager_1.databaseManager.getCenterDB();
                    whereClause = {
                        status: 'COMPLETED',
                        completionTimestamp: {
                            gte: startTime,
                            lte: endTime
                        }
                    };
                    // If unitId is provided, filter by assigned unit
                    if (unitId) {
                        whereClause.assignedUnitId = unitId;
                    }
                    return [4 /*yield*/, prisma.trip.findMany({
                            where: whereClause,
                            select: {
                                id: true,
                                tripCost: true,
                                responseTimeMinutes: true,
                                actualTripTimeMinutes: true,
                                completionTimestamp: true,
                                createdAt: true
                            }
                        })];
                case 1:
                    trips = _a.sent();
                    totalTrips = trips.length;
                    completedTrips = trips.filter(function (trip) { return trip.completionTimestamp; }).length;
                    totalRevenue = trips.reduce(function (sum, trip) { return sum + (Number(trip.tripCost) || 0); }, 0);
                    responseTimes = trips
                        .filter(function (trip) { return trip.responseTimeMinutes; })
                        .map(function (trip) { return trip.responseTimeMinutes; });
                    averageResponseTime = responseTimes.length > 0
                        ? responseTimes.reduce(function (sum, time) { return sum + time; }, 0) / responseTimes.length
                        : 0;
                    tripTimes = trips
                        .filter(function (trip) { return trip.actualTripTimeMinutes; })
                        .map(function (trip) { return trip.actualTripTimeMinutes; });
                    averageTripTime = tripTimes.length > 0
                        ? tripTimes.reduce(function (sum, time) { return sum + time; }, 0) / tripTimes.length
                        : 0;
                    efficiency = totalTrips > 0 ? completedTrips / totalTrips : 0;
                    return [2 /*return*/, {
                            totalTrips: totalTrips,
                            completedTrips: completedTrips,
                            averageResponseTime: averageResponseTime,
                            averageTripTime: averageTripTime,
                            totalRevenue: totalRevenue,
                            efficiency: efficiency,
                            customerSatisfaction: 4.2 // Placeholder - would need customer feedback system
                        }];
                case 2:
                    error_19 = _a.sent();
                    console.error('Error fetching performance metrics:', error_19);
                    return [2 /*return*/, {
                            totalTrips: 0,
                            completedTrips: 0,
                            averageResponseTime: 0,
                            averageTripTime: 0,
                            totalRevenue: 0,
                            efficiency: 0,
                            customerSatisfaction: 0
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// ===== OPTIMIZATION PREVIEW FUNCTIONS (Phase 3) =====
function runOptimizationPreview(units, requests, settings, currentTime) {
    return __awaiter(this, void 0, void 0, function () {
        var weights, constraints, optimizationResults, totalRevenue, totalDeadheadMiles, totalWaitTime, totalOvertimeRisk, backhaulPairs, _i, units_1, unit, _a, requests_1, request, deadheadMiles, waitTime, overtimeRisk, revenue, responseTime, distance, constraintViolations, score, backhaulOpportunities, totalMiles, loadedMiles, loadedMileRatio, averageEfficiency, averageResponseTime;
        return __generator(this, function (_b) {
            try {
                weights = {
                    deadheadMile: Number((settings === null || settings === void 0 ? void 0 : settings.deadheadMileWeight) || 1.0),
                    waitTime: Number((settings === null || settings === void 0 ? void 0 : settings.waitTimeWeight) || 1.0),
                    backhaulBonus: Number((settings === null || settings === void 0 ? void 0 : settings.backhaulBonusWeight) || 1.0),
                    overtimeRisk: Number((settings === null || settings === void 0 ? void 0 : settings.overtimeRiskWeight) || 1.0),
                    revenue: Number((settings === null || settings === void 0 ? void 0 : settings.revenueWeight) || 1.0),
                    crewAvailability: Number((settings === null || settings === void 0 ? void 0 : settings.crewAvailabilityWeight) || 1.0),
                    equipmentCompatibility: Number((settings === null || settings === void 0 ? void 0 : settings.equipmentCompatibilityWeight) || 1.0),
                    patientPriority: Number((settings === null || settings === void 0 ? void 0 : settings.patientPriorityWeight) || 1.0)
                };
                constraints = {
                    maxDeadheadMiles: Number((settings === null || settings === void 0 ? void 0 : settings.maxDeadheadMiles) || 50.0),
                    maxWaitTimeMinutes: Number((settings === null || settings === void 0 ? void 0 : settings.maxWaitTimeMinutes) || 30),
                    maxOvertimeHours: Number((settings === null || settings === void 0 ? void 0 : settings.maxOvertimeHours) || 4.0),
                    maxResponseTimeMinutes: Number((settings === null || settings === void 0 ? void 0 : settings.maxResponseTimeMinutes) || 15),
                    maxServiceDistance: Number((settings === null || settings === void 0 ? void 0 : settings.maxServiceDistance) || 100.0)
                };
                optimizationResults = [];
                totalRevenue = 0;
                totalDeadheadMiles = 0;
                totalWaitTime = 0;
                totalOvertimeRisk = 0;
                backhaulPairs = 0;
                for (_i = 0, units_1 = units; _i < units_1.length; _i++) {
                    unit = units_1[_i];
                    for (_a = 0, requests_1 = requests; _a < requests_1.length; _a++) {
                        request = requests_1[_a];
                        deadheadMiles = calculateDeadheadMiles(unit, request);
                        waitTime = calculateWaitTime(unit, request, currentTime);
                        overtimeRisk = calculateOvertimeRisk(unit, request, currentTime);
                        revenue = calculateRequestRevenue(request);
                        responseTime = calculateResponseTime(unit, request);
                        distance = calculateDistance(unit, request);
                        constraintViolations = [];
                        if (deadheadMiles > constraints.maxDeadheadMiles) {
                            constraintViolations.push('maxDeadheadMiles');
                        }
                        if (waitTime > constraints.maxWaitTimeMinutes) {
                            constraintViolations.push('maxWaitTimeMinutes');
                        }
                        if (overtimeRisk > constraints.maxOvertimeHours) {
                            constraintViolations.push('maxOvertimeHours');
                        }
                        if (responseTime > constraints.maxResponseTimeMinutes) {
                            constraintViolations.push('maxResponseTimeMinutes');
                        }
                        if (distance > constraints.maxServiceDistance) {
                            constraintViolations.push('maxServiceDistance');
                        }
                        score = calculateOptimizationScore({
                            deadheadMiles: deadheadMiles,
                            waitTime: waitTime,
                            overtimeRisk: overtimeRisk,
                            revenue: revenue,
                            responseTime: responseTime,
                            distance: distance,
                            weights: weights,
                            constraintViolations: constraintViolations
                        });
                        optimizationResults.push({
                            unitId: unit.id,
                            requestId: request.id,
                            score: score,
                            deadheadMiles: deadheadMiles,
                            waitTime: waitTime,
                            overtimeRisk: overtimeRisk,
                            revenue: revenue,
                            responseTime: responseTime,
                            distance: distance,
                            constraintViolations: constraintViolations,
                            canHandle: constraintViolations.length === 0
                        });
                        // Accumulate totals
                        if (constraintViolations.length === 0) {
                            totalRevenue += revenue;
                            totalDeadheadMiles += deadheadMiles;
                            totalWaitTime += waitTime;
                            totalOvertimeRisk += overtimeRisk;
                        }
                    }
                }
                backhaulOpportunities = findBackhaulOpportunities(requests, settings);
                backhaulPairs = backhaulOpportunities.length;
                totalMiles = optimizationResults.reduce(function (sum, result) { return sum + result.distance; }, 0);
                loadedMiles = totalMiles - totalDeadheadMiles;
                loadedMileRatio = totalMiles > 0 ? loadedMiles / totalMiles : 0;
                averageEfficiency = optimizationResults.length > 0
                    ? optimizationResults.reduce(function (sum, result) { return sum + result.score; }, 0) / optimizationResults.length
                    : 0;
                averageResponseTime = optimizationResults.length > 0
                    ? optimizationResults.reduce(function (sum, result) { return sum + result.responseTime; }, 0) / optimizationResults.length
                    : 0;
                return [2 /*return*/, {
                        totalRevenue: totalRevenue,
                        totalDeadheadMiles: totalDeadheadMiles,
                        totalWaitTime: totalWaitTime,
                        totalOvertimeRisk: totalOvertimeRisk,
                        backhaulPairs: backhaulPairs,
                        loadedMileRatio: loadedMileRatio,
                        averageEfficiency: averageEfficiency,
                        averageResponseTime: averageResponseTime,
                        totalMiles: totalMiles,
                        loadedMiles: loadedMiles,
                        optimizationResults: optimizationResults.sort(function (a, b) { return b.score - a.score; }),
                        backhaulOpportunities: backhaulOpportunities.slice(0, 10), // Top 10
                        settings: {
                            weights: weights,
                            constraints: constraints
                        }
                    }];
            }
            catch (error) {
                console.error('Error running optimization preview:', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
function calculateDeadheadMiles(unit, request) {
    // Calculate distance from unit's current location to request origin
    var unitLocation = unit.currentLocation || { lat: 0, lng: 0 };
    var requestOrigin = request.originLocation || { lat: 0, lng: 0 };
    // Simple distance calculation (in real implementation, use proper geospatial functions)
    var latDiff = unitLocation.lat - requestOrigin.lat;
    var lngDiff = unitLocation.lng - requestOrigin.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough conversion to miles
}
function calculateWaitTime(unit, request, currentTime) {
    // Calculate time from now until request is ready
    var requestTime = new Date(request.readyStart || request.scheduledTime);
    var waitTime = Math.max(0, (requestTime.getTime() - currentTime.getTime()) / (1000 * 60)); // minutes
    return waitTime;
}
function calculateOvertimeRisk(unit, request, currentTime) {
    // Calculate if this request would cause overtime
    var shiftStart = new Date(unit.shiftStart || currentTime);
    var shiftEnd = new Date(unit.shiftEnd || new Date(currentTime.getTime() + 8 * 60 * 60 * 1000));
    var estimatedTripTime = 2; // hours - would be calculated based on distance
    var estimatedEndTime = new Date(currentTime.getTime() + estimatedTripTime * 60 * 60 * 1000);
    if (estimatedEndTime > shiftEnd) {
        var overtimeHours = (estimatedEndTime.getTime() - shiftEnd.getTime()) / (1000 * 60 * 60);
        return overtimeHours;
    }
    return 0;
}
function calculateRequestRevenue(request) {
    // Use stored revenue if available
    if (request.tripCost && request.tripCost > 0) {
        return Number(request.tripCost);
    }
    // Fallback to calculated revenue
    var baseRates = { 'BLS': 150.0, 'ALS': 250.0, 'CCT': 400.0 };
    var baseRate = baseRates[request.transportLevel] || 150.0;
    var priorityMultipliers = { 'LOW': 1.0, 'MEDIUM': 1.1, 'HIGH': 1.25, 'URGENT': 1.5 };
    var multiplier = priorityMultipliers[request.priority] || 1.0;
    return baseRate * multiplier;
}
function calculateResponseTime(unit, request) {
    // Calculate estimated response time based on distance
    var distance = calculateDistance(unit, request);
    var averageSpeed = 30; // mph
    return (distance / averageSpeed) * 60; // minutes
}
function calculateDistance(unit, request) {
    var unitLocation = unit.currentLocation || { lat: 0, lng: 0 };
    var requestOrigin = request.originLocation || { lat: 0, lng: 0 };
    var latDiff = unitLocation.lat - requestOrigin.lat;
    var lngDiff = unitLocation.lng - requestOrigin.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough conversion to miles
}
function calculateOptimizationScore(params) {
    var deadheadMiles = params.deadheadMiles, waitTime = params.waitTime, overtimeRisk = params.overtimeRisk, revenue = params.revenue, responseTime = params.responseTime, distance = params.distance, weights = params.weights, constraintViolations = params.constraintViolations;
    // Base score starts with revenue
    var score = revenue * weights.revenue;
    // Apply penalties
    score -= deadheadMiles * weights.deadheadMile;
    score -= waitTime * weights.waitTime;
    score -= overtimeRisk * weights.overtimeRisk;
    score -= responseTime * 0.1; // Small penalty for response time
    // Apply constraint violations penalty
    score -= constraintViolations.length * 100; // Heavy penalty for constraint violations
    return Math.max(0, score); // Ensure non-negative score
}
function findBackhaulOpportunities(requests, settings) {
    var opportunities = [];
    var timeWindow = Number((settings === null || settings === void 0 ? void 0 : settings.backhaulTimeWindow) || 60); // minutes
    var distanceLimit = Number((settings === null || settings === void 0 ? void 0 : settings.backhaulDistanceLimit) || 25.0); // miles
    for (var i = 0; i < requests.length; i++) {
        for (var j = i + 1; j < requests.length; j++) {
            var request1 = requests[i];
            var request2 = requests[j];
            // Check if requests are compatible for backhaul
            var timeDiff = Math.abs(new Date(request1.readyStart || request1.scheduledTime).getTime() -
                new Date(request2.readyStart || request2.scheduledTime).getTime()) / (1000 * 60); // minutes
            var distance = calculateDistanceBetweenRequests(request1, request2);
            if (timeDiff <= timeWindow && distance <= distanceLimit) {
                var efficiency = calculateBackhaulEfficiency(request1, request2);
                var revenueBonus = Number((settings === null || settings === void 0 ? void 0 : settings.backhaulRevenueBonus) || 50.0);
                opportunities.push({
                    request1: request1,
                    request2: request2,
                    timeWindow: timeDiff,
                    distance: distance,
                    efficiency: efficiency,
                    revenueBonus: revenueBonus,
                    totalRevenue: calculateRequestRevenue(request1) + calculateRequestRevenue(request2) + revenueBonus
                });
            }
        }
    }
    return opportunities.sort(function (a, b) { return b.efficiency - a.efficiency; });
}
function calculateDistanceBetweenRequests(request1, request2) {
    var origin1 = request1.originLocation || { lat: 0, lng: 0 };
    var destination1 = request1.destinationLocation || { lat: 0, lng: 0 };
    var origin2 = request2.originLocation || { lat: 0, lng: 0 };
    var destination2 = request2.destinationLocation || { lat: 0, lng: 0 };
    // Calculate distance from destination1 to origin2 (backhaul connection)
    var latDiff = destination1.lat - origin2.lat;
    var lngDiff = destination1.lng - origin2.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough conversion to miles
}
function calculateBackhaulEfficiency(request1, request2) {
    // Calculate efficiency based on distance savings and time compatibility
    var distance1 = calculateDistanceBetweenRequests(request1, request2);
    var distance2 = calculateDistanceBetweenRequests(request2, request1);
    var totalDistance = distance1 + distance2;
    // Higher efficiency for shorter total distance
    return totalDistance > 0 ? 100 / totalDistance : 0;
}
exports.default = router;
