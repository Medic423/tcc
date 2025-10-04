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
exports.unitService = void 0;
var client_1 = require("@prisma/client");
var UnitService = /** @class */ (function () {
    function UnitService() {
        this.prisma = new client_1.PrismaClient();
    }
    /**
     * Get all units for an agency
     */
    UnitService.prototype.getUnitsByAgency = function (agencyId) {
        return __awaiter(this, void 0, void 0, function () {
            var mockUnits;
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement proper Unit model in Prisma schema
                    // For now, return mock data to get the system working
                    console.log('TCC_DEBUG: getUnitsByAgency called with agencyId:', agencyId);
                    mockUnits = [
                        {
                            id: '1',
                            agencyId: agencyId,
                            unitNumber: 'U001',
                            type: 'AMBULANCE',
                            capabilities: ['BLS'],
                            currentStatus: 'AVAILABLE',
                            currentLocation: 'Station 1',
                            crew: ['John Doe', 'Jane Smith'],
                            isActive: true,
                            totalTripsCompleted: 0,
                            averageResponseTime: 0,
                            lastMaintenanceDate: new Date(),
                            nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        {
                            id: '2',
                            agencyId: agencyId,
                            unitNumber: 'U002',
                            type: 'AMBULANCE',
                            capabilities: ['ALS'],
                            currentStatus: 'ON_CALL',
                            currentLocation: 'En Route',
                            crew: ['Bob Johnson', 'Alice Brown'],
                            isActive: true,
                            totalTripsCompleted: 0,
                            averageResponseTime: 0,
                            lastMaintenanceDate: new Date(),
                            nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    ];
                    return [2 /*return*/, mockUnits];
                }
                catch (error) {
                    console.error('Error getting units by agency:', error);
                    throw new Error('Failed to retrieve units');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get a single unit by ID
     */
    UnitService.prototype.getUnitById = function (unitId) {
        return __awaiter(this, void 0, void 0, function () {
            var mockUnit;
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement proper Unit model in Prisma schema
                    // For now, return mock data
                    console.log('TCC_DEBUG: getUnitById called with unitId:', unitId);
                    mockUnit = {
                        id: unitId,
                        agencyId: 'mock-agency',
                        unitNumber: 'U001',
                        type: 'AMBULANCE',
                        capabilities: ['BLS'],
                        currentStatus: 'AVAILABLE',
                        currentLocation: 'Station 1',
                        crew: ['John Doe', 'Jane Smith'],
                        isActive: true,
                        totalTripsCompleted: 0,
                        averageResponseTime: 0,
                        lastMaintenanceDate: new Date(),
                        nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    return [2 /*return*/, mockUnit];
                }
                catch (error) {
                    console.error('Error getting unit by ID:', error);
                    throw new Error('Failed to retrieve unit');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Create a new unit
     */
    UnitService.prototype.createUnit = function (unitData, agencyId) {
        return __awaiter(this, void 0, void 0, function () {
            var mockUnit;
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement proper Unit model in Prisma schema
                    console.log('TCC_DEBUG: createUnit called with data:', unitData);
                    mockUnit = {
                        id: 'new-unit-id',
                        agencyId: agencyId,
                        unitNumber: unitData.unitNumber,
                        type: unitData.type,
                        capabilities: unitData.capabilities,
                        currentStatus: 'AVAILABLE',
                        currentLocation: 'Station 1',
                        crew: [],
                        isActive: unitData.isActive,
                        totalTripsCompleted: 0,
                        averageResponseTime: 0,
                        lastMaintenanceDate: new Date(),
                        nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    return [2 /*return*/, mockUnit];
                }
                catch (error) {
                    console.error('Error creating unit:', error);
                    throw new Error('Failed to create unit');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update a unit
     */
    UnitService.prototype.updateUnit = function (unitId, unitData) {
        return __awaiter(this, void 0, void 0, function () {
            var mockUnit;
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement proper Unit model in Prisma schema
                    console.log('TCC_DEBUG: updateUnit called with unitId:', unitId, 'data:', unitData);
                    mockUnit = {
                        id: unitId,
                        agencyId: 'mock-agency',
                        unitNumber: unitData.unitNumber,
                        type: unitData.type,
                        capabilities: unitData.capabilities,
                        currentStatus: 'AVAILABLE',
                        currentLocation: 'Station 1',
                        crew: [],
                        isActive: unitData.isActive,
                        totalTripsCompleted: 0,
                        averageResponseTime: 0,
                        lastMaintenanceDate: new Date(),
                        nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    return [2 /*return*/, mockUnit];
                }
                catch (error) {
                    console.error('Error updating unit:', error);
                    throw new Error('Failed to update unit');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Delete a unit
     */
    UnitService.prototype.deleteUnit = function (unitId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement proper Unit model in Prisma schema
                    console.log('TCC_DEBUG: deleteUnit called with unitId:', unitId);
                }
                catch (error) {
                    console.error('Error deleting unit:', error);
                    throw new Error('Failed to delete unit');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update unit status
     */
    UnitService.prototype.updateUnitStatus = function (unitId, statusUpdate) {
        return __awaiter(this, void 0, void 0, function () {
            var mockUnit;
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement proper Unit model in Prisma schema
                    console.log('TCC_DEBUG: updateUnitStatus called with unitId:', unitId, 'status:', statusUpdate);
                    mockUnit = {
                        id: unitId,
                        agencyId: 'mock-agency',
                        unitNumber: 'U001',
                        type: 'AMBULANCE',
                        capabilities: ['BLS'],
                        currentStatus: statusUpdate.status,
                        currentLocation: statusUpdate.location || 'Station 1',
                        crew: statusUpdate.crew || ['John Doe', 'Jane Smith'],
                        isActive: true,
                        totalTripsCompleted: 0,
                        averageResponseTime: 0,
                        lastMaintenanceDate: new Date(),
                        nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    return [2 /*return*/, mockUnit];
                }
                catch (error) {
                    console.error('Error updating unit status:', error);
                    throw new Error('Failed to update unit status');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get available units for optimization
     */
    UnitService.prototype.getAvailableUnits = function (agencyId) {
        return __awaiter(this, void 0, void 0, function () {
            var mockUnits;
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement proper Unit model in Prisma schema
                    console.log('TCC_DEBUG: getAvailableUnits called with agencyId:', agencyId);
                    mockUnits = [
                        {
                            id: '1',
                            agencyId: agencyId,
                            unitNumber: 'U001',
                            type: 'AMBULANCE',
                            capabilities: ['BLS'],
                            currentStatus: 'AVAILABLE',
                            currentLocation: 'Station 1',
                            crew: ['John Doe', 'Jane Smith'],
                            isActive: true,
                            totalTripsCompleted: 0,
                            averageResponseTime: 0,
                            lastMaintenanceDate: new Date(),
                            nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    ];
                    return [2 /*return*/, mockUnits];
                }
                catch (error) {
                    console.error('Error getting available units:', error);
                    throw new Error('Failed to retrieve available units');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get unit analytics for an agency
     */
    UnitService.prototype.getUnitAnalytics = function (agencyId) {
        return __awaiter(this, void 0, void 0, function () {
            var mockAnalytics;
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement proper Unit model in Prisma schema
                    console.log('TCC_DEBUG: getUnitAnalytics called with agencyId:', agencyId);
                    mockAnalytics = {
                        totalUnits: 2,
                        availableUnits: 1,
                        committedUnits: 0,
                        outOfServiceUnits: 0,
                        maintenanceUnits: 0,
                        offDutyUnits: 0,
                        totalTripsToday: 0,
                        averageResponseTime: 0,
                        efficiency: 0.5
                    };
                    return [2 /*return*/, mockAnalytics];
                }
                catch (error) {
                    console.error('Error getting unit analytics:', error);
                    throw new Error('Failed to retrieve unit analytics');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Map Prisma unit to Unit interface
     */
    UnitService.prototype.mapPrismaUnitToUnit = function (unit) {
        return {
            id: unit.id,
            agencyId: unit.agencyId,
            unitNumber: unit.unitNumber,
            type: unit.type,
            capabilities: unit.capabilities || [],
            currentStatus: unit.currentStatus || 'AVAILABLE',
            currentLocation: unit.currentLocation || 'Unknown',
            crew: unit.crew || [],
            isActive: unit.isActive !== false,
            totalTripsCompleted: unit.totalTripsCompleted || 0,
            averageResponseTime: unit.averageResponseTime || 0,
            lastMaintenanceDate: unit.lastMaintenanceDate ? new Date(unit.lastMaintenanceDate) : new Date(),
            nextMaintenanceDate: unit.nextMaintenanceDate ? new Date(unit.nextMaintenanceDate) : new Date(),
            createdAt: unit.createdAt ? new Date(unit.createdAt) : new Date(),
            updatedAt: unit.updatedAt ? new Date(unit.updatedAt) : new Date()
        };
    };
    return UnitService;
}());
exports.unitService = new UnitService();
