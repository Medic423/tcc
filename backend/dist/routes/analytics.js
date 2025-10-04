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
var analyticsService_1 = require("../services/analyticsService");
var authenticateAdmin_1 = require("../middleware/authenticateAdmin");
var router = express_1.default.Router();
// Apply authentication to all routes
router.use(authenticateAdmin_1.authenticateAdmin);
/**
 * GET /api/tcc/analytics/overview
 * Get system overview metrics
 */
router.get('/overview', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var overview, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, analyticsService_1.analyticsService.getSystemOverview()];
            case 1:
                overview = _a.sent();
                res.json({
                    success: true,
                    data: overview
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Get system overview error:', error_1);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve system overview'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/tcc/analytics/trips
 * Get trip statistics
 */
router.get('/trips', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tripStats, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, analyticsService_1.analyticsService.getTripStatistics()];
            case 1:
                tripStats = _a.sent();
                res.json({
                    success: true,
                    data: tripStats
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Get trip statistics error:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve trip statistics'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/tcc/analytics/agencies
 * Get agency performance data
 */
router.get('/agencies', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var agencyPerformance, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, analyticsService_1.analyticsService.getAgencyPerformance()];
            case 1:
                agencyPerformance = _a.sent();
                res.json({
                    success: true,
                    data: agencyPerformance
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Get agency performance error:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve agency performance'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/tcc/analytics/hospitals
 * Get hospital activity data
 */
router.get('/hospitals', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var hospitalActivity, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, analyticsService_1.analyticsService.getHospitalActivity()];
            case 1:
                hospitalActivity = _a.sent();
                res.json({
                    success: true,
                    data: hospitalActivity
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Get hospital activity error:', error_4);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve hospital activity'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/tcc/analytics/cost-breakdowns
 * Get trip cost breakdowns
 */
router.get('/cost-breakdowns', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tripId, limit, limitNum, breakdowns, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, tripId = _a.tripId, limit = _a.limit;
                limitNum = limit ? parseInt(limit) : 100;
                return [4 /*yield*/, analyticsService_1.analyticsService.getTripCostBreakdowns(tripId, limitNum)];
            case 1:
                breakdowns = _b.sent();
                res.json({
                    success: true,
                    data: breakdowns
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _b.sent();
                console.error('Get cost breakdowns error:', error_5);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve cost breakdowns'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/tcc/analytics/cost-analysis
 * Get cost analysis summary
 */
router.get('/cost-analysis', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, startDate, endDate, start, end, summary, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                start = startDate ? new Date(startDate) : undefined;
                end = endDate ? new Date(endDate) : undefined;
                return [4 /*yield*/, analyticsService_1.analyticsService.getCostAnalysisSummary(start, end)];
            case 1:
                summary = _b.sent();
                res.json({
                    success: true,
                    data: summary
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _b.sent();
                console.error('Get cost analysis error:', error_6);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve cost analysis'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/tcc/analytics/profitability
 * Get profitability analysis
 */
router.get('/profitability', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var period, periodStr, analysis, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                period = req.query.period;
                periodStr = period || 'month';
                return [4 /*yield*/, analyticsService_1.analyticsService.getProfitabilityAnalysis(periodStr)];
            case 1:
                analysis = _a.sent();
                res.json({
                    success: true,
                    data: analysis
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Get profitability analysis error:', error_7);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve profitability analysis'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/tcc/analytics/cost-breakdown
 * Create a new trip cost breakdown
 */
router.post('/cost-breakdown', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tripId, breakdownData, breakdown, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, tripId = _a.tripId, breakdownData = _a.breakdownData;
                if (!tripId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Trip ID is required'
                        })];
                }
                return [4 /*yield*/, analyticsService_1.analyticsService.createTripCostBreakdown(tripId, breakdownData)];
            case 1:
                breakdown = _b.sent();
                res.json({
                    success: true,
                    data: breakdown
                });
                return [3 /*break*/, 3];
            case 2:
                error_8 = _b.sent();
                console.error('Create cost breakdown error:', error_8);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create cost breakdown'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
