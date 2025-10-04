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
var authService_1 = require("../services/authService");
var authenticateAdmin_1 = require("../middleware/authenticateAdmin");
var databaseManager_1 = require("../services/databaseManager");
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var router = express_1.default.Router();
/**
 * POST /api/auth/login
 * Admin login endpoint
 */
router.post('/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, result, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                console.log('TCC_DEBUG: Login request received:', {
                    email: req.body.email,
                    password: req.body.password ? '***' : 'missing',
                    body: req.body,
                    headers: req.headers
                });
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Email and password are required'
                        })];
                }
                return [4 /*yield*/, authService_1.authService.login({ email: email, password: password })];
            case 1:
                result = _c.sent();
                if (!result.success) {
                    console.log('TCC_DEBUG: Login failed:', result.error);
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: result.error
                        })];
                }
                console.log('TCC_DEBUG: Login successful, user ID in token:', (_b = result.user) === null || _b === void 0 ? void 0 : _b.id);
                // Set HttpOnly cookie for SSE/cookie-based auth
                res.cookie('tcc_token', result.token, {
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000
                });
                res.json({
                    success: true,
                    message: 'Login successful',
                    user: result.user,
                    token: result.token
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _c.sent();
                console.error('Login error:', error_1);
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
 * POST /api/auth/logout
 * Logout endpoint (client-side token removal)
 */
router.post('/logout', function (req, res) {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});
/**
 * GET /api/auth/verify
 * Verify token and get user info
 */
router.get('/verify', authenticateAdmin_1.authenticateAdmin, function (req, res) {
    res.json({
        success: true,
        user: req.user
    });
});
/**
 * POST /api/auth/healthcare/register
 * Register new Healthcare Facility (Public)
 */
router.post('/healthcare/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, name_1, facilityName, facilityType, address, city, state, zipCode, phone, latitude, longitude, lat, lng, hospitalDB, existingUser, user, _b, _c, centerDB, error_2;
    var _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 5, , 6]);
                _a = req.body, email = _a.email, password = _a.password, name_1 = _a.name, facilityName = _a.facilityName, facilityType = _a.facilityType, address = _a.address, city = _a.city, state = _a.state, zipCode = _a.zipCode, phone = _a.phone, latitude = _a.latitude, longitude = _a.longitude;
                if (!email || !password || !name_1 || !facilityName || !facilityType) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Email, password, name, facilityName, and facilityType are required'
                        })];
                }
                // Validate coordinates if provided
                if (latitude && longitude) {
                    lat = parseFloat(latitude);
                    lng = parseFloat(longitude);
                    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                        return [2 /*return*/, res.status(400).json({
                                success: false,
                                error: 'Invalid latitude or longitude coordinates'
                            })];
                    }
                }
                hospitalDB = databaseManager_1.databaseManager.getHospitalDB();
                return [4 /*yield*/, hospitalDB.healthcareUser.findUnique({
                        where: { email: email }
                    })];
            case 1:
                existingUser = _f.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Email already exists'
                        })];
                }
                _c = (_b = hospitalDB.healthcareUser).create;
                _d = {};
                _e = {
                    email: email
                };
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 2: return [4 /*yield*/, _c.apply(_b, [(_d.data = (_e.password = _f.sent(),
                        _e.name = name_1,
                        _e.facilityName = facilityName,
                        _e.facilityType = facilityType,
                        _e.userType = 'HEALTHCARE',
                        _e.isActive = false // Requires admin approval
                    ,
                        _e),
                        _d)])];
            case 3:
                user = _f.sent();
                centerDB = databaseManager_1.databaseManager.getCenterDB();
                return [4 /*yield*/, centerDB.hospital.create({
                        data: {
                            name: facilityName,
                            address: address || 'Address to be provided',
                            city: city || 'City to be provided',
                            state: state || 'State to be provided',
                            zipCode: zipCode || '00000',
                            phone: phone || null,
                            email: email,
                            type: facilityType,
                            capabilities: [], // Will be updated when approved
                            region: 'Region to be determined',
                            latitude: latitude ? parseFloat(latitude) : null,
                            longitude: longitude ? parseFloat(longitude) : null,
                            isActive: false, // Requires admin approval
                            requiresReview: true // Flag for admin review
                        }
                    })];
            case 4:
                _f.sent();
                res.status(201).json({
                    success: true,
                    message: 'Healthcare facility registration submitted for approval',
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        facilityName: user.facilityName,
                        facilityType: user.facilityType,
                        userType: user.userType,
                        isActive: user.isActive
                    }
                });
                return [3 /*break*/, 6];
            case 5:
                error_2 = _f.sent();
                console.error('Healthcare registration error:', error_2);
                if (error_2.code === 'P2002') {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Email already exists'
                        })];
                }
                res.status(500).json({
                    success: false,
                    error: 'Registration failed. Please try again.'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * PUT /api/auth/healthcare/facility/update
 * Update healthcare facility information (Authenticated)
 */
router.put('/healthcare/facility/update', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, updateData, hospitalDB, centerDB, updatedUser, hospitalUpdateResult, error_3;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                console.log('TCC_DEBUG: Healthcare facility update request received:', {
                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                    userType: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userType,
                    body: req.body
                });
                userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
                if (!userId) {
                    console.log('TCC_DEBUG: No user ID found in request');
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'User not authenticated'
                        })];
                }
                updateData = req.body;
                console.log('TCC_DEBUG: Update data received:', updateData);
                hospitalDB = databaseManager_1.databaseManager.getHospitalDB();
                centerDB = databaseManager_1.databaseManager.getCenterDB();
                console.log('TCC_DEBUG: Attempting to update healthcare user record...');
                return [4 /*yield*/, hospitalDB.healthcareUser.update({
                        where: { id: userId },
                        data: {
                            facilityName: updateData.facilityName,
                            facilityType: updateData.facilityType,
                            email: updateData.email,
                            updatedAt: new Date()
                        }
                    })];
            case 1:
                updatedUser = _d.sent();
                console.log('TCC_DEBUG: Healthcare user updated successfully:', updatedUser);
                console.log('TCC_DEBUG: Attempting to update Hospital record in Center database...');
                return [4 /*yield*/, centerDB.hospital.updateMany({
                        where: { email: updatedUser.email },
                        data: {
                            name: updateData.facilityName,
                            type: updateData.facilityType,
                            email: updateData.email,
                            phone: updateData.phone,
                            address: updateData.address,
                            city: updateData.city,
                            state: updateData.state,
                            zipCode: updateData.zipCode,
                            updatedAt: new Date()
                        }
                    })];
            case 2:
                hospitalUpdateResult = _d.sent();
                console.log('TCC_DEBUG: Hospital record update result:', hospitalUpdateResult);
                res.json({
                    success: true,
                    message: 'Facility information updated successfully',
                    data: updatedUser
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _d.sent();
                console.error('TCC_DEBUG: Update healthcare facility error:', error_3);
                console.error('TCC_DEBUG: Error stack:', error_3.stack);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update facility information'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * PUT /api/auth/ems/agency/update
 * Update EMS agency information (Authenticated)
 */
router.put('/ems/agency/update', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, updateData, emsDB, centerDB, updatedUser, existingAgency, agencyUpdateResult, error_4;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 7, , 8]);
                console.log('TCC_DEBUG: EMS agency update request received:', {
                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                    userType: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userType,
                    body: req.body
                });
                userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
                if (!userId) {
                    console.log('TCC_DEBUG: No user ID found in request');
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'User not authenticated'
                        })];
                }
                updateData = req.body;
                console.log('TCC_DEBUG: Update data received:', updateData);
                emsDB = databaseManager_1.databaseManager.getEMSDB();
                centerDB = databaseManager_1.databaseManager.getCenterDB();
                console.log('TCC_DEBUG: Attempting to update EMS user record...');
                return [4 /*yield*/, emsDB.eMSUser.update({
                        where: { id: userId },
                        data: {
                            agencyName: updateData.agencyName,
                            email: updateData.email,
                            name: updateData.contactName,
                            updatedAt: new Date()
                        }
                    })];
            case 1:
                updatedUser = _d.sent();
                console.log('TCC_DEBUG: EMS user updated successfully:', updatedUser);
                console.log('TCC_DEBUG: Attempting to find existing Agency record in Center database...');
                return [4 /*yield*/, centerDB.eMSAgency.findFirst({
                        where: { email: updateData.email }
                    })];
            case 2:
                existingAgency = _d.sent();
                agencyUpdateResult = void 0;
                if (!existingAgency) return [3 /*break*/, 4];
                console.log('TCC_DEBUG: Updating existing Agency record...');
                return [4 /*yield*/, centerDB.eMSAgency.update({
                        where: { id: existingAgency.id },
                        data: {
                            name: updateData.agencyName,
                            email: updateData.email,
                            contactName: updateData.contactName,
                            phone: updateData.phone,
                            address: updateData.address,
                            city: updateData.city,
                            state: updateData.state,
                            zipCode: updateData.zipCode,
                            serviceArea: updateData.serviceType ? [updateData.serviceType] : [],
                            capabilities: updateData.serviceType ? [updateData.serviceType] : [],
                            updatedAt: new Date()
                        }
                    })];
            case 3:
                agencyUpdateResult = _d.sent();
                return [3 /*break*/, 6];
            case 4:
                console.log('TCC_DEBUG: Creating new Agency record...');
                return [4 /*yield*/, centerDB.eMSAgency.create({
                        data: {
                            name: updateData.agencyName,
                            email: updateData.email,
                            contactName: updateData.contactName,
                            phone: updateData.phone,
                            address: updateData.address,
                            city: updateData.city,
                            state: updateData.state,
                            zipCode: updateData.zipCode,
                            serviceArea: updateData.serviceType ? [updateData.serviceType] : [],
                            capabilities: updateData.serviceType ? [updateData.serviceType] : [],
                            isActive: true,
                            status: "ACTIVE"
                        }
                    })];
            case 5:
                agencyUpdateResult = _d.sent();
                _d.label = 6;
            case 6:
                console.log('TCC_DEBUG: Agency record operation result:', agencyUpdateResult);
                res.json({
                    success: true,
                    message: 'Agency information updated successfully',
                    data: updatedUser
                });
                return [3 /*break*/, 8];
            case 7:
                error_4 = _d.sent();
                console.error('TCC_DEBUG: Update EMS agency error:', error_4);
                console.error('TCC_DEBUG: Error stack:', error_4.stack);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update agency information'
                });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/auth/ems/register
 * Register new EMS Agency (Public)
 */
router.post('/ems/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, name_2, agencyName, serviceArea, address, city, state, zipCode, phone, latitude, longitude, capabilities, operatingHours, lat, lng, emsDB, existingUser, user, _b, _c, centerDB, error_5;
    var _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 5, , 6]);
                _a = req.body, email = _a.email, password = _a.password, name_2 = _a.name, agencyName = _a.agencyName, serviceArea = _a.serviceArea, address = _a.address, city = _a.city, state = _a.state, zipCode = _a.zipCode, phone = _a.phone, latitude = _a.latitude, longitude = _a.longitude, capabilities = _a.capabilities, operatingHours = _a.operatingHours;
                if (!email || !password || !name_2 || !agencyName) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Email, password, name, and agencyName are required'
                        })];
                }
                // Validate coordinates if provided
                if (latitude && longitude) {
                    lat = parseFloat(latitude);
                    lng = parseFloat(longitude);
                    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                        return [2 /*return*/, res.status(400).json({
                                success: false,
                                error: 'Invalid latitude or longitude coordinates'
                            })];
                    }
                }
                emsDB = databaseManager_1.databaseManager.getEMSDB();
                return [4 /*yield*/, emsDB.eMSUser.findUnique({
                        where: { email: email }
                    })];
            case 1:
                existingUser = _f.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Email already exists'
                        })];
                }
                _c = (_b = emsDB.eMSUser).create;
                _d = {};
                _e = {
                    email: email
                };
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 2: return [4 /*yield*/, _c.apply(_b, [(_d.data = (_e.password = _f.sent(),
                        _e.name = name_2,
                        _e.agencyName = agencyName,
                        _e.userType = 'EMS',
                        _e.isActive = true // Auto-approve new EMS registrations
                    ,
                        _e),
                        _d)])];
            case 3:
                user = _f.sent();
                centerDB = databaseManager_1.databaseManager.getCenterDB();
                return [4 /*yield*/, centerDB.eMSAgency.create({
                        data: {
                            name: agencyName,
                            contactName: name_2,
                            phone: phone || 'Phone to be provided',
                            email: email,
                            address: address || 'Address to be provided',
                            city: city || 'City to be provided',
                            state: state || 'State to be provided',
                            zipCode: zipCode || '00000',
                            serviceArea: serviceArea || [],
                            capabilities: capabilities || [],
                            operatingHours: operatingHours || null,
                            latitude: latitude ? parseFloat(latitude) : null,
                            longitude: longitude ? parseFloat(longitude) : null,
                            isActive: true, // Auto-approve new EMS registrations
                            requiresReview: false // No review needed for auto-approved agencies
                        }
                    })];
            case 4:
                _f.sent();
                res.status(201).json({
                    success: true,
                    message: 'EMS agency registration successful - agency is now active and available for trip requests',
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        agencyName: user.agencyName,
                        userType: user.userType,
                        isActive: user.isActive
                    }
                });
                return [3 /*break*/, 6];
            case 5:
                error_5 = _f.sent();
                console.error('EMS registration error:', error_5);
                if (error_5.code === 'P2002') {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Email already exists'
                        })];
                }
                res.status(500).json({
                    success: false,
                    error: 'Registration failed. Please try again.'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/auth/register
 * Register new user (Admin only)
 */
router.post('/register', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, name_3, userType, user, error_6;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                // Only admins can create new users
                if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.userType) !== 'ADMIN') {
                    return [2 /*return*/, res.status(403).json({
                            success: false,
                            error: 'Only administrators can create new users'
                        })];
                }
                _a = req.body, email = _a.email, password = _a.password, name_3 = _a.name, userType = _a.userType;
                if (!email || !password || !name_3 || !userType) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Email, password, name, and userType are required'
                        })];
                }
                if (!['ADMIN', 'USER'].includes(userType)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'userType must be either ADMIN or USER'
                        })];
                }
                return [4 /*yield*/, authService_1.authService.createUser({
                        email: email,
                        password: password,
                        name: name_3,
                        userType: userType
                    })];
            case 1:
                user = _c.sent();
                res.status(201).json({
                    success: true,
                    message: 'User created successfully',
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        userType: user.userType
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _c.sent();
                console.error('User registration error:', error_6);
                if (error_6.code === 'P2002') {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Email already exists'
                        })];
                }
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
 * GET /api/auth/users
 * Get all users (Admin only)
 */
router.get('/users', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var centerDB, users, error_7;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                // Only admins can view all users
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.userType) !== 'ADMIN') {
                    return [2 /*return*/, res.status(403).json({
                            success: false,
                            error: 'Only administrators can view all users'
                        })];
                }
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../services/databaseManager'); })];
            case 1:
                centerDB = (_b.sent()).databaseManager.getCenterDB();
                return [4 /*yield*/, centerDB.centerUser.findMany({
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            userType: true,
                            isActive: true,
                            createdAt: true,
                            updatedAt: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    })];
            case 2:
                users = _b.sent();
                res.json({
                    success: true,
                    users: users
                });
                return [3 /*break*/, 4];
            case 3:
                error_7 = _b.sent();
                console.error('Get users error:', error_7);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/auth/ems/login
 * EMS Agency login endpoint
 */
router.post('/ems/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, emsDB, user, isValidPassword, token, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                console.log('TCC_DEBUG: EMS Login request received:', {
                    email: req.body.email,
                    password: req.body.password ? '***' : 'missing'
                });
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Email and password are required'
                        })];
                }
                emsDB = databaseManager_1.databaseManager.getEMSDB();
                return [4 /*yield*/, emsDB.eMSUser.findUnique({
                        where: { email: email }
                    })];
            case 1:
                user = _b.sent();
                if (!user) {
                    console.log('TCC_DEBUG: No EMS user found for email:', email);
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'Invalid credentials'
                        })];
                }
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
            case 2:
                isValidPassword = _b.sent();
                if (!isValidPassword) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'Invalid credentials'
                        })];
                }
                if (!user.isActive) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'Account is deactivated'
                        })];
                }
                token = jsonwebtoken_1.default.sign({
                    id: user.agencyId, // Use agencyId for EMS users
                    email: user.email,
                    userType: 'EMS'
                }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
                // Set HttpOnly cookie
                res.cookie('tcc_token', token, {
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000
                });
                res.json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        userType: 'EMS',
                        agencyName: user.agencyName
                    },
                    token: token
                });
                return [3 /*break*/, 4];
            case 3:
                error_8 = _b.sent();
                console.error('EMS Login error:', error_8);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/auth/healthcare/login
 * Healthcare Facility login endpoint
 */
router.post('/healthcare/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, hospitalDB, user, isValidPassword, token, error_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                console.log('TCC_DEBUG: Healthcare Login request received:', {
                    email: req.body.email,
                    password: req.body.password ? '***' : 'missing'
                });
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Email and password are required'
                        })];
                }
                hospitalDB = databaseManager_1.databaseManager.getHospitalDB();
                return [4 /*yield*/, hospitalDB.healthcareUser.findUnique({
                        where: { email: email }
                    })];
            case 1:
                user = _b.sent();
                if (!user) {
                    console.log('TCC_DEBUG: No Healthcare user found for email:', email);
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'Invalid credentials'
                        })];
                }
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
            case 2:
                isValidPassword = _b.sent();
                if (!isValidPassword) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'Invalid credentials'
                        })];
                }
                if (!user.isActive) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: 'Account is deactivated'
                        })];
                }
                token = jsonwebtoken_1.default.sign({
                    id: user.id,
                    email: user.email,
                    userType: 'HEALTHCARE'
                }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
                // Set HttpOnly cookie
                res.cookie('tcc_token', token, {
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000
                });
                res.json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        userType: 'HEALTHCARE',
                        facilityName: user.facilityName,
                        facilityType: user.facilityType
                    },
                    token: token
                });
                return [3 /*break*/, 4];
            case 3:
                error_9 = _b.sent();
                console.error('Healthcare Login error:', error_9);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
