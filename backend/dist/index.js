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
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var dotenv_1 = require("dotenv");
var databaseManager_1 = require("./services/databaseManager");
var cookie_parser_1 = require("cookie-parser");
// Import routes
var auth_1 = require("./routes/auth");
var hospitals_1 = require("./routes/hospitals");
var agencies_1 = require("./routes/agencies");
var facilities_1 = require("./routes/facilities");
var analytics_1 = require("./routes/analytics");
var trips_1 = require("./routes/trips");
var agencyResponses_1 = require("./routes/agencyResponses");
var optimization_1 = require("./routes/optimization");
// import notificationRoutes from './routes/notifications';
// import adminNotificationRoutes from './routes/adminNotifications';
var units_1 = require("./routes/units");
var tccUnits_1 = require("./routes/tccUnits");
var dropdownOptions_1 = require("./routes/dropdownOptions");
var pickupLocations_1 = require("./routes/pickupLocations");
var emsAnalytics_1 = require("./routes/emsAnalytics");
var backup_1 = require("./routes/backup");
// Load environment variables
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 5001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Root endpoint
app.get('/', function (req, res) {
    res.json({
        success: true,
        message: 'TCC Backend API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Health check endpoint
app.get('/health', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var isHealthy, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, databaseManager_1.databaseManager.healthCheck()];
            case 1:
                isHealthy = _a.sent();
                if (isHealthy) {
                    res.json({
                        status: 'healthy',
                        timestamp: new Date().toISOString(),
                        databases: 'connected'
                    });
                }
                else {
                    res.status(503).json({
                        status: 'unhealthy',
                        timestamp: new Date().toISOString(),
                        databases: 'disconnected'
                    });
                }
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(503).json({
                    status: 'unhealthy',
                    timestamp: new Date().toISOString(),
                    error: 'Database connection failed'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/trips', trips_1.default);
app.use('/api/agency-responses', agencyResponses_1.default);
// Notification routes disabled - services not available
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/units', units_1.default);
app.use('/api/tcc/hospitals', hospitals_1.default);
app.use('/api/tcc/agencies', agencies_1.default);
app.use('/api/tcc/facilities', facilities_1.default);
app.use('/api/tcc/analytics', analytics_1.default);
app.use('/api/tcc/units', tccUnits_1.default);
app.use('/api/dropdown-options', dropdownOptions_1.default);
app.use('/api/tcc/pickup-locations', pickupLocations_1.default);
app.use('/api/ems/analytics', emsAnalytics_1.default);
app.use('/api/optimize', optimization_1.default);
app.use('/api/backup', backup_1.default);
// Public endpoints for healthcare users
app.get('/api/public/categories', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var hospitalPrisma, categories, error_2;
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
                error_2 = _a.sent();
                console.error('TCC_DEBUG: Get public categories error:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get categories'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/public/hospitals', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var hospitalPrisma, hospitals, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                hospitalPrisma = databaseManager_1.databaseManager.getHospitalDB();
                return [4 /*yield*/, hospitalPrisma.facility.findMany({
                        where: {
                            isActive: true
                        },
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            city: true,
                            state: true,
                            zipCode: true,
                            phone: true,
                            email: true,
                            type: true
                        },
                        orderBy: {
                            name: 'asc'
                        }
                    })];
            case 1:
                hospitals = _a.sent();
                res.json({
                    success: true,
                    data: hospitals,
                    message: 'Hospitals retrieved successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('TCC_DEBUG: Get public hospitals error:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get hospitals'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Test endpoints
app.get('/api/test', function (req, res) {
    res.json({
        success: true,
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/test-db', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                // Try a simple connection test first
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().$connect()];
            case 1:
                // Try a simple connection test first
                _a.sent();
                return [4 /*yield*/, databaseManager_1.databaseManager.getPrismaClient().$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT version() as version, now() as current_time"], ["SELECT version() as version, now() as current_time"])))];
            case 2:
                result = _a.sent();
                res.json({
                    success: true,
                    message: 'Database connection successful',
                    data: result
                });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                res.json({
                    success: false,
                    message: 'Database connection failed',
                    error: error_4 instanceof Error ? error_4.message : String(error_4),
                    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
                    errorCode: error_4 instanceof Error && 'code' in error_4 ? error_4.code : 'unknown'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Manual database initialization endpoint
app.post('/api/init-db', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var execSync, error_5, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                execSync = require('child_process').execSync;
                console.log('🔧 Manual database initialization requested...');
                // First, try to wake up the database with a simple connection
                console.log('🔌 Attempting to wake up database...');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, databaseManager_1.databaseManager.healthCheck()];
            case 2:
                _a.sent();
                console.log('✅ Database is awake and responsive');
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                console.log('⚠️ Database appears to be sleeping, continuing with initialization...');
                return [3 /*break*/, 4];
            case 4:
                // Push schema
                console.log('📊 Pushing production schema...');
                execSync('npx prisma db push --schema=prisma/schema-production.prisma', {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    timeout: 120000 // Increased timeout to 2 minutes
                });
                // Seed database
                console.log('🌱 Seeding database...');
                execSync('npx ts-node prisma/seed.ts', {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    timeout: 120000 // Increased timeout to 2 minutes
                });
                res.json({
                    success: true,
                    message: 'Database initialized successfully!'
                });
                return [3 /*break*/, 6];
            case 5:
                error_6 = _a.sent();
                res.json({
                    success: false,
                    message: 'Database initialization failed',
                    error: error_6 instanceof Error ? error_6.message : String(error_6)
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// 404 handler
app.use('*', function (req, res) {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});
// Error handler
app.use(function (error, req, res, next) {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});
// Initialize database and start server
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var execSync_1;
        var _this = this;
        return __generator(this, function (_a) {
            try {
                // Check if we're in production and need to initialize the database
                if (process.env.NODE_ENV === 'production') {
                    console.log('🔧 Production mode: Attempting database initialization...');
                    execSync_1 = require('child_process').execSync;
                    // Try to initialize database in background, don't block server startup
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            try {
                                console.log('📊 Attempting to push production schema...');
                                execSync_1('npx prisma db push --schema=prisma/schema-production.prisma', {
                                    stdio: 'inherit',
                                    cwd: process.cwd(),
                                    timeout: 60000 // 60 second timeout
                                });
                                console.log('🌱 Attempting to seed database...');
                                execSync_1('npx ts-node prisma/seed.ts', {
                                    stdio: 'inherit',
                                    cwd: process.cwd(),
                                    timeout: 60000 // 60 second timeout
                                });
                                console.log('✅ Database initialized successfully!');
                            }
                            catch (error) {
                                console.log('⚠️ Database initialization failed (will retry on next deployment):', error instanceof Error ? error.message : String(error));
                            }
                            return [2 /*return*/];
                        });
                    }); }, 10000); // Wait 10 seconds before attempting database init
                }
                // Start the server
                app.listen(PORT, function () {
                    console.log("\uD83D\uDE80 TCC Backend server running on port ".concat(PORT));
                    console.log("\uD83D\uDCCA Health check: http://localhost:".concat(PORT, "/health"));
                    console.log("\uD83D\uDD10 Auth endpoint: http://localhost:".concat(PORT, "/api/auth/login"));
                    console.log("\uD83D\uDE97 Trips API: http://localhost:".concat(PORT, "/api/trips"));
                    console.log("\uD83C\uDFE5 Hospitals API: http://localhost:".concat(PORT, "/api/tcc/hospitals"));
                    console.log("\uD83D\uDE91 Agencies API: http://localhost:".concat(PORT, "/api/tcc/agencies"));
                    console.log("\uD83C\uDFE2 Facilities API: http://localhost:".concat(PORT, "/api/tcc/facilities"));
                    console.log("\uD83D\uDCC8 Analytics API: http://localhost:".concat(PORT, "/api/tcc/analytics"));
                });
            }
            catch (error) {
                console.error('❌ Failed to start server:', error);
                process.exit(1);
            }
            return [2 /*return*/];
        });
    });
}
// Start the server
startServer();
// Graceful shutdown
process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('\n🛑 Shutting down server...');
                return [4 /*yield*/, databaseManager_1.databaseManager.disconnect()];
            case 1:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
process.on('SIGTERM', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('\n🛑 Shutting down server...');
                return [4 /*yield*/, databaseManager_1.databaseManager.disconnect()];
            case 1:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
exports.default = app;
var templateObject_1;
