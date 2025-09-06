import express from 'express';
import { tripService, CreateTripRequest, UpdateTripStatusRequest } from '../services/tripService';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';

const router = express.Router();

/**
 * POST /api/trips
 * Create a new transport request
 */
router.post('/', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Create trip request received:', req.body);
    
    const {
      patientId,
      originFacilityId,
      destinationFacilityId,
      transportLevel,
      priority,
      specialRequirements,
      readyStart,
      readyEnd,
      isolation,
      bariatric,
    } = req.body;

    // Validation
    if (!patientId || !originFacilityId || !destinationFacilityId || !transportLevel || !priority) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: patientId, originFacilityId, destinationFacilityId, transportLevel, priority'
      });
    }

    if (!['BLS', 'ALS', 'CCT'].includes(transportLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transport level. Must be BLS, ALS, or CCT'
      });
    }

    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority. Must be LOW, MEDIUM, HIGH, or CRITICAL'
      });
    }

    const tripData: CreateTripRequest = {
      patientId,
      originFacilityId,
      destinationFacilityId,
      transportLevel,
      priority,
      specialRequirements,
      readyStart,
      readyEnd,
      isolation: isolation || false,
      bariatric: bariatric || false,
      createdById: null, // TODO: Get from authenticated user
    };

    const result = await tripService.createTrip(tripData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Transport request created successfully',
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Create trip error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/trips
 * Get all transport requests with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Get trips request with query:', req.query);
    
    const filters = {
      status: req.query.status as string,
      transportLevel: req.query.transportLevel as string,
      priority: req.query.priority as string,
      agencyId: req.query.agencyId as string,
    };

    const result = await tripService.getTrips(filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get trips error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/trips/:id
 * Get a single transport request by ID
 */
router.get('/:id', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Get trip by ID request:', req.params.id);
    
    const { id } = req.params;
    const result = await tripService.getTripById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get trip by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/trips/:id/status
 * Update trip status (accept/decline/complete)
 */
router.put('/:id/status', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Update trip status request:', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const {
      status,
      assignedAgencyId,
      assignedUnitId,
      acceptedTimestamp,
      pickupTimestamp,
      completionTimestamp,
    } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    if (!['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, or CANCELLED'
      });
    }

    const updateData: UpdateTripStatusRequest = {
      status,
      assignedAgencyId,
      assignedUnitId,
      acceptedTimestamp,
      pickupTimestamp,
      completionTimestamp,
    };

    const result = await tripService.updateTripStatus(id, updateData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Transport request status updated successfully',
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Update trip status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/trips/agencies/available
 * Get available EMS agencies for assignment
 */
router.get('/agencies/available', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Get available agencies request');
    
    const result = await tripService.getAvailableAgencies();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get available agencies error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/trips/notifications/settings
 * Get notification settings for a user
 */
router.get('/notifications/settings', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get notification settings request for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const settings = await tripService.getNotificationSettings(userId);

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get notification settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/trips/notifications/settings
 * Update notification settings for a user
 */
router.put('/notifications/settings', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Update notification settings request for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { emailNotifications, newTripAlerts, statusUpdates, emailAddress } = req.body;

    const settings = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      newTripAlerts: newTripAlerts !== undefined ? newTripAlerts : true,
      statusUpdates: statusUpdates !== undefined ? statusUpdates : true,
      emailAddress: emailAddress || null
    };

    const result = await tripService.updateNotificationSettings(userId, settings);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings
    });

  } catch (error) {
    console.error('TCC_DEBUG: Update notification settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/trips/test-email
 * Test email service connection
 */
router.post('/test-email', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Test email service request');
    
    const emailService = (await import('../services/emailService')).default;
    const isConnected = await emailService.testEmailConnection();

    if (isConnected) {
      res.json({
        success: true,
        message: 'Email service connection successful'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Email service connection failed'
      });
    }

  } catch (error) {
    console.error('TCC_DEBUG: Test email service error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
