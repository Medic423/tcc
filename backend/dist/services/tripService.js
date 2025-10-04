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
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripService = exports.TripService = void 0;
var databaseManager_1 = require("./databaseManager");
var emailService_1 = require("./emailService");
var patientIdService_1 = require("./patientIdService");
var prisma = databaseManager_1.databaseManager.getCenterDB();
var TripService = /** @class */ (function () {
    function TripService() {
    }
    /**
     * Create a new enhanced transport request
     */
    TripService.prototype.createEnhancedTrip = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var patientId, tripNumber, qrCodeData, priorityMap, priority, scheduledTime, transferRequestTime, insurancePricing, revenueData, tripData, centerTrip, emsPrisma, emsError_1, hospitalPrisma, hospitalError_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Creating enhanced trip with data:', data);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 13]);
                        patientId = data.patientId || patientIdService_1.PatientIdService.generatePatientId();
                        tripNumber = "TRP-".concat(Date.now());
                        qrCodeData = null;
                        if (data.generateQRCode) {
                            qrCodeData = patientIdService_1.PatientIdService.generateQRCodeData(tripNumber, patientId);
                        }
                        priorityMap = {
                            'Routine': 'LOW',
                            'Urgent': 'MEDIUM',
                            'Emergent': 'HIGH'
                        };
                        priority = data.priority || priorityMap[data.urgencyLevel] || 'LOW';
                        scheduledTime = new Date(data.scheduledTime);
                        transferRequestTime = new Date();
                        insurancePricing = this.calculateInsurancePricing(data.insuranceCompany, data.transportLevel);
                        revenueData = this.calculateTripRevenue(data.transportLevel, priority, data.specialNeeds);
                        tripData = {
                            tripNumber: tripNumber,
                            patientId: patientId,
                            patientWeight: data.patientWeight ? String(data.patientWeight) : null,
                            specialNeeds: data.specialNeeds || null,
                            insuranceCompany: data.insuranceCompany || null,
                            fromLocation: data.fromLocation,
                            pickupLocationId: data.pickupLocationId || null,
                            toLocation: data.toLocation,
                            scheduledTime: scheduledTime,
                            transportLevel: data.transportLevel,
                            urgencyLevel: data.urgencyLevel,
                            diagnosis: data.diagnosis || null,
                            mobilityLevel: data.mobilityLevel || null,
                            oxygenRequired: data.oxygenRequired || false,
                            monitoringRequired: data.monitoringRequired || false,
                            generateQRCode: data.generateQRCode || false,
                            qrCodeData: qrCodeData,
                            selectedAgencies: data.selectedAgencies || [],
                            notificationRadius: data.notificationRadius || 100,
                            transferRequestTime: transferRequestTime,
                            status: 'PENDING',
                            priority: priority,
                            notes: data.notes || null,
                            assignedTo: null,
                            // Insurance-specific pricing
                            insurancePayRate: insurancePricing.payRate,
                            perMileRate: insurancePricing.perMileRate,
                            // Revenue and distance tracking
                            tripCost: revenueData.tripCost,
                            distanceMiles: revenueData.estimatedDistance,
                        };
                        return [4 /*yield*/, prisma.trip.create({
                                data: tripData,
                            })];
                    case 2:
                        centerTrip = _a.sent();
                        console.log('TCC_DEBUG: Enhanced trip created in Center DB:', centerTrip);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        emsPrisma = databaseManager_1.databaseManager.getEMSDB();
                        return [4 /*yield*/, emsPrisma.transportRequest.create({
                                data: __assign(__assign({}, tripData), { 
                                    // EMS-specific fields
                                    originFacilityId: null, destinationFacilityId: null, createdById: null }),
                            })];
                    case 4:
                        _a.sent();
                        console.log('TCC_DEBUG: Trip synced to EMS database');
                        return [3 /*break*/, 6];
                    case 5:
                        emsError_1 = _a.sent();
                        console.error('TCC_DEBUG: Error syncing to EMS database:', emsError_1);
                        return [3 /*break*/, 6];
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        hospitalPrisma = databaseManager_1.databaseManager.getHospitalDB();
                        return [4 /*yield*/, hospitalPrisma.transportRequest.create({
                                data: __assign(__assign({}, tripData), { 
                                    // Hospital-specific fields
                                    originFacilityId: null, destinationFacilityId: null, healthcareCreatedById: null }),
                            })];
                    case 7:
                        _a.sent();
                        console.log('TCC_DEBUG: Trip synced to Hospital database');
                        return [3 /*break*/, 9];
                    case 8:
                        hospitalError_1 = _a.sent();
                        console.error('TCC_DEBUG: Error syncing to Hospital database:', hospitalError_1);
                        return [3 /*break*/, 9];
                    case 9:
                        if (!(data.selectedAgencies && data.selectedAgencies.length > 0)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.sendNewTripNotifications(centerTrip)];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11: return [2 /*return*/, {
                            success: true,
                            data: centerTrip,
                            message: 'Enhanced transport request created successfully'
                        }];
                    case 12:
                        error_1 = _a.sent();
                        console.error('TCC_DEBUG: Error creating enhanced trip:', error_1);
                        throw new Error('Failed to create enhanced transport request');
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new transport request (legacy method)
     */
    TripService.prototype.createTrip = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var revenueData, trip, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Creating trip with data:', data);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        revenueData = this.calculateTripRevenue(data.transportLevel, data.priority, data.specialNeeds);
                        return [4 /*yield*/, prisma.trip.create({
                                data: {
                                    tripNumber: "TRP-".concat(Date.now()),
                                    // Required fields for new schema
                                    patientId: data.patientId,
                                    transportLevel: data.transportLevel,
                                    urgencyLevel: 'Routine', // Default for legacy trips
                                    // Trip details
                                    fromLocation: data.originFacilityId,
                                    toLocation: data.destinationFacilityId,
                                    scheduledTime: new Date(data.readyStart),
                                    // Revenue and distance tracking - now handled by TripCostBreakdown model
                                    // Legacy fields
                                    status: 'PENDING',
                                    priority: data.priority,
                                    notes: data.specialNeeds,
                                    assignedTo: null,
                                },
                            })];
                    case 2:
                        trip = _a.sent();
                        console.log('TCC_DEBUG: Trip created successfully:', trip.id);
                        // Send email notifications to EMS agencies
                        return [4 /*yield*/, this.sendNewTripNotifications(trip)];
                    case 3:
                        // Send email notifications to EMS agencies
                        _a.sent();
                        return [2 /*return*/, { success: true, data: trip }];
                    case 4:
                        error_2 = _a.sent();
                        console.error('TCC_DEBUG: Error creating trip:', error_2);
                        return [2 /*return*/, { success: false, error: 'Failed to create transport request' }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all transport requests with optional filtering
     */
    TripService.prototype.getTrips = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var where, statuses, trips, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Getting trips with filters:', filters);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        where = {};
                        if (filters === null || filters === void 0 ? void 0 : filters.status) {
                            // Handle comma-separated status values (e.g., "ACCEPTED,IN_PROGRESS,COMPLETED")
                            if (filters.status.includes(',')) {
                                statuses = filters.status.split(',').map(function (s) { return s.trim(); });
                                where.status = {
                                    in: statuses
                                };
                            }
                            else {
                                where.status = filters.status;
                            }
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.transportLevel) {
                            where.transportLevel = filters.transportLevel;
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.priority) {
                            where.priority = filters.priority;
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.agencyId) {
                            where.assignedAgencyId = filters.agencyId;
                        }
                        return [4 /*yield*/, prisma.trip.findMany({
                                where: where,
                                include: {
                                    pickup_locations: {
                                        select: {
                                            id: true,
                                            name: true,
                                            description: true,
                                            contactPhone: true,
                                            contactEmail: true,
                                            floor: true,
                                            room: true,
                                            hospitals: {
                                                select: {
                                                    id: true,
                                                    name: true
                                                }
                                            }
                                        }
                                    }
                                },
                                orderBy: {
                                    createdAt: 'desc',
                                },
                            })];
                    case 2:
                        trips = _a.sent();
                        console.log('TCC_DEBUG: Found trips:', trips.length);
                        return [2 /*return*/, { success: true, data: trips }];
                    case 3:
                        error_3 = _a.sent();
                        console.error('TCC_DEBUG: Error getting trips:', error_3);
                        return [2 /*return*/, { success: false, error: 'Failed to fetch transport requests' }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a single transport request by ID
     */
    TripService.prototype.getTripById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var trip, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Getting trip by ID:', id);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, prisma.trip.findUnique({
                                where: { id: id },
                                include: {
                                    pickup_locations: {
                                        select: {
                                            id: true,
                                            name: true,
                                            description: true,
                                            contactPhone: true,
                                            contactEmail: true,
                                            floor: true,
                                            room: true,
                                            hospitals: {
                                                select: {
                                                    id: true,
                                                    name: true
                                                }
                                            }
                                        }
                                    }
                                }
                            })];
                    case 2:
                        trip = _a.sent();
                        if (!trip) {
                            return [2 /*return*/, { success: false, error: 'Transport request not found' }];
                        }
                        console.log('TCC_DEBUG: Trip found:', trip.id);
                        return [2 /*return*/, { success: true, data: trip }];
                    case 3:
                        error_4 = _a.sent();
                        console.error('TCC_DEBUG: Error getting trip:', error_4);
                        return [2 /*return*/, { success: false, error: 'Failed to fetch transport request' }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update trip status (accept/decline/complete)
     */
    TripService.prototype.updateTripStatus = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, trip, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Updating trip status:', { id: id, data: data });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        updateData = {
                            status: data.status,
                        };
                        if (data.assignedAgencyId) {
                            updateData.assignedAgencyId = data.assignedAgencyId;
                        }
                        if (data.assignedUnitId) {
                            updateData.assignedUnitId = data.assignedUnitId;
                        }
                        if (data.acceptedTimestamp) {
                            updateData.acceptedTimestamp = new Date(data.acceptedTimestamp);
                        }
                        if (data.pickupTimestamp) {
                            updateData.pickupTimestamp = new Date(data.pickupTimestamp);
                        }
                        if (data.completionTimestamp) {
                            updateData.completionTimestamp = new Date(data.completionTimestamp);
                        }
                        return [4 /*yield*/, prisma.trip.update({
                                where: { id: id },
                                data: updateData,
                            })];
                    case 2:
                        trip = _a.sent();
                        console.log('TCC_DEBUG: Trip status updated:', trip.id);
                        // Send email notifications for status changes
                        return [4 /*yield*/, this.sendStatusUpdateNotifications(trip, data.status)];
                    case 3:
                        // Send email notifications for status changes
                        _a.sent();
                        return [2 /*return*/, { success: true, data: trip }];
                    case 4:
                        error_5 = _a.sent();
                        console.error('TCC_DEBUG: Error updating trip status:', error_5);
                        return [2 /*return*/, { success: false, error: 'Failed to update transport request' }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get available EMS agencies for assignment
     */
    TripService.prototype.getAvailableAgencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var emsPrisma, agencies, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Getting available EMS agencies');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        emsPrisma = databaseManager_1.databaseManager.getEMSDB();
                        return [4 /*yield*/, emsPrisma.eMSAgency.findMany({
                                where: {
                                    isActive: true,
                                },
                            })];
                    case 2:
                        agencies = _a.sent();
                        console.log('TCC_DEBUG: Found agencies:', agencies.length);
                        return [2 /*return*/, { success: true, data: agencies }];
                    case 3:
                        error_6 = _a.sent();
                        console.error('TCC_DEBUG: Error getting agencies:', error_6);
                        return [2 /*return*/, { success: false, error: 'Failed to fetch EMS agencies' }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send email notifications for new trip requests
     */
    TripService.prototype.sendNewTripNotifications = function (trip) {
        return __awaiter(this, void 0, void 0, function () {
            var agencies, agencyEmails, agencyPhones, emailSuccess, smsSuccess, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        console.log('TCC_DEBUG: Sending new trip notifications for:', trip.id);
                        return [4 /*yield*/, prisma.eMSAgency.findMany({
                                where: {
                                    isActive: true,
                                },
                                select: {
                                    // email field not available in unified Agency model
                                    // phone field not available in unified Agency model
                                    name: true,
                                },
                            })];
                    case 1:
                        agencies = _a.sent();
                        agencyEmails = agencies
                            .filter(function (agency) { return agency.email; })
                            .map(function (agency) { return agency.email; });
                        agencyPhones = agencies
                            .filter(function (agency) { return agency.phone; })
                            .map(function (agency) { return agency.phone; });
                        if (!(agencyEmails.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, emailService_1.default.sendNewTripNotification(trip, agencyEmails)];
                    case 2:
                        emailSuccess = _a.sent();
                        if (emailSuccess) {
                            console.log('TCC_DEBUG: New trip email notifications sent successfully');
                        }
                        else {
                            console.log('TCC_DEBUG: Failed to send new trip email notifications');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        console.log('TCC_DEBUG: No agency emails found for notifications');
                        _a.label = 4;
                    case 4:
                        if (!(agencyPhones.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, emailService_1.default.sendNewTripSMS(trip, agencyPhones)];
                    case 5:
                        smsSuccess = _a.sent();
                        if (smsSuccess) {
                            console.log('TCC_DEBUG: New trip SMS notifications sent successfully');
                        }
                        else {
                            console.log('TCC_DEBUG: Failed to send new trip SMS notifications');
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        console.log('TCC_DEBUG: No agency phone numbers found for SMS notifications');
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_7 = _a.sent();
                        console.error('TCC_DEBUG: Error sending new trip notifications:', error_7);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send email notifications for trip status updates
     */
    TripService.prototype.sendStatusUpdateNotifications = function (trip, newStatus) {
        return __awaiter(this, void 0, void 0, function () {
            var hospitalEmail, hospitalPhone, emailSuccess, smsSuccess, _a, agency, tripWithAgency, error_8;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 14, , 15]);
                        console.log('TCC_DEBUG: Sending status update notifications for:', trip.id, 'Status:', newStatus);
                        hospitalEmail = (_b = trip.originFacility) === null || _b === void 0 ? void 0 : _b.email;
                        hospitalPhone = (_c = trip.originFacility) === null || _c === void 0 ? void 0 : _c.phone;
                        if (!hospitalEmail && !hospitalPhone) {
                            console.log('TCC_DEBUG: No hospital contact information found for status update notification');
                            return [2 /*return*/];
                        }
                        emailSuccess = false;
                        smsSuccess = false;
                        _a = newStatus;
                        switch (_a) {
                            case 'ACCEPTED': return [3 /*break*/, 1];
                            case 'IN_PROGRESS': return [3 /*break*/, 7];
                            case 'COMPLETED': return [3 /*break*/, 7];
                            case 'CANCELLED': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 12];
                    case 1: return [4 /*yield*/, prisma.eMSAgency.findUnique({
                            where: { id: trip.assignedAgencyId || '' },
                            select: { name: true }
                        })];
                    case 2:
                        agency = _d.sent();
                        tripWithAgency = __assign(__assign({}, trip), { assignedAgency: agency, assignedUnit: null // Unit not available in unified schema
                         });
                        if (!hospitalEmail) return [3 /*break*/, 4];
                        return [4 /*yield*/, emailService_1.default.sendTripAcceptedNotification(tripWithAgency, hospitalEmail)];
                    case 3:
                        emailSuccess = _d.sent();
                        _d.label = 4;
                    case 4:
                        if (!hospitalPhone) return [3 /*break*/, 6];
                        return [4 /*yield*/, emailService_1.default.sendTripStatusSMS(trip, hospitalPhone)];
                    case 5:
                        smsSuccess = _d.sent();
                        _d.label = 6;
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        if (!hospitalEmail) return [3 /*break*/, 9];
                        return [4 /*yield*/, emailService_1.default.sendTripStatusUpdate(trip, hospitalEmail)];
                    case 8:
                        emailSuccess = _d.sent();
                        _d.label = 9;
                    case 9:
                        if (!hospitalPhone) return [3 /*break*/, 11];
                        return [4 /*yield*/, emailService_1.default.sendTripStatusSMS(trip, hospitalPhone)];
                    case 10:
                        smsSuccess = _d.sent();
                        _d.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        console.log('TCC_DEBUG: No notification needed for status:', newStatus);
                        return [2 /*return*/];
                    case 13:
                        if (emailSuccess || smsSuccess) {
                            console.log('TCC_DEBUG: Status update notifications sent successfully', {
                                email: emailSuccess,
                                sms: smsSuccess
                            });
                        }
                        else {
                            console.log('TCC_DEBUG: Failed to send status update notifications');
                        }
                        return [3 /*break*/, 15];
                    case 14:
                        error_8 = _d.sent();
                        console.error('TCC_DEBUG: Error sending status update notifications:', error_8);
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get email notification settings for a user
     */
    TripService.prototype.getNotificationSettings = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, defaultSettings, metricValue, user, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, prisma.systemAnalytics.findFirst({
                                where: {
                                    metricName: 'notification_settings',
                                    userId: userId
                                }
                            })];
                    case 1:
                        settings = _a.sent();
                        defaultSettings = {
                            emailNotifications: true,
                            smsNotifications: true,
                            newTripAlerts: true,
                            statusUpdates: true,
                            emailAddress: '',
                            phoneNumber: ''
                        };
                        if (!((settings === null || settings === void 0 ? void 0 : settings.metricValue) && typeof settings.metricValue === 'object')) return [3 /*break*/, 3];
                        metricValue = settings.metricValue;
                        return [4 /*yield*/, prisma.centerUser.findUnique({
                                where: { id: userId },
                                select: { email: true }
                            })];
                    case 2:
                        user = _a.sent();
                        return [2 /*return*/, __assign(__assign(__assign({}, defaultSettings), (typeof metricValue === 'object' ? metricValue : {})), { emailAddress: (user === null || user === void 0 ? void 0 : user.email) || '', phoneNumber: (metricValue === null || metricValue === void 0 ? void 0 : metricValue.phoneNumber) || '' })];
                    case 3: return [2 /*return*/, defaultSettings];
                    case 4:
                        error_9 = _a.sent();
                        console.error('TCC_DEBUG: Error getting notification settings:', error_9);
                        return [2 /*return*/, {
                                emailNotifications: true,
                                smsNotifications: true,
                                newTripAlerts: true,
                                statusUpdates: true,
                                emailAddress: '',
                                phoneNumber: ''
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update email notification settings for a user
     */
    TripService.prototype.updateNotificationSettings = function (userId, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.systemAnalytics.upsert({
                                where: {
                                    id: "notification_settings_".concat(userId)
                                },
                                update: {
                                    metricValue: __assign(__assign({}, settings), { updatedAt: new Date().toISOString() }),
                                    userId: userId
                                },
                                create: {
                                    metricName: 'notification_settings',
                                    metricValue: __assign(__assign({}, settings), { createdAt: new Date().toISOString() }),
                                    userId: userId
                                }
                            })];
                    case 1:
                        _a.sent();
                        console.log('TCC_DEBUG: Notification settings updated for user:', userId);
                        return [2 /*return*/, { success: true }];
                    case 2:
                        error_10 = _a.sent();
                        console.error('TCC_DEBUG: Error updating notification settings:', error_10);
                        return [2 /*return*/, { success: false, error: 'Failed to update notification settings' }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get agencies within distance for a hospital
     */
    TripService.prototype.getAgenciesForHospital = function (hospitalId_1) {
        return __awaiter(this, arguments, void 0, function (hospitalId, radiusMiles) {
            var hospital, emsPrisma, agencies, error_11;
            if (radiusMiles === void 0) { radiusMiles = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('TCC_DEBUG: getAgenciesForHospital called with hospitalId:', hospitalId);
                        return [4 /*yield*/, prisma.hospital.findUnique({
                                where: { id: hospitalId },
                                select: { latitude: true, longitude: true, name: true }
                            })];
                    case 1:
                        hospital = _a.sent();
                        if (!hospital) {
                            throw new Error('Hospital not found');
                        }
                        console.log('TCC_DEBUG: Hospital found:', hospital.name);
                        emsPrisma = databaseManager_1.databaseManager.getEMSDB();
                        console.log('TCC_DEBUG: EMS Prisma client:', !!emsPrisma);
                        return [4 /*yield*/, emsPrisma.eMSAgency.findMany({
                                where: {
                                    isActive: true,
                                    status: 'ACTIVE'
                                },
                                select: {
                                    id: true,
                                    name: true,
                                    contactName: true,
                                    phone: true,
                                    email: true,
                                    address: true,
                                    city: true,
                                    state: true,
                                    zipCode: true,
                                    capabilities: true,
                                    serviceArea: true
                                }
                            })];
                    case 2:
                        agencies = _a.sent();
                        console.log('TCC_DEBUG: Found agencies in EMS database:', agencies.length);
                        // Check if hospital has location data
                        if (!hospital.latitude || !hospital.longitude) {
                            console.log("TCC_DEBUG: Hospital ".concat(hospital.name, " has no location data, returning all agencies"));
                            return [2 /*return*/, {
                                    success: true,
                                    data: agencies,
                                    message: "Found ".concat(agencies.length, " agencies available for notification (no location filtering - hospital location unknown)")
                                }];
                        }
                        // For now, return all agencies since we don't have coordinates in the EMS schema
                        // In a real implementation, you would add latitude/longitude fields to the EMS schema
                        // and calculate distance between hospital and agencies
                        console.log("TCC_DEBUG: Hospital ".concat(hospital.name, " has location data, returning all agencies (distance filtering not yet implemented)"));
                        return [2 /*return*/, {
                                success: true,
                                data: agencies,
                                message: "Found ".concat(agencies.length, " agencies available for notification")
                            }];
                    case 3:
                        error_11 = _a.sent();
                        console.error('TCC_DEBUG: Error getting agencies for hospital:', error_11);
                        throw new Error('Failed to get agencies for hospital');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update trip time tracking
     */
    TripService.prototype.updateTripTimes = function (tripId, timeUpdates) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, trip, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        updateData = {};
                        if (timeUpdates.transferAcceptedTime) {
                            updateData.transferAcceptedTime = new Date(timeUpdates.transferAcceptedTime);
                        }
                        if (timeUpdates.emsArrivalTime) {
                            updateData.emsArrivalTime = new Date(timeUpdates.emsArrivalTime);
                        }
                        if (timeUpdates.emsDepartureTime) {
                            updateData.emsDepartureTime = new Date(timeUpdates.emsDepartureTime);
                        }
                        return [4 /*yield*/, prisma.trip.update({
                                where: { id: tripId },
                                data: updateData
                            })];
                    case 1:
                        trip = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: trip,
                                message: 'Trip times updated successfully'
                            }];
                    case 2:
                        error_12 = _a.sent();
                        console.error('TCC_DEBUG: Error updating trip times:', error_12);
                        throw new Error('Failed to update trip times');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get diagnosis options
     */
    TripService.prototype.getDiagnosisOptions = function () {
        return {
            success: true,
            data: patientIdService_1.DIAGNOSIS_OPTIONS,
            message: 'Diagnosis options retrieved successfully'
        };
    };
    /**
     * Get mobility options
     */
    TripService.prototype.getMobilityOptions = function () {
        return {
            success: true,
            data: patientIdService_1.MOBILITY_OPTIONS,
            message: 'Mobility options retrieved successfully'
        };
    };
    /**
     * Get transport level options
     */
    TripService.prototype.getTransportLevelOptions = function () {
        return {
            success: true,
            data: patientIdService_1.TRANSPORT_LEVEL_OPTIONS,
            message: 'Transport level options retrieved successfully'
        };
    };
    /**
     * Get urgency options
     */
    TripService.prototype.getUrgencyOptions = function () {
        return {
            success: true,
            data: patientIdService_1.URGENCY_OPTIONS,
            message: 'Urgency options retrieved successfully'
        };
    };
    /**
     * Get insurance company options
     */
    TripService.prototype.getInsuranceOptions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hospitalPrisma, options, INSURANCE_OPTIONS, error_13, INSURANCE_OPTIONS;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        hospitalPrisma = databaseManager_1.databaseManager.getHospitalDB();
                        return [4 /*yield*/, hospitalPrisma.dropdownOption.findMany({
                                where: {
                                    category: 'insurance',
                                    isActive: true
                                },
                                orderBy: {
                                    value: 'asc'
                                }
                            })];
                    case 1:
                        options = _a.sent();
                        // If no options in database, return default list
                        if (options.length === 0) {
                            INSURANCE_OPTIONS = [
                                'Aetna',
                                'Anthem Blue Cross Blue Shield',
                                'Cigna',
                                'Humana',
                                'Kaiser Permanente',
                                'Medicare',
                                'Medicaid',
                                'UnitedHealthcare',
                                'Blue Cross Blue Shield',
                                'AARP',
                                'Tricare',
                                'Other'
                            ];
                            return [2 /*return*/, {
                                    success: true,
                                    data: INSURANCE_OPTIONS,
                                    message: 'Insurance options retrieved successfully'
                                }];
                        }
                        return [2 /*return*/, {
                                success: true,
                                data: options.map(function (option) { return option.value; }),
                                message: 'Insurance options retrieved successfully'
                            }];
                    case 2:
                        error_13 = _a.sent();
                        console.error('TCC_DEBUG: Error fetching insurance options from database:', error_13);
                        INSURANCE_OPTIONS = [
                            'Aetna',
                            'Anthem Blue Cross Blue Shield',
                            'Cigna',
                            'Humana',
                            'Kaiser Permanente',
                            'Medicare',
                            'Medicaid',
                            'UnitedHealthcare',
                            'Blue Cross Blue Shield',
                            'AARP',
                            'Tricare',
                            'Other'
                        ];
                        return [2 /*return*/, {
                                success: true,
                                data: INSURANCE_OPTIONS,
                                message: 'Insurance options retrieved successfully'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate trip revenue based on transport level, priority, and special needs
     */
    TripService.prototype.calculateTripRevenue = function (transportLevel, priority, specialNeeds) {
        // Base rates by transport level
        var baseRates = {
            'BLS': 150.0,
            'ALS': 250.0,
            'CCT': 400.0,
            'Other': 150.0
        };
        // Priority multipliers
        var priorityMultipliers = {
            'LOW': 1.0,
            'MEDIUM': 1.1,
            'HIGH': 1.25,
            'CRITICAL': 1.5
        };
        // Special requirements surcharge
        var specialSurcharge = specialNeeds ? 50.0 : 0.0;
        var baseRate = baseRates[transportLevel] || 150.0;
        var priorityMultiplier = priorityMultipliers[priority] || 1.0;
        var tripCost = (baseRate * priorityMultiplier + specialSurcharge);
        var estimatedDistance = 5.0; // Default estimated distance in miles
        var perMileRate = 2.50; // Default per-mile rate
        return {
            tripCost: Math.round(tripCost * 100) / 100, // Round to 2 decimal places
            estimatedDistance: estimatedDistance,
            perMileRate: perMileRate
        };
    };
    /**
     * Calculate insurance-specific pricing rates
     */
    TripService.prototype.calculateInsurancePricing = function (insuranceCompany, transportLevel) {
        // Default rates if no insurance company specified
        var defaultRates = {
            'BLS': { payRate: 150.0, perMileRate: 2.50 },
            'ALS': { payRate: 250.0, perMileRate: 3.00 },
            'CCT': { payRate: 400.0, perMileRate: 3.50 },
            'Other': { payRate: 150.0, perMileRate: 2.50 }
        };
        // Insurance-specific rate tables (in a real system, this would be in a database)
        var insuranceRates = {
            'Medicare': {
                'BLS': { payRate: 120.0, perMileRate: 2.00 },
                'ALS': { payRate: 200.0, perMileRate: 2.50 },
                'CCT': { payRate: 350.0, perMileRate: 3.00 }
            },
            'Medicaid': {
                'BLS': { payRate: 100.0, perMileRate: 1.75 },
                'ALS': { payRate: 180.0, perMileRate: 2.25 },
                'CCT': { payRate: 300.0, perMileRate: 2.75 }
            },
            'Blue Cross Blue Shield': {
                'BLS': { payRate: 160.0, perMileRate: 2.75 },
                'ALS': { payRate: 280.0, perMileRate: 3.25 },
                'CCT': { payRate: 450.0, perMileRate: 3.75 }
            },
            'Aetna': {
                'BLS': { payRate: 155.0, perMileRate: 2.60 },
                'ALS': { payRate: 270.0, perMileRate: 3.10 },
                'CCT': { payRate: 430.0, perMileRate: 3.60 }
            },
            'Cigna': {
                'BLS': { payRate: 145.0, perMileRate: 2.40 },
                'ALS': { payRate: 260.0, perMileRate: 2.90 },
                'CCT': { payRate: 420.0, perMileRate: 3.40 }
            },
            'UnitedHealthcare': {
                'BLS': { payRate: 150.0, perMileRate: 2.50 },
                'ALS': { payRate: 265.0, perMileRate: 3.00 },
                'CCT': { payRate: 440.0, perMileRate: 3.50 }
            }
        };
        // Get rates for the specific insurance company and transport level
        if (insuranceCompany && insuranceRates[insuranceCompany] && transportLevel) {
            var rates = insuranceRates[insuranceCompany][transportLevel];
            if (rates) {
                return rates;
            }
        }
        // Fallback to default rates
        return defaultRates[transportLevel] || defaultRates['BLS'];
    };
    /**
     * Get trip history with timeline and filtering
     */
    TripService.prototype.getTripHistory = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var status_1, agencyId, dateFrom, dateTo, limit, offset, search, whereClause, totalCount, trips, tripsWithTimeline, error_14;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Getting trip history with filters:', filters);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        status_1 = filters.status, agencyId = filters.agencyId, dateFrom = filters.dateFrom, dateTo = filters.dateTo, limit = filters.limit, offset = filters.offset, search = filters.search;
                        whereClause = {
                            // Only show completed, cancelled, or in-progress trips for history
                            status: {
                                in: ['COMPLETED', 'CANCELLED', 'IN_PROGRESS']
                            }
                        };
                        // Add status filter if provided
                        if (status_1 && status_1 !== 'all') {
                            whereClause.status = status_1;
                        }
                        // Add agency filter if provided
                        if (agencyId) {
                            whereClause.assignedAgencyId = agencyId;
                        }
                        // Add date range filter if provided
                        if (dateFrom || dateTo) {
                            whereClause.createdAt = {};
                            if (dateFrom) {
                                whereClause.createdAt.gte = new Date(dateFrom);
                            }
                            if (dateTo) {
                                whereClause.createdAt.lte = new Date(dateTo);
                            }
                        }
                        // Add search filter if provided
                        if (search) {
                            whereClause.OR = [
                                { tripNumber: { contains: search, mode: 'insensitive' } },
                                { patientId: { contains: search, mode: 'insensitive' } },
                                { fromLocation: { contains: search, mode: 'insensitive' } },
                                { toLocation: { contains: search, mode: 'insensitive' } }
                            ];
                        }
                        return [4 /*yield*/, prisma.trip.count({ where: whereClause })];
                    case 2:
                        totalCount = _a.sent();
                        return [4 /*yield*/, prisma.trip.findMany({
                                where: whereClause,
                                include: {
                                    pickup_locations: {
                                        select: {
                                            name: true,
                                            hospitals: {
                                                select: {
                                                    name: true
                                                }
                                            }
                                        }
                                    }
                                },
                                orderBy: { createdAt: 'desc' },
                                take: limit,
                                skip: offset
                            })];
                    case 3:
                        trips = _a.sent();
                        tripsWithTimeline = trips.map(function (trip) {
                            var timeline = _this.buildTripTimeline(trip);
                            // Calculate durations
                            var responseTimeMinutes = trip.acceptedTimestamp && trip.requestTimestamp
                                ? Math.round((new Date(trip.acceptedTimestamp).getTime() - new Date(trip.requestTimestamp).getTime()) / (1000 * 60))
                                : null;
                            var tripDurationMinutes = trip.completionTimestamp && trip.pickupTimestamp
                                ? Math.round((new Date(trip.completionTimestamp).getTime() - new Date(trip.pickupTimestamp).getTime()) / (1000 * 60))
                                : null;
                            return {
                                id: trip.id,
                                tripNumber: trip.tripNumber,
                                patientId: trip.patientId,
                                fromLocation: trip.fromLocation,
                                toLocation: trip.toLocation,
                                status: trip.status,
                                priority: trip.priority,
                                transportLevel: trip.transportLevel,
                                urgencyLevel: trip.urgencyLevel,
                                timeline: timeline,
                                assignedAgencyId: trip.assignedAgencyId,
                                assignedUnitId: trip.assignedUnitId,
                                assignedTo: trip.assignedTo,
                                responseTimeMinutes: responseTimeMinutes,
                                tripDurationMinutes: tripDurationMinutes,
                                distanceMiles: trip.distanceMiles,
                                tripCost: trip.tripCost,
                                createdAt: trip.createdAt,
                                updatedAt: trip.updatedAt,
                                pickupLocationId: trip.pickupLocationId
                            };
                        });
                        console.log('TCC_DEBUG: Found trips for history:', tripsWithTimeline.length);
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    trips: tripsWithTimeline,
                                    pagination: {
                                        total: totalCount,
                                        limit: limit,
                                        offset: offset,
                                        hasMore: offset + limit < totalCount
                                    }
                                }
                            }];
                    case 4:
                        error_14 = _a.sent();
                        console.error('TCC_DEBUG: Error getting trip history:', error_14);
                        return [2 /*return*/, { success: false, error: 'Failed to fetch trip history' }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Build timeline for a trip based on available timestamps
     */
    TripService.prototype.buildTripTimeline = function (trip) {
        var timeline = [];
        if (trip.createdAt) {
            timeline.push({
                event: 'Trip Created',
                timestamp: trip.createdAt,
                description: 'Trip request was created in the system'
            });
        }
        if (trip.requestTimestamp) {
            timeline.push({
                event: 'Request Sent',
                timestamp: trip.requestTimestamp,
                description: 'Request was sent to EMS agencies'
            });
        }
        if (trip.transferRequestTime) {
            timeline.push({
                event: 'Transfer Requested',
                timestamp: trip.transferRequestTime,
                description: 'Transfer request was initiated'
            });
        }
        if (trip.acceptedTimestamp) {
            timeline.push({
                event: 'Accepted by EMS',
                timestamp: trip.acceptedTimestamp,
                description: "Trip was accepted by agency ".concat(trip.assignedAgencyId)
            });
        }
        if (trip.emsArrivalTime) {
            timeline.push({
                event: 'EMS Arrived',
                timestamp: trip.emsArrivalTime,
                description: 'EMS unit arrived at pickup location'
            });
        }
        if (trip.pickupTimestamp) {
            timeline.push({
                event: 'Patient Picked Up',
                timestamp: trip.pickupTimestamp,
                description: 'Patient was picked up and trip started'
            });
        }
        if (trip.actualStartTime) {
            timeline.push({
                event: 'Trip Started',
                timestamp: trip.actualStartTime,
                description: 'Transport trip officially started'
            });
        }
        if (trip.actualEndTime) {
            timeline.push({
                event: 'Trip Ended',
                timestamp: trip.actualEndTime,
                description: 'Transport trip officially ended'
            });
        }
        if (trip.completionTimestamp) {
            timeline.push({
                event: 'Trip Completed',
                timestamp: trip.completionTimestamp,
                description: 'Trip was marked as completed'
            });
        }
        // Sort timeline by timestamp
        return timeline.sort(function (a, b) { return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); });
    };
    // ============================================================================
    // AGENCY RESPONSE MANAGEMENT METHODS
    // Phase 1C: Basic API Endpoints implementation
    // ============================================================================
    /**
     * Create a new agency response
     */
    TripService.prototype.createAgencyResponse = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var trip, existingResponse, responseCount, response, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Creating agency response:', data);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, prisma.trip.findUnique({
                                where: { id: data.tripId },
                                select: {
                                    id: true,
                                    responseStatus: true,
                                    responseDeadline: true,
                                    maxResponses: true
                                }
                            })];
                    case 2:
                        trip = _a.sent();
                        if (!trip) {
                            return [2 /*return*/, { success: false, error: 'Trip not found' }];
                        }
                        if (trip.responseStatus === 'AGENCY_SELECTED') {
                            return [2 /*return*/, { success: false, error: 'Agency has already been selected for this trip' }];
                        }
                        // Check if response deadline has passed
                        if (trip.responseDeadline && new Date() > new Date(trip.responseDeadline)) {
                            return [2 /*return*/, { success: false, error: 'Response deadline has passed' }];
                        }
                        return [4 /*yield*/, prisma.agencyResponse.findFirst({
                                where: {
                                    tripId: data.tripId,
                                    agencyId: data.agencyId
                                }
                            })];
                    case 3:
                        existingResponse = _a.sent();
                        if (existingResponse) {
                            return [2 /*return*/, { success: false, error: 'Agency has already responded to this trip' }];
                        }
                        return [4 /*yield*/, prisma.agencyResponse.count({
                                where: { tripId: data.tripId }
                            })];
                    case 4:
                        responseCount = _a.sent();
                        if (responseCount >= trip.maxResponses) {
                            return [2 /*return*/, { success: false, error: 'Maximum number of responses reached for this trip' }];
                        }
                        return [4 /*yield*/, prisma.agencyResponse.create({
                                data: {
                                    tripId: data.tripId,
                                    agencyId: data.agencyId,
                                    response: data.response,
                                    responseNotes: data.responseNotes,
                                    estimatedArrival: data.estimatedArrival ? new Date(data.estimatedArrival) : null,
                                }
                            })];
                    case 5:
                        response = _a.sent();
                        if (!(responseCount === 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, prisma.trip.update({
                                where: { id: data.tripId },
                                data: { responseStatus: 'RESPONSES_RECEIVED' }
                            })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        console.log('TCC_DEBUG: Agency response created successfully:', response.id);
                        return [2 /*return*/, { success: true, data: response }];
                    case 8:
                        error_15 = _a.sent();
                        console.error('TCC_DEBUG: Error creating agency response:', error_15);
                        return [2 /*return*/, { success: false, error: 'Failed to create agency response' }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update an existing agency response
     */
    TripService.prototype.updateAgencyResponse = function (responseId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var existingResponse, updateData, response, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Updating agency response:', { responseId: responseId, data: data });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, prisma.agencyResponse.findUnique({
                                where: { id: responseId },
                                include: { trip: { select: { responseStatus: true } } }
                            })];
                    case 2:
                        existingResponse = _a.sent();
                        if (!existingResponse) {
                            return [2 /*return*/, { success: false, error: 'Agency response not found' }];
                        }
                        if (existingResponse.isSelected) {
                            return [2 /*return*/, { success: false, error: 'Cannot update a selected response' }];
                        }
                        if (existingResponse.trip.responseStatus === 'AGENCY_SELECTED') {
                            return [2 /*return*/, { success: false, error: 'Agency has already been selected for this trip' }];
                        }
                        updateData = {};
                        if (data.response)
                            updateData.response = data.response;
                        if (data.responseNotes !== undefined)
                            updateData.responseNotes = data.responseNotes;
                        if (data.estimatedArrival !== undefined) {
                            updateData.estimatedArrival = data.estimatedArrival ? new Date(data.estimatedArrival) : null;
                        }
                        return [4 /*yield*/, prisma.agencyResponse.update({
                                where: { id: responseId },
                                data: updateData
                            })];
                    case 3:
                        response = _a.sent();
                        console.log('TCC_DEBUG: Agency response updated successfully:', response.id);
                        return [2 /*return*/, { success: true, data: response }];
                    case 4:
                        error_16 = _a.sent();
                        console.error('TCC_DEBUG: Error updating agency response:', error_16);
                        return [2 /*return*/, { success: false, error: 'Failed to update agency response' }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get agency responses with optional filtering
     */
    TripService.prototype.getAgencyResponses = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var where, responses, error_17;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Getting agency responses with filters:', filters);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        where = {};
                        if (filters.tripId)
                            where.tripId = filters.tripId;
                        if (filters.agencyId)
                            where.agencyId = filters.agencyId;
                        if (filters.response)
                            where.response = filters.response;
                        if (filters.isSelected !== undefined)
                            where.isSelected = filters.isSelected;
                        if (filters.dateFrom || filters.dateTo) {
                            where.responseTimestamp = {};
                            if (filters.dateFrom) {
                                where.responseTimestamp.gte = new Date(filters.dateFrom);
                            }
                            if (filters.dateTo) {
                                where.responseTimestamp.lte = new Date(filters.dateTo);
                            }
                        }
                        return [4 /*yield*/, prisma.agencyResponse.findMany({
                                where: where,
                                orderBy: { responseTimestamp: 'desc' }
                            })];
                    case 2:
                        responses = _a.sent();
                        console.log('TCC_DEBUG: Found agency responses:', responses.length);
                        return [2 /*return*/, { success: true, data: responses }];
                    case 3:
                        error_17 = _a.sent();
                        console.error('TCC_DEBUG: Error getting agency responses:', error_17);
                        return [2 /*return*/, { success: false, error: 'Failed to fetch agency responses' }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a single agency response by ID
     */
    TripService.prototype.getAgencyResponseById = function (responseId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Getting agency response by ID:', responseId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, prisma.agencyResponse.findUnique({
                                where: { id: responseId }
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response) {
                            return [2 /*return*/, { success: false, error: 'Agency response not found' }];
                        }
                        console.log('TCC_DEBUG: Agency response found:', response.id);
                        return [2 /*return*/, { success: true, data: response }];
                    case 3:
                        error_18 = _a.sent();
                        console.error('TCC_DEBUG: Error getting agency response:', error_18);
                        return [2 /*return*/, { success: false, error: 'Failed to fetch agency response' }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Select an agency for a trip
     */
    TripService.prototype.selectAgencyForTrip = function (tripId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var trip, response_1, result, error_19;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Selecting agency for trip:', { tripId: tripId, data: data });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, prisma.trip.findUnique({
                                where: { id: tripId },
                                select: {
                                    id: true,
                                    responseStatus: true,
                                    assignedAgencyId: true
                                }
                            })];
                    case 2:
                        trip = _a.sent();
                        if (!trip) {
                            return [2 /*return*/, { success: false, error: 'Trip not found' }];
                        }
                        if (trip.responseStatus === 'AGENCY_SELECTED') {
                            return [2 /*return*/, { success: false, error: 'Agency has already been selected for this trip' }];
                        }
                        return [4 /*yield*/, prisma.agencyResponse.findUnique({
                                where: { id: data.agencyResponseId }
                            })];
                    case 3:
                        response_1 = _a.sent();
                        if (!response_1) {
                            return [2 /*return*/, { success: false, error: 'Agency response not found' }];
                        }
                        if (response_1.tripId !== tripId) {
                            return [2 /*return*/, { success: false, error: 'Agency response does not belong to this trip' }];
                        }
                        if (response_1.response !== 'ACCEPTED') {
                            return [2 /*return*/, { success: false, error: 'Can only select agencies that have accepted the trip' }];
                        }
                        return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var updatedTrip;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: 
                                        // Mark the selected response
                                        return [4 /*yield*/, tx.agencyResponse.update({
                                                where: { id: data.agencyResponseId },
                                                data: { isSelected: true }
                                            })];
                                        case 1:
                                            // Mark the selected response
                                            _a.sent();
                                            return [4 /*yield*/, tx.trip.update({
                                                    where: { id: tripId },
                                                    data: {
                                                        responseStatus: 'AGENCY_SELECTED',
                                                        assignedAgencyId: response_1.agencyId,
                                                        status: 'ACCEPTED',
                                                        acceptedTimestamp: new Date()
                                                    }
                                                })];
                                        case 2:
                                            updatedTrip = _a.sent();
                                            return [2 /*return*/, updatedTrip];
                                    }
                                });
                            }); })];
                    case 4:
                        result = _a.sent();
                        console.log('TCC_DEBUG: Agency selected successfully for trip:', tripId);
                        return [2 /*return*/, { success: true, data: result }];
                    case 5:
                        error_19 = _a.sent();
                        console.error('TCC_DEBUG: Error selecting agency for trip:', error_19);
                        return [2 /*return*/, { success: false, error: 'Failed to select agency for trip' }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get trip with all agency responses
     */
    TripService.prototype.getTripWithResponses = function (tripId) {
        return __awaiter(this, void 0, void 0, function () {
            var trip, error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Getting trip with responses:', tripId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, prisma.trip.findUnique({
                                where: { id: tripId },
                                include: {
                                    agencyResponses: {
                                        orderBy: { responseTimestamp: 'asc' }
                                    }
                                }
                            })];
                    case 2:
                        trip = _a.sent();
                        if (!trip) {
                            return [2 /*return*/, { success: false, error: 'Trip not found' }];
                        }
                        console.log('TCC_DEBUG: Trip with responses found:', trip.id);
                        return [2 /*return*/, { success: true, data: trip }];
                    case 3:
                        error_20 = _a.sent();
                        console.error('TCC_DEBUG: Error getting trip with responses:', error_20);
                        return [2 /*return*/, { success: false, error: 'Failed to fetch trip with responses' }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get response summary for a trip
     */
    TripService.prototype.getTripResponseSummary = function (tripId) {
        return __awaiter(this, void 0, void 0, function () {
            var responses, summary, selectedResponse, responseTime, error_21;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Getting response summary for trip:', tripId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, prisma.agencyResponse.findMany({
                                where: { tripId: tripId }
                            })];
                    case 2:
                        responses = _a.sent();
                        summary = {
                            totalResponses: responses.length,
                            acceptedResponses: responses.filter(function (r) { return r.response === 'ACCEPTED'; }).length,
                            declinedResponses: responses.filter(function (r) { return r.response === 'DECLINED'; }).length,
                            pendingResponses: responses.filter(function (r) { return r.response === 'PENDING'; }).length,
                        };
                        selectedResponse = responses.find(function (r) { return r.isSelected; });
                        if (selectedResponse) {
                            responseTime = Math.round((new Date(selectedResponse.responseTimestamp).getTime() -
                                new Date(selectedResponse.createdAt).getTime()) / (1000 * 60));
                            summary.selectedAgency = {
                                id: selectedResponse.agencyId,
                                name: "Agency ".concat(selectedResponse.agencyId),
                                responseTime: responseTime
                            };
                        }
                        console.log('TCC_DEBUG: Response summary calculated:', summary);
                        return [2 /*return*/, { success: true, data: summary }];
                    case 3:
                        error_21 = _a.sent();
                        console.error('TCC_DEBUG: Error getting response summary:', error_21);
                        return [2 /*return*/, { success: false, error: 'Failed to fetch response summary' }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a trip with response handling capabilities
     */
    TripService.prototype.createTripWithResponses = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var patientId, tripNumber, priorityMap, priority, scheduledTime, transferRequestTime, responseDeadline, tripData, centerTrip, error_22;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Creating trip with responses:', data);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        patientId = data.patientId || patientIdService_1.PatientIdService.generatePatientId();
                        tripNumber = "TRP-".concat(Date.now());
                        priorityMap = {
                            'Routine': 'LOW',
                            'Urgent': 'MEDIUM',
                            'Emergent': 'HIGH'
                        };
                        priority = data.priority || priorityMap[data.urgencyLevel] || 'LOW';
                        scheduledTime = new Date(data.scheduledTime);
                        transferRequestTime = new Date();
                        responseDeadline = data.responseDeadline
                            ? new Date(data.responseDeadline)
                            : new Date(Date.now() + 30 * 60 * 1000);
                        tripData = {
                            tripNumber: tripNumber,
                            patientId: patientId,
                            patientWeight: data.patientWeight ? String(data.patientWeight) : null,
                            specialNeeds: data.specialNeeds || null,
                            insuranceCompany: data.insuranceCompany || null,
                            fromLocation: data.fromLocation,
                            pickupLocationId: data.pickupLocationId || null,
                            toLocation: data.toLocation,
                            scheduledTime: scheduledTime,
                            transportLevel: data.transportLevel,
                            urgencyLevel: data.urgencyLevel,
                            diagnosis: data.diagnosis || null,
                            mobilityLevel: data.mobilityLevel || null,
                            oxygenRequired: data.oxygenRequired || false,
                            monitoringRequired: data.monitoringRequired || false,
                            generateQRCode: data.generateQRCode || false,
                            qrCodeData: null, // Will be generated if needed
                            selectedAgencies: data.selectedAgencies || [],
                            notificationRadius: data.notificationRadius || 100,
                            transferRequestTime: transferRequestTime,
                            status: 'PENDING',
                            priority: priority,
                            notes: data.notes || null,
                            assignedTo: null,
                            // New response handling fields
                            responseDeadline: responseDeadline,
                            maxResponses: data.maxResponses || 5,
                            responseStatus: 'PENDING',
                            selectionMode: data.selectionMode || 'SPECIFIC_AGENCIES',
                        };
                        return [4 /*yield*/, prisma.trip.create({
                                data: tripData,
                            })];
                    case 2:
                        centerTrip = _a.sent();
                        console.log('TCC_DEBUG: Trip with responses created in Center DB:', centerTrip);
                        if (!(data.selectedAgencies && data.selectedAgencies.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendNewTripNotifications(centerTrip)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, {
                            success: true,
                            data: centerTrip,
                            message: 'Trip with response handling created successfully'
                        }];
                    case 5:
                        error_22 = _a.sent();
                        console.error('TCC_DEBUG: Error creating trip with responses:', error_22);
                        return [2 /*return*/, { success: false, error: 'Failed to create trip with response handling' }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update trip response fields
     */
    TripService.prototype.updateTripResponseFields = function (tripId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, trip, error_23;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('TCC_DEBUG: Updating trip response fields:', { tripId: tripId, data: data });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        updateData = {};
                        if (data.responseDeadline !== undefined) {
                            updateData.responseDeadline = data.responseDeadline ? new Date(data.responseDeadline) : null;
                        }
                        if (data.maxResponses !== undefined) {
                            updateData.maxResponses = data.maxResponses;
                        }
                        if (data.responseStatus !== undefined) {
                            updateData.responseStatus = data.responseStatus;
                        }
                        if (data.selectionMode !== undefined) {
                            updateData.selectionMode = data.selectionMode;
                        }
                        return [4 /*yield*/, prisma.trip.update({
                                where: { id: tripId },
                                data: updateData,
                            })];
                    case 2:
                        trip = _a.sent();
                        console.log('TCC_DEBUG: Trip response fields updated:', trip.id);
                        return [2 /*return*/, { success: true, data: trip }];
                    case 3:
                        error_23 = _a.sent();
                        console.error('TCC_DEBUG: Error updating trip response fields:', error_23);
                        return [2 /*return*/, { success: false, error: 'Failed to update trip response fields' }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return TripService;
}());
exports.TripService = TripService;
exports.tripService = new TripService();
