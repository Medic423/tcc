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
// Get all dropdown options for a category
router.get('/:category', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var category, hospitalPrisma, options, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                category = req.params.category;
                hospitalPrisma = databaseManager_1.databaseManager.getHospitalDB();
                return [4 /*yield*/, hospitalPrisma.dropdownOption.findMany({
                        where: {
                            category: category,
                            isActive: true
                        },
                        orderBy: {
                            value: 'asc'
                        }
                    })];
            case 1:
                options = _a.sent();
                res.json({
                    success: true,
                    data: options,
                    message: "".concat(category, " options retrieved successfully")
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('TCC_DEBUG: Get dropdown options error:', error_1);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get dropdown options'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Add new dropdown option
router.post('/', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, category, value, hospitalPrisma, existingOption, newOption, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, category = _a.category, value = _a.value;
                if (!category || !value) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Category and value are required'
                        })];
                }
                hospitalPrisma = databaseManager_1.databaseManager.getHospitalDB();
                return [4 /*yield*/, hospitalPrisma.dropdownOption.findFirst({
                        where: {
                            category: category,
                            value: value
                        }
                    })];
            case 1:
                existingOption = _b.sent();
                if (existingOption) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'This option already exists'
                        })];
                }
                return [4 /*yield*/, hospitalPrisma.dropdownOption.create({
                        data: {
                            category: category,
                            value: value,
                            isActive: true
                        }
                    })];
            case 2:
                newOption = _b.sent();
                res.json({
                    success: true,
                    data: newOption,
                    message: 'Dropdown option added successfully'
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                console.error('TCC_DEBUG: Add dropdown option error:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Failed to add dropdown option'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Update dropdown option
router.put('/:id', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, value, isActive, hospitalPrisma, updatedOption, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, value = _a.value, isActive = _a.isActive;
                hospitalPrisma = databaseManager_1.databaseManager.getHospitalDB();
                return [4 /*yield*/, hospitalPrisma.dropdownOption.update({
                        where: { id: id },
                        data: {
                            value: value,
                            isActive: isActive !== undefined ? isActive : true
                        }
                    })];
            case 1:
                updatedOption = _b.sent();
                res.json({
                    success: true,
                    data: updatedOption,
                    message: 'Dropdown option updated successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                console.error('TCC_DEBUG: Update dropdown option error:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update dropdown option'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Delete dropdown option (soft delete)
router.delete('/:id', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, hospitalPrisma, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                hospitalPrisma = databaseManager_1.databaseManager.getHospitalDB();
                return [4 /*yield*/, hospitalPrisma.dropdownOption.update({
                        where: { id: id },
                        data: {
                            isActive: false
                        }
                    })];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: 'Dropdown option deleted successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('TCC_DEBUG: Delete dropdown option error:', error_4);
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete dropdown option'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get all categories
router.get('/', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var hospitalPrisma, categories, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                hospitalPrisma = databaseManager_1.databaseManager.getHospitalDB();
                return [4 /*yield*/, hospitalPrisma.dropdownOption.findMany({
                        select: {
                            category: true
                        },
                        distinct: ['category'],
                        where: {
                            isActive: true
                        }
                    })];
            case 1:
                categories = _a.sent();
                res.json({
                    success: true,
                    data: categories.map(function (c) { return c.category; }),
                    message: 'Categories retrieved successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('TCC_DEBUG: Get categories error:', error_5);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get categories'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
