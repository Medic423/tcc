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
var hospitalService_1 = require("../services/hospitalService");
var authenticateAdmin_1 = require("../middleware/authenticateAdmin");
var router = express_1.default.Router();
// Apply authentication to all routes
router.use(authenticateAdmin_1.authenticateAdmin);
/**
 * GET /api/tcc/hospitals
 * List all hospitals with optional filtering
 */
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filters, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                filters = {
                    name: req.query.name,
                    city: req.query.city,
                    state: req.query.state,
                    type: req.query.type,
                    region: req.query.region,
                    isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    limit: req.query.limit ? parseInt(req.query.limit) : 50
                };
                return [4 /*yield*/, hospitalService_1.hospitalService.getHospitals(filters)];
            case 1:
                result = _a.sent();
                res.json({
                    success: true,
                    data: result.hospitals,
                    pagination: {
                        page: result.page,
                        totalPages: result.totalPages,
                        total: result.total,
                        limit: filters.limit
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Get hospitals error:', error_1);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve hospitals'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/tcc/hospitals
 * Create new hospital
 */
router.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var hospitalData_1, requiredFields, missingFields, hospital, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                hospitalData_1 = req.body;
                requiredFields = ['name', 'address', 'city', 'state', 'zipCode', 'type', 'capabilities', 'region'];
                missingFields = requiredFields.filter(function (field) { return !hospitalData_1[field]; });
                if (missingFields.length > 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: "Missing required fields: ".concat(missingFields.join(', '))
                        })];
                }
                return [4 /*yield*/, hospitalService_1.hospitalService.createHospital(hospitalData_1)];
            case 1:
                hospital = _a.sent();
                res.status(201).json({
                    success: true,
                    message: 'Hospital created successfully',
                    data: hospital
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Create hospital error:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create hospital'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/tcc/hospitals/search
 * Search hospitals
 */
router.get('/search', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var q, hospitals, error_3;
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
                return [4 /*yield*/, hospitalService_1.hospitalService.searchHospitals(q)];
            case 1:
                hospitals = _a.sent();
                res.json({
                    success: true,
                    data: hospitals
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Search hospitals error:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Failed to search hospitals'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/tcc/hospitals/:id
 * Get hospital by ID
 */
router.get('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, hospital, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, hospitalService_1.hospitalService.getHospitalById(id)];
            case 1:
                hospital = _a.sent();
                if (!hospital) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Hospital not found'
                        })];
                }
                res.json({
                    success: true,
                    data: hospital
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Get hospital error:', error_4);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve hospital'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * PUT /api/tcc/hospitals/:id
 * Update hospital
 */
router.put('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, updateData, hospital, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                updateData = req.body;
                return [4 /*yield*/, hospitalService_1.hospitalService.updateHospital(id, updateData)];
            case 1:
                hospital = _a.sent();
                res.json({
                    success: true,
                    message: 'Hospital updated successfully',
                    data: hospital
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Update hospital error:', error_5);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update hospital'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * DELETE /api/tcc/hospitals/:id
 * Delete hospital
 */
router.delete('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, hospitalService_1.hospitalService.deleteHospital(id)];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: 'Hospital deleted successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Delete hospital error:', error_6);
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete hospital'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * PUT /api/tcc/hospitals/:id/approve
 * Approve hospital
 */
router.put('/:id/approve', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, approvedBy, hospital, error_7;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                approvedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!approvedBy) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'User not authenticated'
                        })];
                }
                return [4 /*yield*/, hospitalService_1.hospitalService.approveHospital(id, approvedBy)];
            case 1:
                hospital = _b.sent();
                res.json({
                    success: true,
                    message: 'Hospital approved successfully',
                    data: hospital
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _b.sent();
                console.error('Approve hospital error:', error_7);
                res.status(500).json({
                    success: false,
                    error: 'Failed to approve hospital'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * PUT /api/tcc/hospitals/:id/reject
 * Reject hospital
 */
router.put('/:id/reject', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, approvedBy, hospital, error_8;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                approvedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!approvedBy) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'User not authenticated'
                        })];
                }
                return [4 /*yield*/, hospitalService_1.hospitalService.rejectHospital(id, approvedBy)];
            case 1:
                hospital = _b.sent();
                res.json({
                    success: true,
                    message: 'Hospital rejected successfully',
                    data: hospital
                });
                return [3 /*break*/, 3];
            case 2:
                error_8 = _b.sent();
                console.error('Reject hospital error:', error_8);
                res.status(500).json({
                    success: false,
                    error: 'Failed to reject hospital'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
