import express from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { authenticateAdmin } from '../middleware/authenticateAdmin';

const router = express.Router();
const prisma = new PrismaClient();

// Get backup history
router.get('/history', authenticateAdmin, async (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Read backup files
    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
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
  } catch (error) {
    console.error('Error getting backup history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get backup history'
    });
  }
});

// Create full database backup
router.post('/create', authenticateAdmin, async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tcc-backup-${timestamp}.json`;
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Export all data from all databases
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      databases: {
        tcc: {},
        ems: {},
        hospital: {},
        center: {}
      }
    };

    // Export TCC database
    try {
      const tccData = await prisma.$queryRaw`SELECT * FROM "Trip"`;
      backupData.databases.tcc = { trips: tccData };
    } catch (error) {
      console.error('Error exporting TCC data:', error);
    }

    // Export EMS database
    try {
      const emsPrisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.EMS_DATABASE_URL
          }
        }
      });
      const emsData = await emsPrisma.$queryRaw`SELECT * FROM "Trip"`;
      backupData.databases.ems = { trips: emsData };
      await emsPrisma.$disconnect();
    } catch (error) {
      console.error('Error exporting EMS data:', error);
    }

    // Export Hospital database
    try {
      const hospitalPrisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.HOSPITAL_DATABASE_URL
          }
        }
      });
      const hospitalData = await hospitalPrisma.$queryRaw`SELECT * FROM "Trip"`;
      backupData.databases.hospital = { trips: hospitalData };
      await hospitalPrisma.$disconnect();
    } catch (error) {
      console.error('Error exporting Hospital data:', error);
    }

    // Export Center database
    try {
      const centerPrisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.CENTER_DATABASE_URL
          }
        }
      });
      const centerData = await centerPrisma.$queryRaw`SELECT * FROM "Trip"`;
      backupData.databases.center = { trips: centerData };
      await centerPrisma.$disconnect();
    } catch (error) {
      console.error('Error exporting Center data:', error);
    }

    // Write backup file
    const filePath = path.join(backupDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    // Copy to external drive if available
    const externalDrivePath = '/Volumes/Acasis/tcc-backups';
    if (fs.existsSync('/Volumes/Acasis')) {
      try {
        if (!fs.existsSync(externalDrivePath)) {
          fs.mkdirSync(externalDrivePath, { recursive: true });
        }
        const externalFilePath = path.join(externalDrivePath, filename);
        fs.copyFileSync(filePath, externalFilePath);
        console.log(`Backup copied to external drive: ${externalFilePath}`);
      } catch (error) {
        console.error('Error copying to external drive:', error);
      }
    }

    res.json({
      success: true,
      data: {
        filename,
        size: fs.statSync(filePath).size,
        created: new Date(),
        message: 'Backup created successfully'
      }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create backup'
    });
  }
});

// Download backup file
router.get('/download/:filename', authenticateAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Backup file not found'
      });
    }

    res.download(filePath, filename);
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download backup'
    });
  }
});

// Delete backup file
router.delete('/:filename', authenticateAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Backup file not found'
      });
    }

    fs.unlinkSync(filePath);

    // Also delete from external drive if it exists
    const externalDrivePath = '/Volumes/Acasis/tcc-backups';
    const externalFilePath = path.join(externalDrivePath, filename);
    if (fs.existsSync(externalFilePath)) {
      try {
        fs.unlinkSync(externalFilePath);
      } catch (error) {
        console.error('Error deleting from external drive:', error);
      }
    }

    res.json({
      success: true,
      message: 'Backup file deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete backup'
    });
  }
});

export default router;
