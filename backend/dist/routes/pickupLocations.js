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
var databaseManager_1 = require("../services/databaseManager");
var authenticateAdmin_1 = require("../middleware/authenticateAdmin");
var router = express_1.default.Router();
// Get all pickup locations for a specific hospital
router.get('/hospital/:hospitalId', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var hospitalId, includeInactive, whereClause, pickup_locationss, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                hospitalId = req.params.hospitalId;
                includeInactive = req.query.includeInactive;
                whereClause = {
                    hospitalId: hospitalId
                };
                // Only include active locations unless specifically requested
                if (includeInactive !== 'true') {
                    whereClause.isActive = true;
                }
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().pickup_locations.findMany({
                        where: whereClause,
                        include: {
                            hospitals: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        },
                        orderBy: {
                            name: 'asc'
                        }
                    })];
            case 1:
                pickup_locationss = _a.sent();
                res.json({
                    success: true,
                    data: pickup_locationss
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching pickup locations:', error_1);
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch pickup locations'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get a specific pickup location by ID
router.get('/:id', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, pickup_locations, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().pickup_locations.findUnique({
                        where: { id: id },
                        include: {
                            hospitals: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    })];
            case 1:
                pickup_locations = _a.sent();
                if (!pickup_locations) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Pickup location not found'
                        })];
                }
                res.json({
                    success: true,
                    data: pickup_locations
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching pickup location:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch pickup location'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Create a new pickup location
router.post('/', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, hospitalId, name_1, description, contactPhone, contactEmail, floor, room, hospital, existingLocation, pickup_locations, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, hospitalId = _a.hospitalId, name_1 = _a.name, description = _a.description, contactPhone = _a.contactPhone, contactEmail = _a.contactEmail, floor = _a.floor, room = _a.room;
                // Validate required fields
                if (!hospitalId || !name_1) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Hospital ID and name are required'
                        })];
                }
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().hospital.findUnique({
                        where: { id: hospitalId }
                    })];
            case 1:
                hospital = _b.sent();
                if (!hospital) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Hospital not found'
                        })];
                }
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().pickup_locations.findFirst({
                        where: {
                            hospitalId: hospitalId,
                            name: name_1.trim(),
                            isActive: true
                        }
                    })];
            case 2:
                existingLocation = _b.sent();
                if (existingLocation) {
                    return [2 /*return*/, res.status(409).json({
                            success: false,
                            error: 'A pickup location with this name already exists for this hospital'
                        })];
                }
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().pickup_locations.create({
                        data: {
                            id: "pickup-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
                            hospitalId: hospitalId,
                            name: name_1.trim(),
                            description: (description === null || description === void 0 ? void 0 : description.trim()) || null,
                            contactPhone: (contactPhone === null || contactPhone === void 0 ? void 0 : contactPhone.trim()) || null,
                            contactEmail: (contactEmail === null || contactEmail === void 0 ? void 0 : contactEmail.trim()) || null,
                            floor: (floor === null || floor === void 0 ? void 0 : floor.trim()) || null,
                            room: (room === null || room === void 0 ? void 0 : room.trim()) || null,
                            updatedAt: new Date()
                        },
                        include: {
                            hospitals: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    })];
            case 3:
                pickup_locations = _b.sent();
                res.status(201).json({
                    success: true,
                    data: pickup_locations,
                    message: 'Pickup location created successfully'
                });
                return [3 /*break*/, 5];
            case 4:
                error_3 = _b.sent();
                console.error('Error creating pickup location:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create pickup location'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Update a pickup location
router.put('/:id', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, name_2, description, contactPhone, contactEmail, floor, room, isActive, existingLocation, duplicateLocation, updatedLocation, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                id = req.params.id;
                _a = req.body, name_2 = _a.name, description = _a.description, contactPhone = _a.contactPhone, contactEmail = _a.contactEmail, floor = _a.floor, room = _a.room, isActive = _a.isActive;
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().pickup_locations.findUnique({
                        where: { id: id }
                    })];
            case 1:
                existingLocation = _b.sent();
                if (!existingLocation) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Pickup location not found'
                        })];
                }
                if (!(name_2 && name_2.trim() !== existingLocation.name)) return [3 /*break*/, 3];
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().pickup_locations.findFirst({
                        where: {
                            hospitalId: existingLocation.hospitalId,
                            name: name_2.trim(),
                            isActive: true,
                            id: { not: id }
                        }
                    })];
            case 2:
                duplicateLocation = _b.sent();
                if (duplicateLocation) {
                    return [2 /*return*/, res.status(409).json({
                            success: false,
                            error: 'A pickup location with this name already exists for this hospital'
                        })];
                }
                _b.label = 3;
            case 3: return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().pickup_locations.update({
                    where: { id: id },
                    data: {
                        name: (name_2 === null || name_2 === void 0 ? void 0 : name_2.trim()) || existingLocation.name,
                        description: (description === null || description === void 0 ? void 0 : description.trim()) || existingLocation.description,
                        contactPhone: (contactPhone === null || contactPhone === void 0 ? void 0 : contactPhone.trim()) || existingLocation.contactPhone,
                        contactEmail: (contactEmail === null || contactEmail === void 0 ? void 0 : contactEmail.trim()) || existingLocation.contactEmail,
                        floor: (floor === null || floor === void 0 ? void 0 : floor.trim()) || existingLocation.floor,
                        room: (room === null || room === void 0 ? void 0 : room.trim()) || existingLocation.room,
                        isActive: isActive !== undefined ? isActive : existingLocation.isActive
                    },
                    include: {
                        hospitals: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                })];
            case 4:
                updatedLocation = _b.sent();
                res.json({
                    success: true,
                    data: updatedLocation,
                    message: 'Pickup location updated successfully'
                });
                return [3 /*break*/, 6];
            case 5:
                error_4 = _b.sent();
                console.error('Error updating pickup location:', error_4);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update pickup location'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Delete a pickup location (soft delete by setting isActive to false)
router.delete('/:id', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, existingLocation, tripsUsingLocation, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                id = req.params.id;
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().pickup_locations.findUnique({
                        where: { id: id }
                    })];
            case 1:
                existingLocation = _a.sent();
                if (!existingLocation) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Pickup location not found'
                        })];
                }
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().trip.findFirst({
                        where: {
                            pickupLocationId: id
                        }
                    })];
            case 2:
                tripsUsingLocation = _a.sent();
                if (tripsUsingLocation) {
                    return [2 /*return*/, res.status(409).json({
                            success: false,
                            error: 'Cannot delete pickup location that is being used by existing trips. Deactivate instead.'
                        })];
                }
                // Soft delete by setting isActive to false
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().pickup_locations.update({
                        where: { id: id },
                        data: { isActive: false }
                    })];
            case 3:
                // Soft delete by setting isActive to false
                _a.sent();
                res.json({
                    success: true,
                    message: 'Pickup location deactivated successfully'
                });
                return [3 /*break*/, 5];
            case 4:
                error_5 = _a.sent();
                console.error('Error deleting pickup location:', error_5);
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete pickup location'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Hard delete a pickup location (permanent deletion)
router.delete('/:id/hard', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, existingLocation, tripsUsingLocation, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                id = req.params.id;
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().pickup_locations.findUnique({
                        where: { id: id }
                    })];
            case 1:
                existingLocation = _a.sent();
                if (!existingLocation) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Pickup location not found'
                        })];
                }
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().trip.findFirst({
                        where: {
                            pickupLocationId: id
                        }
                    })];
            case 2:
                tripsUsingLocation = _a.sent();
                if (tripsUsingLocation) {
                    return [2 /*return*/, res.status(409).json({
                            success: false,
                            error: 'Cannot delete pickup location that is being used by existing trips'
                        })];
                }
                // Hard delete
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().pickup_locations.delete({
                        where: { id: id }
                    })];
            case 3:
                // Hard delete
                _a.sent();
                res.json({
                    success: true,
                    message: 'Pickup location permanently deleted'
                });
                return [3 /*break*/, 5];
            case 4:
                error_6 = _a.sent();
                console.error('Error hard deleting pickup location:', error_6);
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete pickup location'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
