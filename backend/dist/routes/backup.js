"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const authenticateAdmin_1 = require("../middleware/authenticateAdmin");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get backup history
router.get('/history', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const backupDir = path_1.default.join(process.cwd(), 'database-backups');
        // Ensure backup directory exists
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
        }
        // Read backup files
        const files = fs_1.default.readdirSync(backupDir)
            .filter(file => file.endsWith('.json'))
            .map(file => {
            const filePath = path_1.default.join(backupDir, file);
            const stats = fs_1.default.statSync(filePath);
            return {
                filename: file,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        })
            .sort((a, b) => b.created.getTime() - a.created.getTime());
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
});
// Create full database backup
router.post('/create', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `tcc-database-backup-${timestamp}.json`;
        const backupDir = path_1.default.join(process.cwd(), 'database-backups');
        // Ensure backup directory exists
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
        }
        // Export all data from all databases
        const backupData = {
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
        // Export TCC database (main database)
        try {
            console.log('TCC_DEBUG: Exporting TCC database...');
            // Get all tables from the main database (only tables that exist)
            const trips = await prisma.$queryRaw `SELECT * FROM trips`;
            const hospitals = await prisma.$queryRaw `SELECT * FROM hospitals`;
            const facilities = await prisma.$queryRaw `SELECT * FROM facilities`;
            const centerUsers = await prisma.$queryRaw `SELECT * FROM center_users`;
            const systemAnalytics = await prisma.$queryRaw `SELECT * FROM system_analytics`;
            // Try to get agencies and dropdown_options if they exist
            let agencies = [];
            let dropdownOptions = [];
            try {
                agencies = await prisma.$queryRaw `SELECT * FROM agencies`;
            }
            catch (error) {
                console.log('TCC_DEBUG: agencies table does not exist, skipping...');
            }
            try {
                dropdownOptions = await prisma.$queryRaw `SELECT * FROM dropdown_options`;
            }
            catch (error) {
                console.log('TCC_DEBUG: dropdown_options table does not exist, skipping...');
            }
            backupData.databases.tcc = {
                trips,
                hospitals,
                agencies,
                facilities,
                centerUsers,
                systemAnalytics,
                dropdownOptions
            };
            console.log('TCC_DEBUG: TCC database exported successfully');
        }
        catch (error) {
            console.error('Error exporting TCC data:', error);
        }
        // Export EMS database
        try {
            console.log('TCC_DEBUG: Exporting EMS database...');
            const emsPrisma = new client_1.PrismaClient({
                datasources: {
                    db: {
                        url: process.env.DATABASE_URL_EMS
                    }
                }
            });
            // Try to export EMS data if database exists
            let emsData = {};
            try {
                const emsTrips = await emsPrisma.$queryRaw `SELECT * FROM trips`;
                emsData.trips = emsTrips;
            }
            catch (error) {
                console.log('TCC_DEBUG: trips table does not exist in EMS database, skipping...');
            }
            try {
                const emsUsers = await emsPrisma.$queryRaw `SELECT * FROM ems_users`;
                emsData.users = emsUsers;
            }
            catch (error) {
                console.log('TCC_DEBUG: ems_users table does not exist in EMS database, skipping...');
            }
            try {
                const emsUnits = await emsPrisma.$queryRaw `SELECT * FROM units`;
                emsData.units = emsUnits;
            }
            catch (error) {
                console.log('TCC_DEBUG: units table does not exist in EMS database, skipping...');
            }
            backupData.databases.ems = emsData;
            await emsPrisma.$disconnect();
            console.log('TCC_DEBUG: EMS database exported successfully');
        }
        catch (error) {
            console.error('Error exporting EMS data:', error);
        }
        // Export Hospital database
        try {
            console.log('TCC_DEBUG: Exporting Hospital database...');
            const hospitalPrisma = new client_1.PrismaClient({
                datasources: {
                    db: {
                        url: process.env.DATABASE_URL_HOSPITAL
                    }
                }
            });
            // Try to export Hospital data if database exists
            let hospitalData = {};
            try {
                const hospitalTrips = await hospitalPrisma.$queryRaw `SELECT * FROM trips`;
                hospitalData.trips = hospitalTrips;
            }
            catch (error) {
                console.log('TCC_DEBUG: trips table does not exist in Hospital database, skipping...');
            }
            try {
                const hospitalUsers = await hospitalPrisma.$queryRaw `SELECT * FROM healthcare_users`;
                hospitalData.users = hospitalUsers;
            }
            catch (error) {
                console.log('TCC_DEBUG: healthcare_users table does not exist in Hospital database, skipping...');
            }
            backupData.databases.hospital = hospitalData;
            await hospitalPrisma.$disconnect();
            console.log('TCC_DEBUG: Hospital database exported successfully');
        }
        catch (error) {
            console.error('Error exporting Hospital data:', error);
        }
        // Export Center database
        try {
            console.log('TCC_DEBUG: Exporting Center database...');
            const centerPrisma = new client_1.PrismaClient({
                datasources: {
                    db: {
                        url: process.env.DATABASE_URL_CENTER
                    }
                }
            });
            // Try to export Center data if database exists
            let centerData = {};
            try {
                const centerTrips = await centerPrisma.$queryRaw `SELECT * FROM trips`;
                centerData.trips = centerTrips;
            }
            catch (error) {
                console.log('TCC_DEBUG: trips table does not exist in Center database, skipping...');
            }
            try {
                const centerUsers = await centerPrisma.$queryRaw `SELECT * FROM center_users`;
                centerData.users = centerUsers;
            }
            catch (error) {
                console.log('TCC_DEBUG: center_users table does not exist in Center database, skipping...');
            }
            backupData.databases.center = centerData;
            await centerPrisma.$disconnect();
            console.log('TCC_DEBUG: Center database exported successfully');
        }
        catch (error) {
            console.error('Error exporting Center data:', error);
        }
        // Write backup file
        const filePath = path_1.default.join(backupDir, filename);
        fs_1.default.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
        // Copy to external drive if available
        const externalDrivePath = '/Volumes/Acasis/tcc-database-backups';
        if (fs_1.default.existsSync('/Volumes/Acasis')) {
            try {
                if (!fs_1.default.existsSync(externalDrivePath)) {
                    fs_1.default.mkdirSync(externalDrivePath, { recursive: true });
                }
                const externalFilePath = path_1.default.join(externalDrivePath, filename);
                fs_1.default.copyFileSync(filePath, externalFilePath);
                console.log(`Database backup copied to external drive: ${externalFilePath}`);
            }
            catch (error) {
                console.error('Error copying to external drive:', error);
            }
        }
        res.json({
            success: true,
            data: {
                filename,
                size: fs_1.default.statSync(filePath).size,
                created: new Date(),
                message: 'Backup created successfully'
            }
        });
    }
    catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create backup'
        });
    }
});
// Download backup file
router.get('/download/:filename', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { filename } = req.params;
        const backupDir = path_1.default.join(process.cwd(), 'database-backups');
        const filePath = path_1.default.join(backupDir, filename);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Backup file not found'
            });
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
});
// Delete backup file
router.delete('/:filename', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { filename } = req.params;
        const backupDir = path_1.default.join(process.cwd(), 'database-backups');
        const filePath = path_1.default.join(backupDir, filename);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Backup file not found'
            });
        }
        fs_1.default.unlinkSync(filePath);
        // Also delete from external drive if it exists
        const externalDrivePath = '/Volumes/Acasis/tcc-database-backups';
        const externalFilePath = path_1.default.join(externalDrivePath, filename);
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
});
exports.default = router;
//# sourceMappingURL=backup.js.map