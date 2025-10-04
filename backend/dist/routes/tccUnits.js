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
var authenticateAdmin_1 = require("../middleware/authenticateAdmin");
var databaseManager_1 = require("../services/databaseManager");
var router = express_1.default.Router();
/**
 * GET /api/tcc/units
 * Get all units from all EMS agencies (TCC Admin only)
 */
router.get('/', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var emsDB, units, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('🔍 TCC Units API: req.user:', req.user);
                emsDB = databaseManager_1.databaseManager.getEMSDB();
                console.log('🔍 TCC Units API: emsDB obtained:', !!emsDB);
                return [4 /*yield*/, emsDB.unit.findMany({
                        where: {
                            isActive: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    })];
            case 1:
                units = _a.sent();
                console.log('🔍 TCC Units API: units found:', units.length);
                res.json({
                    success: true,
                    data: units
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('🔍 TCC Units API: Error details:', error_1);
                console.error('🔍 TCC Units API: Error message:', error_1 instanceof Error ? error_1.message : String(error_1));
                console.error('🔍 TCC Units API: Error stack:', error_1 instanceof Error ? error_1.stack : 'No stack trace');
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve units',
                    details: error_1 instanceof Error ? error_1.message : String(error_1)
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/tcc/units/:agencyId
 * Get all units for a specific agency (TCC Admin only)
 */
router.get('/:agencyId', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var agencyId, emsDB, units, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                agencyId = req.params.agencyId;
                console.log('🔍 TCC Units API: Getting units for agency:', agencyId);
                emsDB = databaseManager_1.databaseManager.getEMSDB();
                return [4 /*yield*/, emsDB.unit.findMany({
                        where: {
                            agencyId: agencyId,
                            isActive: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    })];
            case 1:
                units = _a.sent();
                console.log('🔍 TCC Units API: units found for agency:', units.length);
                res.json({
                    success: true,
                    data: units
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching agency units:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch agency units'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
