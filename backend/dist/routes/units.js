"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const unitService_1 = require("../services/unitService");
const authenticateAdmin_1 = require("../middleware/authenticateAdmin");
const router = express_1.default.Router();
/**
 * GET /api/units
 * Get all units for the authenticated agency
 */
router.get('/', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
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
        const units = await unitService_1.unitService.getUnitsByAgency(agencyId);
        console.log('🔍 Units API: units found:', units.length);
        res.json({
            success: true,
            data: units
        });
    }
    catch (error) {
        console.error('Error getting units:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve units'
        });
    }
});
/**
 * POST /api/units
 * Create a new unit for the authenticated agency
 */
router.post('/', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const agencyId = req.user?.id;
        console.log('🔍 Units API POST: req.user:', req.user);
        console.log('🔍 Units API POST: agencyId:', agencyId);
        console.log('🔍 Units API POST: body:', req.body);
        if (!agencyId) {
            return res.status(400).json({
                success: false,
                error: 'Agency ID not found'
            });
        }
        const unitData = req.body;
        // Validate required fields
        if (!unitData.unitNumber || !unitData.type) {
            return res.status(400).json({
                success: false,
                error: 'Unit number and type are required'
            });
        }
        const unit = await unitService_1.unitService.createUnit(unitData, agencyId);
        console.log('🔍 Units API POST: unit created:', unit);
        res.status(201).json({
            success: true,
            data: unit,
            message: 'Unit created successfully'
        });
    }
    catch (error) {
        console.error('Error creating unit:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create unit'
        });
    }
});
/**
 * GET /api/units/available
 * Get available units for optimization
 */
router.get('/available', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const agencyId = req.user?.id;
        if (!agencyId) {
            return res.status(400).json({
                success: false,
                error: 'Agency ID not found'
            });
        }
        const units = await unitService_1.unitService.getAvailableUnits(agencyId);
        res.json({
            success: true,
            data: units
        });
    }
    catch (error) {
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
router.get('/analytics', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const agencyId = req.user?.id;
        if (!agencyId) {
            return res.status(400).json({
                success: false,
                error: 'Agency ID not found'
            });
        }
        const analytics = await unitService_1.unitService.getUnitAnalytics(agencyId);
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
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
router.get('/:id', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const unit = await unitService_1.unitService.getUnitById(id);
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
    }
    catch (error) {
        console.error('Error getting unit:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve unit'
        });
    }
});
/**
 * PUT /api/units/:id
 * Update unit details
 */
router.put('/:id', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const unitData = req.body;
        // Validate required fields for update
        if (unitData.unitNumber !== undefined && !unitData.unitNumber) {
            return res.status(400).json({
                success: false,
                error: 'Unit number cannot be empty'
            });
        }
        if (unitData.type !== undefined && !unitData.type) {
            return res.status(400).json({
                success: false,
                error: 'Unit type cannot be empty'
            });
        }
        const unit = await unitService_1.unitService.updateUnit(id, unitData);
        res.json({
            success: true,
            data: unit
        });
    }
    catch (error) {
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
router.put('/:id/status', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const statusUpdate = req.body;
        if (!statusUpdate.status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }
        const unit = await unitService_1.unitService.updateUnitStatus(id, statusUpdate);
        res.json({
            success: true,
            data: unit
        });
    }
    catch (error) {
        console.error('Error updating unit status:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update unit status'
        });
    }
});
/**
 * PUT /api/units/:id
 * Update a unit
 */
router.put('/:id', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const agencyId = req.user?.id;
        console.log('🔍 Units API PUT: req.user:', req.user);
        console.log('🔍 Units API PUT: agencyId:', agencyId);
        console.log('🔍 Units API PUT: unitId:', id);
        console.log('🔍 Units API PUT: body:', req.body);
        if (!agencyId) {
            return res.status(400).json({
                success: false,
                error: 'Agency ID not found'
            });
        }
        const unitData = req.body;
        // Validate required fields
        if (!unitData.unitNumber || !unitData.type) {
            return res.status(400).json({
                success: false,
                error: 'Unit number and type are required'
            });
        }
        const unit = await unitService_1.unitService.updateUnit(id, unitData);
        console.log('🔍 Units API PUT: unit updated:', unit);
        res.json({
            success: true,
            data: unit,
            message: 'Unit updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating unit:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update unit'
        });
    }
});
/**
 * DELETE /api/units/:id
 * Delete a unit
 */
router.delete('/:id', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const agencyId = req.user?.id;
        console.log('🔍 Units API DELETE: req.user:', req.user);
        console.log('🔍 Units API DELETE: agencyId:', agencyId);
        console.log('🔍 Units API DELETE: unitId:', id);
        if (!agencyId) {
            return res.status(400).json({
                success: false,
                error: 'Agency ID not found'
            });
        }
        await unitService_1.unitService.deleteUnit(id);
        console.log('🔍 Units API DELETE: unit deleted');
        res.json({
            success: true,
            message: 'Unit deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting unit:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete unit'
        });
    }
});
exports.default = router;
//# sourceMappingURL=units.js.map