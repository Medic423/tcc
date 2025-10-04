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
var agencyService_1 = require("../services/agencyService");
var router = express_1.default.Router();
// Test endpoint without authentication for debugging
router.get('/test', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var agencyService_2, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Test agencies endpoint called');
                agencyService_2 = require('../services/agencyService').agencyService;
                return [4 /*yield*/, agencyService_2.getAgencies({})];
            case 1:
                result = _a.sent();
                console.log('TCC_DEBUG: Test agencies result:', result);
                res.json({
                    success: true,
                    data: result.agencies,
                    total: result.total,
                    message: 'Test endpoint - authentication bypassed'
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('TCC_DEBUG: Test agencies error:', error_1);
                res.status(500).json({
                    success: false,
                    error: 'Test endpoint failed: ' + error_1.message
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Temporarily disable authentication for testing
// router.use(authenticateAdmin);
/**
 * GET /api/tcc/agencies
 * List all EMS agencies with optional filtering
 */
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filters, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                filters = {
                    name: req.query.name,
                    city: req.query.city,
                    state: req.query.state,
                    capabilities: req.query.capabilities ? req.query.capabilities.split(',') : undefined,
                    isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    limit: req.query.limit ? parseInt(req.query.limit) : 50
                };
                return [4 /*yield*/, agencyService_1.agencyService.getAgencies(filters)];
            case 1:
                result = _a.sent();
                res.json({
                    success: true,
                    data: result.agencies,
                    pagination: {
                        page: result.page,
                        totalPages: result.totalPages,
                        total: result.total,
                        limit: filters.limit
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Get agencies error:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve agencies'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/tcc/agencies
 * Create new EMS agency
 */
router.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var agencyData_1, requiredFields, missingFields, agency, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                agencyData_1 = req.body;
                requiredFields = ['name', 'contactName', 'phone', 'email', 'address', 'city', 'state', 'zipCode', 'capabilities'];
                missingFields = requiredFields.filter(function (field) { return !agencyData_1[field]; });
                if (missingFields.length > 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: "Missing required fields: ".concat(missingFields.join(', '))
                        })];
                }
                return [4 /*yield*/, agencyService_1.agencyService.createAgency(agencyData_1)];
            case 1:
                agency = _a.sent();
                res.status(201).json({
                    success: true,
                    message: 'Agency created successfully',
                    data: agency
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Create agency error:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create agency'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/tcc/agencies/:id
 * Get agency by ID
 */
router.get('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, agency, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, agencyService_1.agencyService.getAgencyById(id)];
            case 1:
                agency = _a.sent();
                if (!agency) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Agency not found'
                        })];
                }
                res.json({
                    success: true,
                    data: agency
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Get agency error:', error_4);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve agency'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * PUT /api/tcc/agencies/:id
 * Update agency
 */
router.put('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, updateData, agency, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                updateData = req.body;
                return [4 /*yield*/, agencyService_1.agencyService.updateAgency(id, updateData)];
            case 1:
                agency = _a.sent();
                res.json({
                    success: true,
                    message: 'Agency updated successfully',
                    data: agency
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Update agency error:', error_5);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update agency'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * DELETE /api/tcc/agencies/:id
 * Delete agency
 */
router.delete('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, agencyService_1.agencyService.deleteAgency(id)];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: 'Agency deleted successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Delete agency error:', error_6);
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete agency'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/tcc/agencies/search
 * Search agencies
 */
router.get('/search', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var q, agencies, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                q = req.query.q;
                if (!q || typeof q !== 'string') {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Search query is required'
                        })];
                }
                return [4 /*yield*/, agencyService_1.agencyService.searchAgencies(q)];
            case 1:
                agencies = _a.sent();
                res.json({
                    success: true,
                    data: agencies
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Search agencies error:', error_7);
                res.status(500).json({
                    success: false,
                    error: 'Failed to search agencies'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
