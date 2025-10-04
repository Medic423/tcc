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
var tripService_1 = require("../services/tripService");
var authenticateAdmin_1 = require("../middleware/authenticateAdmin");
var router = express_1.default.Router();
/**
 * POST /api/agency-responses
 * Create a new agency response
 */
router.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tripId, agencyId, response, responseNotes, estimatedArrival, result, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Create agency response request received:', req.body);
                _a = req.body, tripId = _a.tripId, agencyId = _a.agencyId, response = _a.response, responseNotes = _a.responseNotes, estimatedArrival = _a.estimatedArrival;
                // Validation
                if (!tripId || !agencyId || !response) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Missing required fields: tripId, agencyId, response'
                        })];
                }
                if (!['ACCEPTED', 'DECLINED'].includes(response)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid response. Must be ACCEPTED or DECLINED'
                        })];
                }
                return [4 /*yield*/, tripService_1.tripService.createAgencyResponse({
                        tripId: tripId,
                        agencyId: agencyId,
                        response: response,
                        responseNotes: responseNotes,
                        estimatedArrival: estimatedArrival
                    })];
            case 1:
                result = _b.sent();
                if (!result.success) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: result.error
                        })];
                }
                res.status(201).json({
                    success: true,
                    message: 'Agency response created successfully',
                    data: result.data
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('TCC_DEBUG: Create agency response error:', error_1);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * PUT /api/agency-responses/:id
 * Update an existing agency response
 */
router.put('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, response, responseNotes, estimatedArrival, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Update agency response request:', { id: req.params.id, body: req.body });
                id = req.params.id;
                _a = req.body, response = _a.response, responseNotes = _a.responseNotes, estimatedArrival = _a.estimatedArrival;
                if (response && !['ACCEPTED', 'DECLINED'].includes(response)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid response. Must be ACCEPTED or DECLINED'
                        })];
                }
                return [4 /*yield*/, tripService_1.tripService.updateAgencyResponse(id, {
                        response: response,
                        responseNotes: responseNotes,
                        estimatedArrival: estimatedArrival
                    })];
            case 1:
                result = _b.sent();
                if (!result.success) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: result.error
                        })];
                }
                res.json({
                    success: true,
                    message: 'Agency response updated successfully',
                    data: result.data
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('TCC_DEBUG: Update agency response error:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/agency-responses
 * Get agency responses with optional filtering
 */
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filters, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Get agency responses request with query:', req.query);
                filters = {
                    tripId: req.query.tripId,
                    agencyId: req.query.agencyId,
                    response: req.query.response,
                    isSelected: req.query.isSelected ? req.query.isSelected === 'true' : undefined,
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo,
                };
                return [4 /*yield*/, tripService_1.tripService.getAgencyResponses(filters)];
            case 1:
                result = _a.sent();
                if (!result.success) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: result.error
                        })];
                }
                res.json({
                    success: true,
                    data: result.data
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('TCC_DEBUG: Get agency responses error:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/agency-responses/:id
 * Get a single agency response by ID
 */
router.get('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Get agency response by ID request:', req.params.id);
                id = req.params.id;
                return [4 /*yield*/, tripService_1.tripService.getAgencyResponseById(id)];
            case 1:
                result = _a.sent();
                if (!result.success) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: result.error
                        })];
                }
                res.json({
                    success: true,
                    data: result.data
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('TCC_DEBUG: Get agency response by ID error:', error_4);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/agency-responses/select/:tripId
 * Select an agency for a trip
 */
router.post('/select/:tripId', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tripId, _a, agencyResponseId, selectionNotes, result, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Select agency for trip request:', { tripId: req.params.tripId, body: req.body });
                tripId = req.params.tripId;
                _a = req.body, agencyResponseId = _a.agencyResponseId, selectionNotes = _a.selectionNotes;
                if (!agencyResponseId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Missing required field: agencyResponseId'
                        })];
                }
                return [4 /*yield*/, tripService_1.tripService.selectAgencyForTrip(tripId, {
                        agencyResponseId: agencyResponseId,
                        selectionNotes: selectionNotes
                    })];
            case 1:
                result = _b.sent();
                if (!result.success) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: result.error
                        })];
                }
                res.json({
                    success: true,
                    message: 'Agency selected successfully for trip',
                    data: result.data
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _b.sent();
                console.error('TCC_DEBUG: Select agency for trip error:', error_5);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/agency-responses/trip/:tripId
 * Get all responses for a specific trip
 */
router.get('/trip/:tripId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tripId, result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Get trip with responses request:', req.params.tripId);
                tripId = req.params.tripId;
                return [4 /*yield*/, tripService_1.tripService.getTripWithResponses(tripId)];
            case 1:
                result = _a.sent();
                if (!result.success) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: result.error
                        })];
                }
                res.json({
                    success: true,
                    data: result.data
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('TCC_DEBUG: Get trip with responses error:', error_6);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/agency-responses/summary/:tripId
 * Get response summary for a trip
 */
router.get('/summary/:tripId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tripId, result, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Get response summary request:', req.params.tripId);
                tripId = req.params.tripId;
                return [4 /*yield*/, tripService_1.tripService.getTripResponseSummary(tripId)];
            case 1:
                result = _a.sent();
                if (!result.success) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: result.error
                        })];
                }
                res.json({
                    success: true,
                    data: result.data
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('TCC_DEBUG: Get response summary error:', error_7);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
