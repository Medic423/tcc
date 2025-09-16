import express from 'express';
import { analyticsService } from '../services/analyticsService';
import { authenticateAdmin } from '../middleware/authenticateAdmin';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

/**
 * GET /api/tcc/analytics/overview
 * Get system overview metrics
 */
router.get('/overview', async (req, res) => {
  try {
    const overview = await analyticsService.getSystemOverview();

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Get system overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system overview'
    });
  }
});

/**
 * GET /api/tcc/analytics/trips
 * Get trip statistics
 */
router.get('/trips', async (req, res) => {
  try {
    const tripStats = await analyticsService.getTripStatistics();

    res.json({
      success: true,
      data: tripStats
    });

  } catch (error) {
    console.error('Get trip statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve trip statistics'
    });
  }
});

/**
 * GET /api/tcc/analytics/agencies
 * Get agency performance data
 */
router.get('/agencies', async (req, res) => {
  try {
    const agencyPerformance = await analyticsService.getAgencyPerformance();

    res.json({
      success: true,
      data: agencyPerformance
    });

  } catch (error) {
    console.error('Get agency performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agency performance'
    });
  }
});

/**
 * GET /api/tcc/analytics/hospitals
 * Get hospital activity data
 */
router.get('/hospitals', async (req, res) => {
  try {
    const hospitalActivity = await analyticsService.getHospitalActivity();

    res.json({
      success: true,
      data: hospitalActivity
    });

  } catch (error) {
    console.error('Get hospital activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve hospital activity'
    });
  }
});

export default router;
