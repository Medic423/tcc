import express from 'express';
import { tripService, CreateTripRequest, UpdateTripStatusRequest, EnhancedCreateTripRequest } from '../services/tripService';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import { CreateTripWithResponsesRequest, UpdateTripResponseFieldsRequest } from '../types/agencyResponse';

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
      urgencyLevel,
      priority,
      specialNeeds,
      readyStart,
      readyEnd,
      isolation,
      bariatric,
      pickupLocationId,
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
      urgencyLevel: urgencyLevel || 'Routine',
      priority,
      specialNeeds,
      readyStart,
      readyEnd,
      isolation: isolation || false,
      bariatric: bariatric || false,
      createdById: null, // TODO: Get from authenticated user
    } as any;

    const result = await tripService.createTrip({
      ...(tripData as any),
      pickupLocationId,
    } as any);

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
 * POST /api/trips/enhanced
 * Create a new enhanced transport request with comprehensive patient and clinical details
 */
router.post('/enhanced', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Create enhanced trip request received:', req.body);
    
    const {
      patientId,
      patientWeight,
      specialNeeds,
      insuranceCompany,
      fromLocation,
      pickupLocationId,
      toLocation,
      scheduledTime,
      transportLevel,
      urgencyLevel,
      diagnosis,
      mobilityLevel,
      oxygenRequired,
      monitoringRequired,
      generateQRCode,
      selectedAgencies,
      notificationRadius,
      notes,
      priority
    } = req.body;

    // Validation
    if (!fromLocation || !toLocation || !transportLevel || !urgencyLevel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fromLocation, toLocation, transportLevel, urgencyLevel'
      });
    }

    // Set default scheduled time if not provided
    const finalScheduledTime = scheduledTime || new Date().toISOString();

    if (!['BLS', 'ALS', 'CCT', 'Other'].includes(transportLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transport level. Must be BLS, ALS, CCT, or Other'
      });
    }

    if (!['Routine', 'Urgent', 'Emergent'].includes(urgencyLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid urgency level. Must be Routine, Urgent, or Emergent'
      });
    }

    const enhancedTripData: EnhancedCreateTripRequest = {
      patientId,
      patientWeight,
      specialNeeds,
      insuranceCompany,
      fromLocation,
      pickupLocationId,
      toLocation,
      scheduledTime: finalScheduledTime,
      transportLevel,
      urgencyLevel,
      diagnosis,
      mobilityLevel,
      oxygenRequired: oxygenRequired || false,
      monitoringRequired: monitoringRequired || false,
      generateQRCode: generateQRCode || false,
      selectedAgencies: selectedAgencies || [],
      notificationRadius: notificationRadius || 100,
      notes,
      priority
    };

    const result = await tripService.createEnhancedTrip(enhancedTripData);
    
    console.log('TCC_DEBUG: Enhanced trip created successfully:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('TCC_DEBUG: Error creating enhanced trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create enhanced transport request'
    });
  }
});

/**
 * GET /api/trips
 * Get all transport requests with optional filtering
 */
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
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
 * GET /api/trips/history
 * Get trip history with timeline and filtering
 */
router.get('/history', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get trip history request with query:', req.query);
    
    const {
      status,
      agencyId,
      dateFrom,
      dateTo,
      limit = '50',
      offset = '0',
      search
    } = req.query;

    const result = await tripService.getTripHistory({
      status: status as string,
      agencyId: agencyId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      search: search as string
    });

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
    console.error('TCC_DEBUG: Get trip history error:', error);
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
router.get('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
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
      arrivalTimestamp,
      departureTimestamp,
      completionTimestamp,
      urgencyLevel,
      transportLevel,
      diagnosis,
      mobilityLevel,
      insuranceCompany,
      specialNeeds,
      oxygenRequired,
      monitoringRequired,
    } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    if (!['PENDING', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be PENDING, ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED, or CANCELLED'
      });
    }

    const updateData: UpdateTripStatusRequest = {
      status,
      assignedAgencyId,
      assignedUnitId,
      acceptedTimestamp,
      pickupTimestamp,
      arrivalTimestamp,
      departureTimestamp,
      completionTimestamp,
      urgencyLevel,
      transportLevel,
      diagnosis,
      mobilityLevel,
      insuranceCompany,
      specialNeeds,
      oxygenRequired,
      monitoringRequired,
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

    const { emailNotifications, smsNotifications, newTripAlerts, statusUpdates, emailAddress, phoneNumber } = req.body;

    const settings = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      smsNotifications: smsNotifications !== undefined ? smsNotifications : true,
      newTripAlerts: newTripAlerts !== undefined ? newTripAlerts : true,
      statusUpdates: statusUpdates !== undefined ? statusUpdates : true,
      emailAddress: emailAddress || null,
      phoneNumber: phoneNumber || null
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
    console.log('TCC_DEBUG: Test email service request received');
    console.log('TCC_DEBUG: Authenticated user:', req.user);
    
    console.log('TCC_DEBUG: Importing email service...');
    const emailService = (await import('../services/emailService')).default;
    console.log('TCC_DEBUG: Email service imported successfully');
    
    console.log('TCC_DEBUG: Testing email connection...');
    const isConnected = await emailService.testEmailConnection();
    console.log('TCC_DEBUG: Email connection test result:', isConnected);

    if (isConnected) {
      console.log('TCC_DEBUG: Email service connection successful');
      res.json({
        success: true,
        message: 'Email service connection successful'
      });
    } else {
      console.log('TCC_DEBUG: Email service connection failed');
      res.status(500).json({
        success: false,
        error: 'Email service connection failed'
      });
    }

  } catch (error: any) {
    console.error('TCC_DEBUG: Test email service error:', error);
    console.error('TCC_DEBUG: Error stack:', error?.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + (error?.message || 'Unknown error')
    });
  }
});

/**
 * POST /api/trips/test-sms
 * Test SMS service connection
 */
router.post('/test-sms', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Test SMS service request received');
    console.log('TCC_DEBUG: Authenticated user:', req.user);
    
    console.log('TCC_DEBUG: Importing email service for SMS...');
    const emailService = (await import('../services/emailService')).default;
    console.log('TCC_DEBUG: Email service imported successfully for SMS');
    
    console.log('TCC_DEBUG: Testing SMS connection...');
    const isConnected = await emailService.testSMSConnection();
    console.log('TCC_DEBUG: SMS connection test result:', isConnected);

    if (isConnected) {
      console.log('TCC_DEBUG: SMS service connection successful');
      res.json({
        success: true,
        message: 'SMS service connection successful'
      });
    } else {
      console.log('TCC_DEBUG: SMS service connection failed');
      res.status(500).json({
        success: false,
        error: 'SMS service connection failed'
      });
    }

  } catch (error: any) {
    console.error('TCC_DEBUG: Test SMS service error:', error);
    console.error('TCC_DEBUG: Error stack:', error?.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + (error?.message || 'Unknown error')
    });
  }
});

/**
 * GET /api/trips/agencies/:hospitalId
 * Get agencies within distance for a hospital
 */
router.get('/agencies/:hospitalId', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { hospitalId } = req.params;
    const { radius = 100 } = req.query;
    
    const result = await tripService.getAgenciesForHospital(hospitalId);
    res.json(result);
  } catch (error) {
    console.error('TCC_DEBUG: Get agencies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agencies for hospital'
    });
  }
});

/**
 * PUT /api/trips/:id/times
 * Update trip time tracking
 */
router.put('/:id/times', async (req, res) => {
  try {
    const { id } = req.params;
    const { transferAcceptedTime, emsArrivalTime, emsDepartureTime } = req.body;
    
    const result = await tripService.updateTripTimes(id, {
      transferAcceptedTime,
      emsArrivalTime,
      emsDepartureTime
    });
    
    res.json(result);
  } catch (error) {
    console.error('TCC_DEBUG: Update trip times error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update trip times'
    });
  }
});

/**
 * GET /api/trips/options/diagnosis
 * Get diagnosis options
 */
router.get('/options/diagnosis', async (req, res) => {
  try {
    const result = tripService.getDiagnosisOptions();
    res.json(result);
  } catch (error) {
    console.error('TCC_DEBUG: Get diagnosis options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get diagnosis options'
    });
  }
});

/**
 * GET /api/trips/options/mobility
 * Get mobility options
 */
router.get('/options/mobility', async (req, res) => {
  try {
    const result = tripService.getMobilityOptions();
    res.json(result);
  } catch (error) {
    console.error('TCC_DEBUG: Get mobility options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get mobility options'
    });
  }
});

/**
 * GET /api/trips/options/transport-level
 * Get transport level options
 */
router.get('/options/transport-level', async (req, res) => {
  try {
    const result = tripService.getTransportLevelOptions();
    res.json(result);
  } catch (error) {
    console.error('TCC_DEBUG: Get transport level options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transport level options'
    });
  }
});

/**
 * GET /api/trips/options/urgency
 * Get urgency options
 */
router.get('/options/urgency', async (req, res) => {
  try {
    const result = tripService.getUrgencyOptions();
    res.json(result);
  } catch (error) {
    console.error('TCC_DEBUG: Get urgency options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get urgency options'
    });
  }
});

/**
 * GET /api/trips/options/insurance
 * Get insurance company options
 */
router.get('/options/insurance', async (req, res) => {
  try {
    const result = await tripService.getInsuranceOptions();
    res.json(result);
  } catch (error) {
    console.error('TCC_DEBUG: Get insurance options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get insurance options'
    });
  }
});

// ============================================================================
// NEW TRIP ENDPOINTS WITH RESPONSE HANDLING
// Phase 1C: Basic API Endpoints implementation
// ============================================================================

/**
 * POST /api/trips/with-responses
 * Create a new trip with response handling capabilities
 */
router.post('/with-responses', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Create trip with responses request received:', req.body);
    
    const {
      patientId,
      patientWeight,
      specialNeeds,
      insuranceCompany,
      fromLocation,
      pickupLocationId,
      toLocation,
      scheduledTime,
      transportLevel,
      urgencyLevel,
      diagnosis,
      mobilityLevel,
      oxygenRequired,
      monitoringRequired,
      generateQRCode,
      selectedAgencies,
      notificationRadius,
      notes,
      priority,
      responseDeadline,
      maxResponses,
      selectionMode
    } = req.body;

    // Validation
    if (!fromLocation || !toLocation || !transportLevel || !urgencyLevel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fromLocation, toLocation, transportLevel, urgencyLevel'
      });
    }

    if (!['BLS', 'ALS', 'CCT', 'Other'].includes(transportLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transport level. Must be BLS, ALS, CCT, or Other'
      });
    }

    if (!['Routine', 'Urgent', 'Emergent'].includes(urgencyLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid urgency level. Must be Routine, Urgent, or Emergent'
      });
    }

    if (selectionMode && !['BROADCAST', 'SPECIFIC_AGENCIES'].includes(selectionMode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid selection mode. Must be BROADCAST or SPECIFIC_AGENCIES'
      });
    }

    const tripData: CreateTripWithResponsesRequest = {
      patientId,
      patientWeight,
      specialNeeds,
      insuranceCompany,
      fromLocation,
      pickupLocationId,
      toLocation,
      scheduledTime: scheduledTime || new Date().toISOString(),
      transportLevel,
      urgencyLevel,
      diagnosis,
      mobilityLevel,
      oxygenRequired: oxygenRequired || false,
      monitoringRequired: monitoringRequired || false,
      generateQRCode: generateQRCode || false,
      selectedAgencies: selectedAgencies || [],
      notificationRadius: notificationRadius || 100,
      notes,
      priority,
      responseDeadline,
      maxResponses: maxResponses || 5,
      selectionMode: selectionMode || 'SPECIFIC_AGENCIES'
    };

    const result = await tripService.createTripWithResponses(tripData);
    
    console.log('TCC_DEBUG: Trip with responses created successfully:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('TCC_DEBUG: Error creating trip with responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create trip with response handling'
    });
  }
});

/**
 * PUT /api/trips/:id/response-fields
 * Update trip response handling fields
 */
router.put('/:id/response-fields', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Update trip response fields request:', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const {
      responseDeadline,
      maxResponses,
      responseStatus,
      selectionMode
    } = req.body;

    if (responseStatus && !['PENDING', 'RESPONSES_RECEIVED', 'AGENCY_SELECTED'].includes(responseStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid response status. Must be PENDING, RESPONSES_RECEIVED, or AGENCY_SELECTED'
      });
    }

    if (selectionMode && !['BROADCAST', 'SPECIFIC_AGENCIES'].includes(selectionMode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid selection mode. Must be BROADCAST or SPECIFIC_AGENCIES'
      });
    }

    const updateData: UpdateTripResponseFieldsRequest = {
      responseDeadline,
      maxResponses,
      responseStatus,
      selectionMode
    };

    const result = await tripService.updateTripResponseFields(id, updateData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Trip response fields updated successfully',
      data: result.data
    });

  } catch (error) {
    console.error('TCC_DEBUG: Update trip response fields error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/trips/:id/with-responses
 * Get a trip with all agency responses
 */
router.get('/:id/with-responses', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Get trip with responses request:', req.params.id);
    
    const { id } = req.params;
    const result = await tripService.getTripWithResponses(id);

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
    console.error('TCC_DEBUG: Get trip with responses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/trips/:id/response-summary
 * Get response summary for a trip
 */
router.get('/:id/response-summary', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Get response summary request:', req.params.id);
    
    const { id } = req.params;
    const result = await tripService.getTripResponseSummary(id);

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
    console.error('TCC_DEBUG: Get response summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
