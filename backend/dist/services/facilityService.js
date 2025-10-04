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
exports.facilityService = exports.FacilityService = void 0;
var databaseManager_1 = require("./databaseManager");
var FacilityService = /** @class */ (function () {
    function FacilityService() {
    }
    FacilityService.prototype.createFacility = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var prisma;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        return [4 /*yield*/, prisma.hospital.create({
                                data: {
                                    name: data.name,
                                    type: data.type,
                                    address: data.address,
                                    city: data.city,
                                    state: data.state,
                                    zipCode: data.zipCode,
                                    phone: data.phone,
                                    email: data.email,
                                    region: data.state, // Use state as region for now
                                    isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true
                                }
                            })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    FacilityService.prototype.getFacilities = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var prisma, _a, page, _b, limit, whereFilters, skip, where, _c, facilities, total;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        _a = filters.page, page = _a === void 0 ? 1 : _a, _b = filters.limit, limit = _b === void 0 ? 50 : _b, whereFilters = __rest(filters, ["page", "limit"]);
                        skip = (page - 1) * limit;
                        where = {};
                        if (whereFilters.name) {
                            where.name = { contains: whereFilters.name, mode: 'insensitive' };
                        }
                        if (whereFilters.type) {
                            where.type = whereFilters.type;
                        }
                        if (whereFilters.city) {
                            where.city = { contains: whereFilters.city, mode: 'insensitive' };
                        }
                        if (whereFilters.state) {
                            where.state = whereFilters.state;
                        }
                        if (whereFilters.isActive !== undefined) {
                            where.isActive = whereFilters.isActive;
                        }
                        return [4 /*yield*/, Promise.all([
                                prisma.hospital.findMany({
                                    where: where,
                                    orderBy: { name: 'asc' },
                                    skip: skip,
                                    take: limit
                                }),
                                prisma.hospital.count({ where: where })
                            ])];
                    case 1:
                        _c = _d.sent(), facilities = _c[0], total = _c[1];
                        return [2 /*return*/, {
                                facilities: facilities,
                                total: total,
                                page: page,
                                totalPages: Math.ceil(total / limit)
                            }];
                }
            });
        });
    };
    FacilityService.prototype.getFacilityById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var prisma;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        return [4 /*yield*/, prisma.hospital.findUnique({
                                where: { id: id }
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FacilityService.prototype.updateFacility = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var prisma;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        return [4 /*yield*/, prisma.hospital.update({
                                where: { id: id },
                                data: __assign(__assign({}, data), { updatedAt: new Date() })
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FacilityService.prototype.deleteFacility = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var prisma;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        return [4 /*yield*/, prisma.hospital.delete({
                                where: { id: id }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FacilityService.prototype.searchFacilities = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var prisma;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prisma = databaseManager_1.databaseManager.getCenterDB();
                        return [4 /*yield*/, prisma.hospital.findMany({
                                where: {
                                    OR: [
                                        { name: { contains: query, mode: 'insensitive' } },
                                        { city: { contains: query, mode: 'insensitive' } },
                                        { state: { contains: query, mode: 'insensitive' } }
                                    ],
                                    isActive: true
                                },
                                take: 10,
                                orderBy: { name: 'asc' }
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return FacilityService;
}());
exports.FacilityService = FacilityService;
exports.facilityService = new FacilityService();
exports.default = exports.facilityService;
