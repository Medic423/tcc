"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
var express_1 = require("express");
var client_1 = require("@prisma/client");
var fs_1 = require("fs");
var path_1 = require("path");
var authenticateAdmin_1 = require("../middleware/authenticateAdmin");
var router = express_1.default.Router();
var prisma = new client_1.PrismaClient();
// Get backup history
router.get('/history', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var backupDir_1, files;
    return __generator(this, function (_a) {
        try {
            backupDir_1 = path_1.default.join(process.cwd(), 'database-backups');
            // Ensure backup directory exists
            if (!fs_1.default.existsSync(backupDir_1)) {
                fs_1.default.mkdirSync(backupDir_1, { recursive: true });
            }
            files = fs_1.default.readdirSync(backupDir_1)
                .filter(function (file) { return file.endsWith('.json'); })
                .map(function (file) {
                var filePath = path_1.default.join(backupDir_1, file);
                var stats = fs_1.default.statSync(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
                .sort(function (a, b) { return b.created.getTime() - a.created.getTime(); });
            res.json({
                success: true,
                data: files
            });
        }
        catch (error) {
            console.error('Error getting backup history:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get backup history'
            });
        }
        return [2 /*return*/];
    });
}); });
// Create full database backup
router.post('/create', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var timestamp, filename, backupDir, backupData, trips, hospitals, facilities, centerUsers, systemAnalytics, agencies, dropdownOptions, error_1, error_2, error_3, emsPrisma, emsData, emsTrips, error_4, emsUsers, error_5, emsUnits, error_6, error_7, hospitalPrisma, hospitalData, hospitalTrips, error_8, hospitalUsers, error_9, error_10, centerPrisma, centerData, centerTrips, error_11, centerUsers, error_12, error_13, filePath, externalDrivePath, externalFilePath, error_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 49, , 50]);
                timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                filename = "tcc-database-backup-".concat(timestamp, ".json");
                backupDir = path_1.default.join(process.cwd(), 'database-backups');
                // Ensure backup directory exists
                if (!fs_1.default.existsSync(backupDir)) {
                    fs_1.default.mkdirSync(backupDir, { recursive: true });
                }
                backupData = {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    backupType: 'full_database_export',
                    description: 'Complete TCC system backup including all databases and tables',
                    systemInfo: {
                        nodeVersion: process.version,
                        platform: process.platform,
                        arch: process.arch,
                        uptime: process.uptime()
                    },
                    databases: {
                        tcc: {},
                        ems: {},
                        hospital: {},
                        center: {}
                    }
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 14, , 15]);
                console.log('TCC_DEBUG: Exporting TCC database...');
                return [4 /*yield*/, prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT * FROM trips"], ["SELECT * FROM trips"])))];
            case 2:
                trips = _a.sent();
                return [4 /*yield*/, prisma.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT * FROM hospitals"], ["SELECT * FROM hospitals"])))];
            case 3:
                hospitals = _a.sent();
                return [4 /*yield*/, prisma.$queryRaw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["SELECT * FROM facilities"], ["SELECT * FROM facilities"])))];
            case 4:
                facilities = _a.sent();
                return [4 /*yield*/, prisma.$queryRaw(templateObject_4 || (templateObject_4 = __makeTemplateObject(["SELECT * FROM center_users"], ["SELECT * FROM center_users"])))];
            case 5:
                centerUsers = _a.sent();
                return [4 /*yield*/, prisma.$queryRaw(templateObject_5 || (templateObject_5 = __makeTemplateObject(["SELECT * FROM system_analytics"], ["SELECT * FROM system_analytics"])))];
            case 6:
                systemAnalytics = _a.sent();
                agencies = [];
                dropdownOptions = [];
                _a.label = 7;
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4 /*yield*/, prisma.$queryRaw(templateObject_6 || (templateObject_6 = __makeTemplateObject(["SELECT * FROM agencies"], ["SELECT * FROM agencies"])))];
            case 8:
                agencies = (_a.sent());
                return [3 /*break*/, 10];
            case 9:
                error_1 = _a.sent();
                console.log('TCC_DEBUG: agencies table does not exist, skipping...');
                return [3 /*break*/, 10];
            case 10:
                _a.trys.push([10, 12, , 13]);
                return [4 /*yield*/, prisma.$queryRaw(templateObject_7 || (templateObject_7 = __makeTemplateObject(["SELECT * FROM dropdown_options"], ["SELECT * FROM dropdown_options"])))];
            case 11:
                dropdownOptions = (_a.sent());
                return [3 /*break*/, 13];
            case 12:
                error_2 = _a.sent();
                console.log('TCC_DEBUG: dropdown_options table does not exist, skipping...');
                return [3 /*break*/, 13];
            case 13:
                backupData.databases.tcc = {
                    trips: trips,
                    hospitals: hospitals,
                    agencies: agencies,
                    facilities: facilities,
                    centerUsers: centerUsers,
                    systemAnalytics: systemAnalytics,
                    dropdownOptions: dropdownOptions
                };
                console.log('TCC_DEBUG: TCC database exported successfully');
                return [3 /*break*/, 15];
            case 14:
                error_3 = _a.sent();
                console.error('Error exporting TCC data:', error_3);
                return [3 /*break*/, 15];
            case 15:
                _a.trys.push([15, 27, , 28]);
                console.log('TCC_DEBUG: Exporting EMS database...');
                emsPrisma = new client_1.PrismaClient({
                    datasources: {
                        db: {
                            url: process.env.DATABASE_URL_EMS
                        }
                    }
                });
                emsData = {};
                _a.label = 16;
            case 16:
                _a.trys.push([16, 18, , 19]);
                return [4 /*yield*/, emsPrisma.$queryRaw(templateObject_8 || (templateObject_8 = __makeTemplateObject(["SELECT * FROM trips"], ["SELECT * FROM trips"])))];
            case 17:
                emsTrips = _a.sent();
                emsData.trips = emsTrips;
                return [3 /*break*/, 19];
            case 18:
                error_4 = _a.sent();
                console.log('TCC_DEBUG: trips table does not exist in EMS database, skipping...');
                return [3 /*break*/, 19];
            case 19:
                _a.trys.push([19, 21, , 22]);
                return [4 /*yield*/, emsPrisma.$queryRaw(templateObject_9 || (templateObject_9 = __makeTemplateObject(["SELECT * FROM ems_users"], ["SELECT * FROM ems_users"])))];
            case 20:
                emsUsers = _a.sent();
                emsData.users = emsUsers;
                return [3 /*break*/, 22];
            case 21:
                error_5 = _a.sent();
                console.log('TCC_DEBUG: ems_users table does not exist in EMS database, skipping...');
                return [3 /*break*/, 22];
            case 22:
                _a.trys.push([22, 24, , 25]);
                return [4 /*yield*/, emsPrisma.$queryRaw(templateObject_10 || (templateObject_10 = __makeTemplateObject(["SELECT * FROM units"], ["SELECT * FROM units"])))];
            case 23:
                emsUnits = _a.sent();
                emsData.units = emsUnits;
                return [3 /*break*/, 25];
            case 24:
                error_6 = _a.sent();
                console.log('TCC_DEBUG: units table does not exist in EMS database, skipping...');
                return [3 /*break*/, 25];
            case 25:
                backupData.databases.ems = emsData;
                return [4 /*yield*/, emsPrisma.$disconnect()];
            case 26:
                _a.sent();
                console.log('TCC_DEBUG: EMS database exported successfully');
                return [3 /*break*/, 28];
            case 27:
                error_7 = _a.sent();
                console.error('Error exporting EMS data:', error_7);
                return [3 /*break*/, 28];
            case 28:
                _a.trys.push([28, 37, , 38]);
                console.log('TCC_DEBUG: Exporting Hospital database...');
                hospitalPrisma = new client_1.PrismaClient({
                    datasources: {
                        db: {
                            url: process.env.DATABASE_URL_HOSPITAL
                        }
                    }
                });
                hospitalData = {};
                _a.label = 29;
            case 29:
                _a.trys.push([29, 31, , 32]);
                return [4 /*yield*/, hospitalPrisma.$queryRaw(templateObject_11 || (templateObject_11 = __makeTemplateObject(["SELECT * FROM trips"], ["SELECT * FROM trips"])))];
            case 30:
                hospitalTrips = _a.sent();
                hospitalData.trips = hospitalTrips;
                return [3 /*break*/, 32];
            case 31:
                error_8 = _a.sent();
                console.log('TCC_DEBUG: trips table does not exist in Hospital database, skipping...');
                return [3 /*break*/, 32];
            case 32:
                _a.trys.push([32, 34, , 35]);
                return [4 /*yield*/, hospitalPrisma.$queryRaw(templateObject_12 || (templateObject_12 = __makeTemplateObject(["SELECT * FROM healthcare_users"], ["SELECT * FROM healthcare_users"])))];
            case 33:
                hospitalUsers = _a.sent();
                hospitalData.users = hospitalUsers;
                return [3 /*break*/, 35];
            case 34:
                error_9 = _a.sent();
                console.log('TCC_DEBUG: healthcare_users table does not exist in Hospital database, skipping...');
                return [3 /*break*/, 35];
            case 35:
                backupData.databases.hospital = hospitalData;
                return [4 /*yield*/, hospitalPrisma.$disconnect()];
            case 36:
                _a.sent();
                console.log('TCC_DEBUG: Hospital database exported successfully');
                return [3 /*break*/, 38];
            case 37:
                error_10 = _a.sent();
                console.error('Error exporting Hospital data:', error_10);
                return [3 /*break*/, 38];
            case 38:
                _a.trys.push([38, 47, , 48]);
                console.log('TCC_DEBUG: Exporting Center database...');
                centerPrisma = new client_1.PrismaClient({
                    datasources: {
                        db: {
                            url: process.env.DATABASE_URL_CENTER
                        }
                    }
                });
                centerData = {};
                _a.label = 39;
            case 39:
                _a.trys.push([39, 41, , 42]);
                return [4 /*yield*/, centerPrisma.$queryRaw(templateObject_13 || (templateObject_13 = __makeTemplateObject(["SELECT * FROM trips"], ["SELECT * FROM trips"])))];
            case 40:
                centerTrips = _a.sent();
                centerData.trips = centerTrips;
                return [3 /*break*/, 42];
            case 41:
                error_11 = _a.sent();
                console.log('TCC_DEBUG: trips table does not exist in Center database, skipping...');
                return [3 /*break*/, 42];
            case 42:
                _a.trys.push([42, 44, , 45]);
                return [4 /*yield*/, centerPrisma.$queryRaw(templateObject_14 || (templateObject_14 = __makeTemplateObject(["SELECT * FROM center_users"], ["SELECT * FROM center_users"])))];
            case 43:
                centerUsers = _a.sent();
                centerData.users = centerUsers;
                return [3 /*break*/, 45];
            case 44:
                error_12 = _a.sent();
                console.log('TCC_DEBUG: center_users table does not exist in Center database, skipping...');
                return [3 /*break*/, 45];
            case 45:
                backupData.databases.center = centerData;
                return [4 /*yield*/, centerPrisma.$disconnect()];
            case 46:
                _a.sent();
                console.log('TCC_DEBUG: Center database exported successfully');
                return [3 /*break*/, 48];
            case 47:
                error_13 = _a.sent();
                console.error('Error exporting Center data:', error_13);
                return [3 /*break*/, 48];
            case 48:
                filePath = path_1.default.join(backupDir, filename);
                fs_1.default.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
                externalDrivePath = '/Volumes/Acasis/tcc-database-backups';
                if (fs_1.default.existsSync('/Volumes/Acasis')) {
                    try {
                        if (!fs_1.default.existsSync(externalDrivePath)) {
                            fs_1.default.mkdirSync(externalDrivePath, { recursive: true });
                        }
                        externalFilePath = path_1.default.join(externalDrivePath, filename);
                        fs_1.default.copyFileSync(filePath, externalFilePath);
                        console.log("Database backup copied to external drive: ".concat(externalFilePath));
                    }
                    catch (error) {
                        console.error('Error copying to external drive:', error);
                    }
                }
                res.json({
                    success: true,
                    data: {
                        filename: filename,
                        size: fs_1.default.statSync(filePath).size,
                        created: new Date(),
                        message: 'Backup created successfully'
                    }
                });
                return [3 /*break*/, 50];
            case 49:
                error_14 = _a.sent();
                console.error('Error creating backup:', error_14);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create backup'
                });
                return [3 /*break*/, 50];
            case 50: return [2 /*return*/];
        }
    });
}); });
// Download backup file
router.get('/download/:filename', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filename, backupDir, filePath;
    return __generator(this, function (_a) {
        try {
            filename = req.params.filename;
            backupDir = path_1.default.join(process.cwd(), 'database-backups');
            filePath = path_1.default.join(backupDir, filename);
            if (!fs_1.default.existsSync(filePath)) {
                return [2 /*return*/, res.status(404).json({
                        success: false,
                        error: 'Backup file not found'
                    })];
            }
            res.download(filePath, filename);
        }
        catch (error) {
            console.error('Error downloading backup:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to download backup'
            });
        }
        return [2 /*return*/];
    });
}); });
// Delete backup file
router.delete('/:filename', authenticateAdmin_1.authenticateAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filename, backupDir, filePath, externalDrivePath, externalFilePath;
    return __generator(this, function (_a) {
        try {
            filename = req.params.filename;
            backupDir = path_1.default.join(process.cwd(), 'database-backups');
            filePath = path_1.default.join(backupDir, filename);
            if (!fs_1.default.existsSync(filePath)) {
                return [2 /*return*/, res.status(404).json({
                        success: false,
                        error: 'Backup file not found'
                    })];
            }
            fs_1.default.unlinkSync(filePath);
            externalDrivePath = '/Volumes/Acasis/tcc-database-backups';
            externalFilePath = path_1.default.join(externalDrivePath, filename);
            if (fs_1.default.existsSync(externalFilePath)) {
                try {
                    fs_1.default.unlinkSync(externalFilePath);
                }
                catch (error) {
                    console.error('Error deleting from external drive:', error);
                }
            }
            res.json({
                success: true,
                message: 'Backup file deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting backup:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete backup'
            });
        }
        return [2 /*return*/];
    });
}); });
exports.default = router;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14;
