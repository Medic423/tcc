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
var express_1 = require("express");
var authenticateAdmin_1 = require("../middleware/authenticateAdmin");
var databaseManager_1 = require("../services/databaseManager");
var router = express_1.default.Router();
// Apply authentication to all routes
router.use(authenticateAdmin_1.authenticateAdmin);
// Restrict to EMS users only
router.use(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (!req.user || req.user.userType !== 'EMS') {
            return [2 /*return*/, res.status(403).json({ success: false, error: 'EMS access required' })];
        }
        next();
        return [2 /*return*/];
    });
}); });
function resolveAgencyContext(req) {
    return __awaiter(this, void 0, void 0, function () {
        var emsPrisma, agencyId, agencyName, emsUser, agency, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    emsPrisma = databaseManager_1.databaseManager.getEMSDB();
                    agencyId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null;
                    agencyName = null;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    if (!(!agencyId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.email))) return [3 /*break*/, 3];
                    return [4 /*yield*/, emsPrisma.eMSUser.findUnique({ where: { email: req.user.email } })];
                case 2:
                    emsUser = _c.sent();
                    agencyId = (emsUser === null || emsUser === void 0 ? void 0 : emsUser.agencyId) || null;
                    _c.label = 3;
                case 3:
                    if (!agencyId) return [3 /*break*/, 5];
                    return [4 /*yield*/, emsPrisma.eMSAgency.findUnique({ where: { id: agencyId } })];
                case 4:
                    agency = _c.sent();
                    agencyName = (agency === null || agency === void 0 ? void 0 : agency.name) || null;
                    _c.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _c.sent();
                    console.error('TCC_DEBUG: EMS agency resolution error:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, { agencyId: agencyId, agencyName: agencyName }];
            }
        });
    });
}
/**
 * GET /api/ems/analytics/overview
 * Get agency-specific overview metrics
 */
router.get('/overview', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, agencyId, agencyName, centerPrisma, _b, totalTrips, completedTrips, pendingTrips, responseTimes, avgResponse, efficiency, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                return [4 /*yield*/, resolveAgencyContext(req)];
            case 1:
                _a = _c.sent(), agencyId = _a.agencyId, agencyName = _a.agencyName;
                if (!agencyId) {
                    return [2 /*return*/, res.status(400).json({ success: false, error: 'Unable to resolve EMS agency' })];
                }
                centerPrisma = databaseManager_1.databaseManager.getCenterDB();
                return [4 /*yield*/, Promise.all([
                        centerPrisma.trip.count({ where: { assignedAgencyId: agencyId } }),
                        centerPrisma.trip.count({ where: { assignedAgencyId: agencyId, status: 'COMPLETED' } }),
                        centerPrisma.trip.count({ where: { assignedAgencyId: agencyId, status: 'PENDING' } }),
                        centerPrisma.trip.findMany({
                            where: { assignedAgencyId: agencyId, responseTimeMinutes: { not: null } },
                            select: { responseTimeMinutes: true }
                        })
                    ])];
            case 2:
                _b = _c.sent(), totalTrips = _b[0], completedTrips = _b[1], pendingTrips = _b[2], responseTimes = _b[3];
                avgResponse = responseTimes.length > 0
                    ? responseTimes.reduce(function (sum, t) { return sum + (t.responseTimeMinutes || 0); }, 0) / responseTimes.length
                    : 0;
                efficiency = totalTrips > 0 ? completedTrips / totalTrips : 0;
                res.json({
                    success: true,
                    data: {
                        totalTrips: totalTrips,
                        completedTrips: completedTrips,
                        pendingTrips: pendingTrips,
                        efficiency: efficiency,
                        averageResponseTime: avgResponse,
                        agencyName: agencyName || 'Agency'
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _c.sent();
                console.error('Get agency overview error:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve agency overview'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/ems/analytics/trips
 * Get agency-specific trip statistics
 */
router.get('/trips', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var agencyId, prisma, _a, totalTrips, completedTrips, pendingTrips, cancelledTrips, responseTimes, tripDurations, byLevel, byPriority, tripsByLevel_1, tripsByPriority_1, averageResponseTime, averageTripDuration, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                return [4 /*yield*/, resolveAgencyContext(req)];
            case 1:
                agencyId = (_b.sent()).agencyId;
                if (!agencyId) {
                    return [2 /*return*/, res.status(400).json({ success: false, error: 'Unable to resolve EMS agency' })];
                }
                prisma = databaseManager_1.databaseManager.getCenterDB();
                return [4 /*yield*/, Promise.all([
                        prisma.trip.count({ where: { assignedAgencyId: agencyId } }),
                        prisma.trip.count({ where: { assignedAgencyId: agencyId, status: 'COMPLETED' } }),
                        prisma.trip.count({ where: { assignedAgencyId: agencyId, status: 'PENDING' } }),
                        prisma.trip.count({ where: { assignedAgencyId: agencyId, status: 'CANCELLED' } }),
                        prisma.trip.findMany({ where: { assignedAgencyId: agencyId, responseTimeMinutes: { not: null } }, select: { responseTimeMinutes: true } }),
                        prisma.trip.findMany({ where: { assignedAgencyId: agencyId, actualTripTimeMinutes: { not: null } }, select: { actualTripTimeMinutes: true } }),
                        prisma.trip.groupBy({ by: ['transportLevel'], where: { assignedAgencyId: agencyId }, _count: { transportLevel: true } }),
                        prisma.trip.groupBy({ by: ['priority'], where: { assignedAgencyId: agencyId }, _count: { priority: true } })
                    ])];
            case 2:
                _a = _b.sent(), totalTrips = _a[0], completedTrips = _a[1], pendingTrips = _a[2], cancelledTrips = _a[3], responseTimes = _a[4], tripDurations = _a[5], byLevel = _a[6], byPriority = _a[7];
                tripsByLevel_1 = { BLS: 0, ALS: 0, CCT: 0 };
                byLevel.forEach(function (g) { tripsByLevel_1[g.transportLevel] = g._count.transportLevel; });
                tripsByPriority_1 = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0, CRITICAL: 0 };
                byPriority.forEach(function (g) { tripsByPriority_1[g.priority] = g._count.priority; });
                averageResponseTime = responseTimes.length > 0
                    ? responseTimes.reduce(function (s, t) { return s + (t.responseTimeMinutes || 0); }, 0) / responseTimes.length
                    : 0;
                averageTripDuration = tripDurations.length > 0
                    ? tripDurations.reduce(function (s, t) { return s + (t.actualTripTimeMinutes || 0); }, 0) / tripDurations.length
                    : 0;
                res.json({
                    success: true,
                    data: {
                        totalTrips: totalTrips,
                        completedTrips: completedTrips,
                        pendingTrips: pendingTrips,
                        cancelledTrips: cancelledTrips,
                        tripsByLevel: tripsByLevel_1,
                        tripsByPriority: tripsByPriority_1,
                        averageTripDuration: averageTripDuration
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error('Get agency trip statistics error:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve agency trip statistics'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/ems/analytics/units
 * Get agency-specific unit performance
 */
router.get('/units', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var agencyId, emsPrisma, _a, totalUnits, activeUnits, availableUnits, committedUnits, outOfServiceUnits, topPerformingUnits, averageUtilization, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                return [4 /*yield*/, resolveAgencyContext(req)];
            case 1:
                agencyId = (_b.sent()).agencyId;
                if (!agencyId) {
                    return [2 /*return*/, res.status(400).json({ success: false, error: 'Unable to resolve EMS agency' })];
                }
                emsPrisma = databaseManager_1.databaseManager.getEMSDB();
                return [4 /*yield*/, Promise.all([
                        emsPrisma.unit.count({ where: { agencyId: agencyId } }),
                        emsPrisma.unit.count({ where: { agencyId: agencyId, isActive: true } }),
                        emsPrisma.unit.count({ where: { agencyId: agencyId, currentStatus: 'AVAILABLE' } }),
                        emsPrisma.unit.count({ where: { agencyId: agencyId, currentStatus: { in: ['ASSIGNED', 'IN_PROGRESS'] } } }),
                        emsPrisma.unit.count({ where: { agencyId: agencyId, currentStatus: 'OUT_OF_SERVICE' } }),
                        emsPrisma.unit.findMany({
                            where: { agencyId: agencyId },
                            orderBy: { totalTripsCompleted: 'desc' },
                            take: 5,
                            select: { id: true, unitNumber: true, totalTripsCompleted: true, averageResponseTime: true }
                        })
                    ])];
            case 2:
                _a = _b.sent(), totalUnits = _a[0], activeUnits = _a[1], availableUnits = _a[2], committedUnits = _a[3], outOfServiceUnits = _a[4], topPerformingUnits = _a[5];
                averageUtilization = totalUnits > 0 ? committedUnits / totalUnits : 0;
                res.json({
                    success: true,
                    data: {
                        totalUnits: totalUnits,
                        activeUnits: activeUnits,
                        availableUnits: availableUnits,
                        committedUnits: committedUnits,
                        outOfServiceUnits: outOfServiceUnits,
                        averageUtilization: averageUtilization,
                        topPerformingUnits: topPerformingUnits
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                console.error('Get agency unit statistics error:', error_4);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve agency unit statistics'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/ems/analytics/performance
 * Get agency-specific performance metrics
 */
router.get('/performance', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var agencyId, prisma, _a, totalTrips, completedTrips, responseTimes, tripTimes, revenueAgg, averageResponseTime, averageTripTime, completionRate, totalRevenue, efficiency, error_5;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                return [4 /*yield*/, resolveAgencyContext(req)];
            case 1:
                agencyId = (_c.sent()).agencyId;
                if (!agencyId) {
                    return [2 /*return*/, res.status(400).json({ success: false, error: 'Unable to resolve EMS agency' })];
                }
                prisma = databaseManager_1.databaseManager.getCenterDB();
                return [4 /*yield*/, Promise.all([
                        prisma.trip.count({ where: { assignedAgencyId: agencyId } }),
                        prisma.trip.count({ where: { assignedAgencyId: agencyId, status: 'COMPLETED' } }),
                        prisma.trip.findMany({ where: { assignedAgencyId: agencyId, responseTimeMinutes: { not: null } }, select: { responseTimeMinutes: true } }),
                        prisma.trip.findMany({ where: { assignedAgencyId: agencyId, actualTripTimeMinutes: { not: null } }, select: { actualTripTimeMinutes: true } }),
                        prisma.trip.aggregate({ where: { assignedAgencyId: agencyId, tripCost: { not: null } }, _sum: { tripCost: true } })
                    ])];
            case 2:
                _a = _c.sent(), totalTrips = _a[0], completedTrips = _a[1], responseTimes = _a[2], tripTimes = _a[3], revenueAgg = _a[4];
                averageResponseTime = responseTimes.length > 0
                    ? responseTimes.reduce(function (s, t) { return s + (t.responseTimeMinutes || 0); }, 0) / responseTimes.length
                    : 0;
                averageTripTime = tripTimes.length > 0
                    ? tripTimes.reduce(function (s, t) { return s + (t.actualTripTimeMinutes || 0); }, 0) / tripTimes.length
                    : 0;
                completionRate = totalTrips > 0 ? completedTrips / totalTrips : 0;
                totalRevenue = Number(((_b = revenueAgg._sum) === null || _b === void 0 ? void 0 : _b.tripCost) || 0);
                efficiency = completionRate;
                res.json({
                    success: true,
                    data: {
                        averageResponseTime: averageResponseTime,
                        averageTripTime: averageTripTime,
                        completionRate: completionRate,
                        totalRevenue: totalRevenue,
                        efficiency: efficiency
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_5 = _c.sent();
                console.error('Get agency performance statistics error:', error_5);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve agency performance statistics'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
