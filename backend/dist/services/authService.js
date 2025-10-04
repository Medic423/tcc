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
exports.authService = exports.AuthService = void 0;
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var databaseManager_1 = require("./databaseManager");
var AuthService = /** @class */ (function () {
    function AuthService() {
        this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
        this.emsPrisma = databaseManager_1.databaseManager.getEMSDB();
        console.log('TCC_DEBUG: AuthService constructor - JWT_SECRET loaded:', this.jwtSecret ? 'YES' : 'NO');
        console.log('TCC_DEBUG: JWT_SECRET value:', this.jwtSecret);
    }
    AuthService.prototype.login = function (credentials) {
        return __awaiter(this, void 0, void 0, function () {
            var email, password, centerDB, user, userType, userData, hospitalDB, hospitalUser, emsDB, emsUser, isValidPassword, agencyId, emsUser, token, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        console.log('TCC_DEBUG: AuthService.login called with:', { email: credentials.email, password: credentials.password ? '***' : 'missing' });
                        email = credentials.email, password = credentials.password;
                        centerDB = databaseManager_1.databaseManager.getCenterDB();
                        return [4 /*yield*/, centerDB.centerUser.findUnique({
                                where: { email: email },
                                select: {
                                    id: true,
                                    email: true,
                                    password: true,
                                    name: true,
                                    userType: true,
                                    isActive: true,
                                    createdAt: true,
                                    updatedAt: true
                                }
                            })];
                    case 1:
                        user = _a.sent();
                        userType = 'ADMIN';
                        userData = void 0;
                        if (!user) return [3 /*break*/, 2];
                        // Use the actual userType from the Center database
                        userType = user.userType;
                        // Ensure the user object has the new fields
                        user = __assign(__assign({}, user), { phone: user.phone || null, emailNotifications: user.emailNotifications || true, smsNotifications: user.smsNotifications || false });
                        return [3 /*break*/, 4];
                    case 2:
                        hospitalDB = databaseManager_1.databaseManager.getHospitalDB();
                        return [4 /*yield*/, hospitalDB.healthcareUser.findUnique({
                                where: { email: email },
                                select: {
                                    id: true,
                                    email: true,
                                    password: true,
                                    name: true,
                                    phone: true,
                                    emailNotifications: true,
                                    smsNotifications: true,
                                    isActive: true,
                                    createdAt: true,
                                    updatedAt: true,
                                    facilityName: true,
                                    facilityType: true
                                }
                            })];
                    case 3:
                        hospitalUser = _a.sent();
                        if (hospitalUser) {
                            userType = 'HEALTHCARE';
                            // Convert hospital user to center user format
                            user = {
                                id: hospitalUser.id,
                                email: hospitalUser.email,
                                password: hospitalUser.password,
                                name: hospitalUser.name,
                                userType: 'HEALTHCARE',
                                phone: hospitalUser.phone || null,
                                emailNotifications: hospitalUser.emailNotifications || true,
                                smsNotifications: hospitalUser.smsNotifications || false,
                                isActive: hospitalUser.isActive,
                                createdAt: hospitalUser.createdAt,
                                updatedAt: hospitalUser.updatedAt
                            };
                        }
                        _a.label = 4;
                    case 4:
                        if (!!user) return [3 /*break*/, 6];
                        emsDB = databaseManager_1.databaseManager.getEMSDB();
                        return [4 /*yield*/, emsDB.EMSUser.findUnique({
                                where: { email: email },
                                select: {
                                    id: true,
                                    email: true,
                                    password: true,
                                    name: true,
                                    phone: true,
                                    emailNotifications: true,
                                    smsNotifications: true,
                                    isActive: true,
                                    createdAt: true,
                                    updatedAt: true,
                                    agencyName: true,
                                    agencyId: true
                                }
                            })];
                    case 5:
                        emsUser = _a.sent();
                        if (emsUser) {
                            userType = 'EMS';
                            // Convert EMS user to center user format
                            user = {
                                id: emsUser.id,
                                email: emsUser.email,
                                password: emsUser.password,
                                name: emsUser.name,
                                userType: 'EMS',
                                phone: emsUser.phone || null,
                                emailNotifications: emsUser.emailNotifications || true,
                                smsNotifications: emsUser.smsNotifications || false,
                                isActive: emsUser.isActive,
                                createdAt: emsUser.createdAt,
                                updatedAt: emsUser.updatedAt,
                                agencyId: emsUser.agencyId
                            };
                        }
                        _a.label = 6;
                    case 6:
                        console.log('TCC_DEBUG: User found in database:', user ? { id: user.id, email: user.email, name: user.name, isActive: user.isActive, userType: userType } : 'null');
                        if (!user) {
                            console.log('TCC_DEBUG: No user found for email:', email);
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Invalid email or password'
                                }];
                        }
                        if (!user.isActive) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Account is deactivated'
                                }];
                        }
                        return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password)];
                    case 7:
                        isValidPassword = _a.sent();
                        if (!isValidPassword) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Invalid email or password'
                                }];
                        }
                        agencyId = user.id;
                        if (userType === 'EMS') {
                            emsUser = user;
                            if (!emsUser.agencyId) {
                                console.error('TCC_DEBUG: EMS user missing agencyId:', { userId: user.id, email: user.email });
                                return [2 /*return*/, {
                                        success: false,
                                        error: 'User not properly associated with an agency'
                                    }];
                            }
                            agencyId = emsUser.agencyId;
                            console.log('TCC_DEBUG: Using agencyId for EMS user:', { userId: user.id, agencyId: agencyId });
                        }
                        token = jsonwebtoken_1.default.sign({
                            id: userType === 'EMS' ? agencyId : user.id,
                            email: user.email,
                            userType: userType
                        }, this.jwtSecret, { expiresIn: '24h' });
                        // Create user data based on type
                        if (userType === 'ADMIN') {
                            userData = {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                userType: 'ADMIN'
                            };
                        }
                        else if (userType === 'USER') {
                            userData = {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                userType: 'USER'
                            };
                        }
                        else if (userType === 'HEALTHCARE') {
                            userData = {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                userType: 'HEALTHCARE',
                                facilityName: user.facilityName
                            };
                        }
                        else {
                            userData = {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                userType: 'EMS',
                                agencyName: user.agencyName
                            };
                        }
                        return [2 /*return*/, {
                                success: true,
                                user: userData,
                                token: token
                            }];
                    case 8:
                        error_1 = _a.sent();
                        console.error('Login error:', error_1);
                        return [2 /*return*/, {
                                success: false,
                                error: 'Internal server error'
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.verifyToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded, centerDB, user, hospitalDB, user, emsDB, user, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        console.log('TCC_DEBUG: verifyToken called with JWT_SECRET:', this.jwtSecret ? 'SET' : 'NOT SET');
                        decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
                        console.log('TCC_DEBUG: Token decoded successfully:', { id: decoded.id, email: decoded.email, userType: decoded.userType });
                        if (!['ADMIN', 'USER', 'HEALTHCARE', 'EMS'].includes(decoded.userType)) {
                            return [2 /*return*/, null];
                        }
                        if (!(decoded.userType === 'ADMIN' || decoded.userType === 'USER')) return [3 /*break*/, 2];
                        centerDB = databaseManager_1.databaseManager.getCenterDB();
                        return [4 /*yield*/, centerDB.centerUser.findUnique({
                                where: { id: decoded.id }
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user || !user.isActive) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                userType: user.userType
                            }];
                    case 2:
                        if (!(decoded.userType === 'HEALTHCARE')) return [3 /*break*/, 4];
                        hospitalDB = databaseManager_1.databaseManager.getHospitalDB();
                        return [4 /*yield*/, hospitalDB.healthcareUser.findUnique({
                                where: { id: decoded.id }
                            })];
                    case 3:
                        user = _a.sent();
                        if (!user || !user.isActive) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                userType: 'HEALTHCARE',
                                facilityName: user.facilityName
                            }];
                    case 4:
                        if (!(decoded.userType === 'EMS')) return [3 /*break*/, 6];
                        emsDB = databaseManager_1.databaseManager.getEMSDB();
                        return [4 /*yield*/, emsDB.EMSUser.findUnique({
                                where: { email: decoded.email }
                            })];
                    case 5:
                        user = _a.sent();
                        if (!user || !user.isActive) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: decoded.id, // Use agency ID from token
                                email: user.email,
                                name: user.name,
                                userType: 'EMS',
                                agencyName: user.agencyName
                            }];
                    case 6: return [2 /*return*/, null];
                    case 7:
                        error_2 = _a.sent();
                        console.error('Token verification error:', error_2);
                        return [2 /*return*/, null];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.createUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var centerDB, hashedPassword, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        centerDB = databaseManager_1.databaseManager.getCenterDB();
                        return [4 /*yield*/, bcryptjs_1.default.hash(userData.password, 12)];
                    case 1:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, centerDB.centerUser.create({
                                data: {
                                    email: userData.email,
                                    password: hashedPassword,
                                    name: userData.name,
                                    userType: userData.userType
                                }
                            })];
                    case 2:
                        user = _a.sent();
                        return [2 /*return*/, {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                userType: user.userType
                            }];
                }
            });
        });
    };
    AuthService.prototype.createAdminUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createUser(__assign(__assign({}, userData), { userType: 'ADMIN' }))];
            });
        });
    };
    AuthService.prototype.createRegularUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createUser(__assign(__assign({}, userData), { userType: 'USER' }))];
            });
        });
    };
    return AuthService;
}());
exports.AuthService = AuthService;
exports.authService = new AuthService();
exports.default = exports.authService;
