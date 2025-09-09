import express from 'express';
import { UnitService, UnitFormData, UnitStatusUpdate } from '../services/unitService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticateAdmin';

const router = express.Router();
const unitService = new UnitService();

/**
 * GET /api/units
 * Get all units for the authenticated agency
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const agencyId = req.user?.id; // Assuming user ID is the agency ID for EMS users
    console.log('🔍 Units API: req.user:', req.user);
    console.log('🔍 Units API: agencyId:', agencyId);
    
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        error: 'Agency ID not found'
      });
    }

    const units = await unitService.getUnitsByAgency(agencyId);
    console.log('🔍 Units API: units found:', units.length);
    
    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    console.error('Error getting units:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve units'
    });
  }
});

/**
 * GET /api/units/available
 * Get available units for optimization
 */
router.get('/available', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const agencyId = req.user?.id;
    
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        error: 'Agency ID not found'
      });
    }

    const units = await unitService.getAvailableUnits(agencyId);
    
    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    console.error('Error getting available units:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve available units'
    });
  }
});

/**
 * GET /api/units/analytics
 * Get unit analytics for the agency
 */
router.get('/analytics', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const agencyId = req.user?.id;
    
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        error: 'Agency ID not found'
      });
    }

    const analytics = await unitService.getUnitAnalytics(agencyId);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting unit analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve unit analytics'
    });
  }
});

/**
 * GET /api/units/:id
 * Get a specific unit by ID
 */
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const unit = await unitService.getUnitById(id);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found'
      });
    }

    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error getting unit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve unit'
    });
  }
});

/**
 * POST /api/units
 * Create a new unit
 */
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const agencyId = req.user?.id;
    
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        error: 'Agency ID not found'
      });
    }

    const unitData: UnitFormData = req.body;
    
    // Validate required fields
    if (!unitData.unitNumber || !unitData.type) {
      return res.status(400).json({
        success: false,
        error: 'Unit number and type are required'
      });
    }

    const unit = await unitService.createUnit(agencyId, unitData);
    
    res.status(201).json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create unit'
    });
  }
});

/**
 * PUT /api/units/:id
 * Update unit details
 */
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const unitData: Partial<UnitFormData> = req.body;
    
    const unit = await unitService.updateUnit(id, unitData);
    
    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update unit'
    });
  }
});

/**
 * PUT /api/units/:id/status
 * Update unit status
 */
router.put('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const statusUpdate: UnitStatusUpdate = req.body;
    
    if (!statusUpdate.status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const unit = await unitService.updateUnitStatus(id, statusUpdate);
    
    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error updating unit status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update unit status'
    });
  }
});

/**
 * POST /api/units/:id/assign-trip
 * Assign trip to unit
 */
router.post('/:id/assign-trip', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { tripId, tripDetails } = req.body;
    
    if (!tripId || !tripDetails) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID and trip details are required'
      });
    }

    const unit = await unitService.assignTripToUnit(id, tripId, tripDetails);
    
    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error assigning trip to unit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign trip to unit'
    });
  }
});

/**
 * POST /api/units/:id/complete-trip
 * Complete trip assignment
 */
router.post('/:id/complete-trip', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const unit = await unitService.completeTripAssignment(id);
    
    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error completing trip assignment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete trip assignment'
    });
  }
});

/**
 * DELETE /api/units/:id
 * Deactivate unit (soft delete)
 */
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const unit = await unitService.deactivateUnit(id);
    
    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error deactivating unit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate unit'
    });
  }
});

export default router;
