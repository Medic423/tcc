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
 * POST /api/trips
 * Create a new transport request
 */
router.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, patientId, originFacilityId, destinationFacilityId, transportLevel, priority, specialNeeds, readyStart, readyEnd, isolation, bariatric, tripData, result, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Create trip request received:', req.body);
                _a = req.body, patientId = _a.patientId, originFacilityId = _a.originFacilityId, destinationFacilityId = _a.destinationFacilityId, transportLevel = _a.transportLevel, priority = _a.priority, specialNeeds = _a.specialNeeds, readyStart = _a.readyStart, readyEnd = _a.readyEnd, isolation = _a.isolation, bariatric = _a.bariatric;
                // Validation
                if (!patientId || !originFacilityId || !destinationFacilityId || !transportLevel || !priority) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Missing required fields: patientId, originFacilityId, destinationFacilityId, transportLevel, priority'
                        })];
                }
                if (!['BLS', 'ALS', 'CCT'].includes(transportLevel)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid transport level. Must be BLS, ALS, or CCT'
                        })];
                }
                if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid priority. Must be LOW, MEDIUM, HIGH, or CRITICAL'
                        })];
                }
                tripData = {
                    patientId: patientId,
                    originFacilityId: originFacilityId,
                    destinationFacilityId: destinationFacilityId,
                    transportLevel: transportLevel,
                    priority: priority,
                    specialNeeds: specialNeeds,
                    readyStart: readyStart,
                    readyEnd: readyEnd,
                    isolation: isolation || false,
                    bariatric: bariatric || false,
                    createdById: null, // TODO: Get from authenticated user
                };
                return [4 /*yield*/, tripService_1.tripService.createTrip(tripData)];
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
                    message: 'Transport request created successfully',
                    data: result.data
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('TCC_DEBUG: Create trip error:', error_1);
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
 * POST /api/trips/enhanced
 * Create a new enhanced transport request with comprehensive patient and clinical details
 */
router.post('/enhanced', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, patientId, patientWeight, specialNeeds, insuranceCompany, fromLocation, pickupLocationId, toLocation, scheduledTime, transportLevel, urgencyLevel, diagnosis, mobilityLevel, oxygenRequired, monitoringRequired, generateQRCode, selectedAgencies, notificationRadius, notes, priority, finalScheduledTime, enhancedTripData, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Create enhanced trip request received:', req.body);
                _a = req.body, patientId = _a.patientId, patientWeight = _a.patientWeight, specialNeeds = _a.specialNeeds, insuranceCompany = _a.insuranceCompany, fromLocation = _a.fromLocation, pickupLocationId = _a.pickupLocationId, toLocation = _a.toLocation, scheduledTime = _a.scheduledTime, transportLevel = _a.transportLevel, urgencyLevel = _a.urgencyLevel, diagnosis = _a.diagnosis, mobilityLevel = _a.mobilityLevel, oxygenRequired = _a.oxygenRequired, monitoringRequired = _a.monitoringRequired, generateQRCode = _a.generateQRCode, selectedAgencies = _a.selectedAgencies, notificationRadius = _a.notificationRadius, notes = _a.notes, priority = _a.priority;
                // Validation
                if (!fromLocation || !toLocation || !transportLevel || !urgencyLevel) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Missing required fields: fromLocation, toLocation, transportLevel, urgencyLevel'
                        })];
                }
                finalScheduledTime = scheduledTime || new Date().toISOString();
                if (!['BLS', 'ALS', 'CCT', 'Other'].includes(transportLevel)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid transport level. Must be BLS, ALS, CCT, or Other'
                        })];
                }
                if (!['Routine', 'Urgent', 'Emergent'].includes(urgencyLevel)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid urgency level. Must be Routine, Urgent, or Emergent'
                        })];
                }
                enhancedTripData = {
                    patientId: patientId,
                    patientWeight: patientWeight,
                    specialNeeds: specialNeeds,
                    insuranceCompany: insuranceCompany,
                    fromLocation: fromLocation,
                    pickupLocationId: pickupLocationId,
                    toLocation: toLocation,
                    scheduledTime: finalScheduledTime,
                    transportLevel: transportLevel,
                    urgencyLevel: urgencyLevel,
                    diagnosis: diagnosis,
                    mobilityLevel: mobilityLevel,
                    oxygenRequired: oxygenRequired || false,
                    monitoringRequired: monitoringRequired || false,
                    generateQRCode: generateQRCode || false,
                    selectedAgencies: selectedAgencies || [],
                    notificationRadius: notificationRadius || 100,
                    notes: notes,
                    priority: priority
                };
                return [4 /*yield*/, tripService_1.tripService.createEnhancedTrip(enhancedTripData)];
            case 1:
                result = _b.sent();
                console.log('TCC_DEBUG: Enhanced trip created successfully:', result);
                res.status(201).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('TCC_DEBUG: Error creating enhanced trip:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create enhanced transport request'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/trips
 * Get all transport requests with optional filtering
 */
router.get('/', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filters, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Get trips request with query:', req.query);
                filters = {
                    status: req.query.status,
                    transportLevel: req.query.transportLevel,
                    priority: req.query.priority,
                    agencyId: req.query.agencyId,
                };
                return [4 /*yield*/, tripService_1.tripService.getTrips(filters)];
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
                console.error('TCC_DEBUG: Get trips error:', error_3);
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
 * GET /api/trips/history
 * Get trip history with timeline and filtering
 */
router.get('/history', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, status_1, agencyId, dateFrom, dateTo, _b, limit, _c, offset, search, result, error_4;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Get trip history request with query:', req.query);
                _a = req.query, status_1 = _a.status, agencyId = _a.agencyId, dateFrom = _a.dateFrom, dateTo = _a.dateTo, _b = _a.limit, limit = _b === void 0 ? '50' : _b, _c = _a.offset, offset = _c === void 0 ? '0' : _c, search = _a.search;
                return [4 /*yield*/, tripService_1.tripService.getTripHistory({
                        status: status_1,
                        agencyId: agencyId,
                        dateFrom: dateFrom,
                        dateTo: dateTo,
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        search: search
                    })];
            case 1:
                result = _d.sent();
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
                error_4 = _d.sent();
                console.error('TCC_DEBUG: Get trip history error:', error_4);
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
 * GET /api/trips/:id
 * Get a single transport request by ID
 */
router.get('/:id', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Get trip by ID request:', req.params.id);
                id = req.params.id;
                return [4 /*yield*/, tripService_1.tripService.getTripById(id)];
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
                error_5 = _a.sent();
                console.error('TCC_DEBUG: Get trip by ID error:', error_5);
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
 * PUT /api/trips/:id/status
 * Update trip status (accept/decline/complete)
 */
router.put('/:id/status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, status_2, assignedAgencyId, assignedUnitId, acceptedTimestamp, pickupTimestamp, completionTimestamp, updateData, result, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Update trip status request:', { id: req.params.id, body: req.body });
                id = req.params.id;
                _a = req.body, status_2 = _a.status, assignedAgencyId = _a.assignedAgencyId, assignedUnitId = _a.assignedUnitId, acceptedTimestamp = _a.acceptedTimestamp, pickupTimestamp = _a.pickupTimestamp, completionTimestamp = _a.completionTimestamp;
                if (!status_2) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Status is required'
                        })];
                }
                if (!['PENDING', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status_2)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid status. Must be PENDING, ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED, or CANCELLED'
                        })];
                }
                updateData = {
                    status: status_2,
                    assignedAgencyId: assignedAgencyId,
                    assignedUnitId: assignedUnitId,
                    acceptedTimestamp: acceptedTimestamp,
                    pickupTimestamp: pickupTimestamp,
                    completionTimestamp: completionTimestamp,
                };
                return [4 /*yield*/, tripService_1.tripService.updateTripStatus(id, updateData)];
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
                    message: 'Transport request status updated successfully',
                    data: result.data
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _b.sent();
                console.error('TCC_DEBUG: Update trip status error:', error_6);
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
 * GET /api/trips/agencies/available
 * Get available EMS agencies for assignment
 */
router.get('/agencies/available', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Get available agencies request');
                return [4 /*yield*/, tripService_1.tripService.getAvailableAgencies()];
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
                error_7 = _a.sent();
                console.error('TCC_DEBUG: Get available agencies error:', error_7);
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
 * GET /api/trips/notifications/settings
 * Get notification settings for a user
 */
router.get('/notifications/settings', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, settings, error_8;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Get notification settings request for user:', (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'User not authenticated'
                        })];
                }
                return [4 /*yield*/, tripService_1.tripService.getNotificationSettings(userId)];
            case 1:
                settings = _c.sent();
                res.json({
                    success: true,
                    data: settings
                });
                return [3 /*break*/, 3];
            case 2:
                error_8 = _c.sent();
                console.error('TCC_DEBUG: Get notification settings error:', error_8);
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
 * PUT /api/trips/notifications/settings
 * Update notification settings for a user
 */
router.put('/notifications/settings', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, emailNotifications, smsNotifications, newTripAlerts, statusUpdates, emailAddress, phoneNumber, settings, result, error_9;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Update notification settings request for user:', (_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
                userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'User not authenticated'
                        })];
                }
                _a = req.body, emailNotifications = _a.emailNotifications, smsNotifications = _a.smsNotifications, newTripAlerts = _a.newTripAlerts, statusUpdates = _a.statusUpdates, emailAddress = _a.emailAddress, phoneNumber = _a.phoneNumber;
                settings = {
                    emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
                    smsNotifications: smsNotifications !== undefined ? smsNotifications : true,
                    newTripAlerts: newTripAlerts !== undefined ? newTripAlerts : true,
                    statusUpdates: statusUpdates !== undefined ? statusUpdates : true,
                    emailAddress: emailAddress || null,
                    phoneNumber: phoneNumber || null
                };
                return [4 /*yield*/, tripService_1.tripService.updateNotificationSettings(userId, settings)];
            case 1:
                result = _d.sent();
                if (!result.success) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: result.error
                        })];
                }
                res.json({
                    success: true,
                    message: 'Notification settings updated successfully',
                    data: settings
                });
                return [3 /*break*/, 3];
            case 2:
                error_9 = _d.sent();
                console.error('TCC_DEBUG: Update notification settings error:', error_9);
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
 * POST /api/trips/test-email
 * Test email service connection
 */
router.post('/test-email', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var emailService, isConnected, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                console.log('TCC_DEBUG: Test email service request received');
                console.log('TCC_DEBUG: Authenticated user:', req.user);
                console.log('TCC_DEBUG: Importing email service...');
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../services/emailService'); })];
            case 1:
                emailService = (_a.sent()).default;
                console.log('TCC_DEBUG: Email service imported successfully');
                console.log('TCC_DEBUG: Testing email connection...');
                return [4 /*yield*/, emailService.testEmailConnection()];
            case 2:
                isConnected = _a.sent();
                console.log('TCC_DEBUG: Email connection test result:', isConnected);
                if (isConnected) {
                    console.log('TCC_DEBUG: Email service connection successful');
                    res.json({
                        success: true,
                        message: 'Email service connection successful'
                    });
                }
                else {
                    console.log('TCC_DEBUG: Email service connection failed');
                    res.status(500).json({
                        success: false,
                        error: 'Email service connection failed'
                    });
                }
                return [3 /*break*/, 4];
            case 3:
                error_10 = _a.sent();
                console.error('TCC_DEBUG: Test email service error:', error_10);
                console.error('TCC_DEBUG: Error stack:', error_10 === null || error_10 === void 0 ? void 0 : error_10.stack);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error: ' + ((error_10 === null || error_10 === void 0 ? void 0 : error_10.message) || 'Unknown error')
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/trips/test-sms
 * Test SMS service connection
 */
router.post('/test-sms', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var emailService, isConnected, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                console.log('TCC_DEBUG: Test SMS service request received');
                console.log('TCC_DEBUG: Authenticated user:', req.user);
                console.log('TCC_DEBUG: Importing email service for SMS...');
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../services/emailService'); })];
            case 1:
                emailService = (_a.sent()).default;
                console.log('TCC_DEBUG: Email service imported successfully for SMS');
                console.log('TCC_DEBUG: Testing SMS connection...');
                return [4 /*yield*/, emailService.testSMSConnection()];
            case 2:
                isConnected = _a.sent();
                console.log('TCC_DEBUG: SMS connection test result:', isConnected);
                if (isConnected) {
                    console.log('TCC_DEBUG: SMS service connection successful');
                    res.json({
                        success: true,
                        message: 'SMS service connection successful'
                    });
                }
                else {
                    console.log('TCC_DEBUG: SMS service connection failed');
                    res.status(500).json({
                        success: false,
                        error: 'SMS service connection failed'
                    });
                }
                return [3 /*break*/, 4];
            case 3:
                error_11 = _a.sent();
                console.error('TCC_DEBUG: Test SMS service error:', error_11);
                console.error('TCC_DEBUG: Error stack:', error_11 === null || error_11 === void 0 ? void 0 : error_11.stack);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error: ' + ((error_11 === null || error_11 === void 0 ? void 0 : error_11.message) || 'Unknown error')
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/trips/agencies/:hospitalId
 * Get agencies within distance for a hospital
 */
router.get('/agencies/:hospitalId', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var hospitalId, _a, radius, result, error_12;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                hospitalId = req.params.hospitalId;
                _a = req.query.radius, radius = _a === void 0 ? 100 : _a;
                return [4 /*yield*/, tripService_1.tripService.getAgenciesForHospital(hospitalId, Number(radius))];
            case 1:
                result = _b.sent();
                res.json(result);
                return [3 /*break*/, 3];
            case 2:
                error_12 = _b.sent();
                console.error('TCC_DEBUG: Get agencies error:', error_12);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get agencies for hospital'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * PUT /api/trips/:id/times
 * Update trip time tracking
 */
router.put('/:id/times', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, transferAcceptedTime, emsArrivalTime, emsDepartureTime, result, error_13;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, transferAcceptedTime = _a.transferAcceptedTime, emsArrivalTime = _a.emsArrivalTime, emsDepartureTime = _a.emsDepartureTime;
                return [4 /*yield*/, tripService_1.tripService.updateTripTimes(id, {
                        transferAcceptedTime: transferAcceptedTime,
                        emsArrivalTime: emsArrivalTime,
                        emsDepartureTime: emsDepartureTime
                    })];
            case 1:
                result = _b.sent();
                res.json(result);
                return [3 /*break*/, 3];
            case 2:
                error_13 = _b.sent();
                console.error('TCC_DEBUG: Update trip times error:', error_13);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update trip times'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/trips/options/diagnosis
 * Get diagnosis options
 */
router.get('/options/diagnosis', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        try {
            result = tripService_1.tripService.getDiagnosisOptions();
            res.json(result);
        }
        catch (error) {
            console.error('TCC_DEBUG: Get diagnosis options error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get diagnosis options'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * GET /api/trips/options/mobility
 * Get mobility options
 */
router.get('/options/mobility', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        try {
            result = tripService_1.tripService.getMobilityOptions();
            res.json(result);
        }
        catch (error) {
            console.error('TCC_DEBUG: Get mobility options error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get mobility options'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * GET /api/trips/options/transport-level
 * Get transport level options
 */
router.get('/options/transport-level', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        try {
            result = tripService_1.tripService.getTransportLevelOptions();
            res.json(result);
        }
        catch (error) {
            console.error('TCC_DEBUG: Get transport level options error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get transport level options'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * GET /api/trips/options/urgency
 * Get urgency options
 */
router.get('/options/urgency', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        try {
            result = tripService_1.tripService.getUrgencyOptions();
            res.json(result);
        }
        catch (error) {
            console.error('TCC_DEBUG: Get urgency options error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get urgency options'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * GET /api/trips/options/insurance
 * Get insurance company options
 */
router.get('/options/insurance', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, tripService_1.tripService.getInsuranceOptions()];
            case 1:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 3];
            case 2:
                error_14 = _a.sent();
                console.error('TCC_DEBUG: Get insurance options error:', error_14);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get insurance options'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ============================================================================
// NEW TRIP ENDPOINTS WITH RESPONSE HANDLING
// Phase 1C: Basic API Endpoints implementation
// ============================================================================
/**
 * POST /api/trips/with-responses
 * Create a new trip with response handling capabilities
 */
router.post('/with-responses', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, patientId, patientWeight, specialNeeds, insuranceCompany, fromLocation, pickupLocationId, toLocation, scheduledTime, transportLevel, urgencyLevel, diagnosis, mobilityLevel, oxygenRequired, monitoringRequired, generateQRCode, selectedAgencies, notificationRadius, notes, priority, responseDeadline, maxResponses, selectionMode, tripData, result, error_15;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Create trip with responses request received:', req.body);
                _a = req.body, patientId = _a.patientId, patientWeight = _a.patientWeight, specialNeeds = _a.specialNeeds, insuranceCompany = _a.insuranceCompany, fromLocation = _a.fromLocation, pickupLocationId = _a.pickupLocationId, toLocation = _a.toLocation, scheduledTime = _a.scheduledTime, transportLevel = _a.transportLevel, urgencyLevel = _a.urgencyLevel, diagnosis = _a.diagnosis, mobilityLevel = _a.mobilityLevel, oxygenRequired = _a.oxygenRequired, monitoringRequired = _a.monitoringRequired, generateQRCode = _a.generateQRCode, selectedAgencies = _a.selectedAgencies, notificationRadius = _a.notificationRadius, notes = _a.notes, priority = _a.priority, responseDeadline = _a.responseDeadline, maxResponses = _a.maxResponses, selectionMode = _a.selectionMode;
                // Validation
                if (!fromLocation || !toLocation || !transportLevel || !urgencyLevel) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Missing required fields: fromLocation, toLocation, transportLevel, urgencyLevel'
                        })];
                }
                if (!['BLS', 'ALS', 'CCT', 'Other'].includes(transportLevel)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid transport level. Must be BLS, ALS, CCT, or Other'
                        })];
                }
                if (!['Routine', 'Urgent', 'Emergent'].includes(urgencyLevel)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid urgency level. Must be Routine, Urgent, or Emergent'
                        })];
                }
                if (selectionMode && !['BROADCAST', 'SPECIFIC_AGENCIES'].includes(selectionMode)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid selection mode. Must be BROADCAST or SPECIFIC_AGENCIES'
                        })];
                }
                tripData = {
                    patientId: patientId,
                    patientWeight: patientWeight,
                    specialNeeds: specialNeeds,
                    insuranceCompany: insuranceCompany,
                    fromLocation: fromLocation,
                    pickupLocationId: pickupLocationId,
                    toLocation: toLocation,
                    scheduledTime: scheduledTime || new Date().toISOString(),
                    transportLevel: transportLevel,
                    urgencyLevel: urgencyLevel,
                    diagnosis: diagnosis,
                    mobilityLevel: mobilityLevel,
                    oxygenRequired: oxygenRequired || false,
                    monitoringRequired: monitoringRequired || false,
                    generateQRCode: generateQRCode || false,
                    selectedAgencies: selectedAgencies || [],
                    notificationRadius: notificationRadius || 100,
                    notes: notes,
                    priority: priority,
                    responseDeadline: responseDeadline,
                    maxResponses: maxResponses || 5,
                    selectionMode: selectionMode || 'SPECIFIC_AGENCIES'
                };
                return [4 /*yield*/, tripService_1.tripService.createTripWithResponses(tripData)];
            case 1:
                result = _b.sent();
                console.log('TCC_DEBUG: Trip with responses created successfully:', result);
                res.status(201).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_15 = _b.sent();
                console.error('TCC_DEBUG: Error creating trip with responses:', error_15);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create trip with response handling'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * PUT /api/trips/:id/response-fields
 * Update trip response handling fields
 */
router.put('/:id/response-fields', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, responseDeadline, maxResponses, responseStatus, selectionMode, updateData, result, error_16;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Update trip response fields request:', { id: req.params.id, body: req.body });
                id = req.params.id;
                _a = req.body, responseDeadline = _a.responseDeadline, maxResponses = _a.maxResponses, responseStatus = _a.responseStatus, selectionMode = _a.selectionMode;
                if (responseStatus && !['PENDING', 'RESPONSES_RECEIVED', 'AGENCY_SELECTED'].includes(responseStatus)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid response status. Must be PENDING, RESPONSES_RECEIVED, or AGENCY_SELECTED'
                        })];
                }
                if (selectionMode && !['BROADCAST', 'SPECIFIC_AGENCIES'].includes(selectionMode)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid selection mode. Must be BROADCAST or SPECIFIC_AGENCIES'
                        })];
                }
                updateData = {
                    responseDeadline: responseDeadline,
                    maxResponses: maxResponses,
                    responseStatus: responseStatus,
                    selectionMode: selectionMode
                };
                return [4 /*yield*/, tripService_1.tripService.updateTripResponseFields(id, updateData)];
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
                    message: 'Trip response fields updated successfully',
                    data: result.data
                });
                return [3 /*break*/, 3];
            case 2:
                error_16 = _b.sent();
                console.error('TCC_DEBUG: Update trip response fields error:', error_16);
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
 * GET /api/trips/:id/with-responses
 * Get a trip with all agency responses
 */
router.get('/:id/with-responses', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_17;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Get trip with responses request:', req.params.id);
                id = req.params.id;
                return [4 /*yield*/, tripService_1.tripService.getTripWithResponses(id)];
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
                error_17 = _a.sent();
                console.error('TCC_DEBUG: Get trip with responses error:', error_17);
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
 * GET /api/trips/:id/response-summary
 * Get response summary for a trip
 */
router.get('/:id/response-summary', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_18;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Get response summary request:', req.params.id);
                id = req.params.id;
                return [4 /*yield*/, tripService_1.tripService.getTripResponseSummary(id)];
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
                error_18 = _a.sent();
                console.error('TCC_DEBUG: Get response summary error:', error_18);
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
