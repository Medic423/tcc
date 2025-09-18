import express from 'express';
import { databaseManager } from '../services/databaseManager';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';

const router = express.Router();

// Get all pickup locations for a specific hospital
router.get('/hospital/:hospitalId', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { hospitalId } = req.params;
    const { includeInactive } = req.query;

    const whereClause: any = {
      hospitalId: hospitalId
    };

    // Only include active locations unless specifically requested
    if (includeInactive !== 'true') {
      whereClause.isActive = true;
    }

    const pickupLocations = await databaseManager.getPrismaClient().pickupLocation.findMany({
      where: whereClause,
      include: {
        hospital: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: pickupLocations
    });
  } catch (error) {
    console.error('Error fetching pickup locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pickup locations'
    });
  }
});

// Get a specific pickup location by ID
router.get('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const pickupLocation = await databaseManager.getPrismaClient().pickupLocation.findUnique({
      where: { id },
      include: {
        hospital: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!pickupLocation) {
      return res.status(404).json({
        success: false,
        error: 'Pickup location not found'
      });
    }

    res.json({
      success: true,
      data: pickupLocation
    });
  } catch (error) {
    console.error('Error fetching pickup location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pickup location'
    });
  }
});

// Create a new pickup location
router.post('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      hospitalId,
      name,
      description,
      contactPhone,
      contactEmail,
      floor,
      room
    } = req.body;

    // Validate required fields
    if (!hospitalId || !name) {
      return res.status(400).json({
        success: false,
        error: 'Hospital ID and name are required'
      });
    }

    // Verify hospital exists
    const hospital = await databaseManager.getPrismaClient().hospital.findUnique({
      where: { id: hospitalId }
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    // Check if pickup location with same name already exists for this hospital
    const existingLocation = await databaseManager.getPrismaClient().pickupLocation.findFirst({
      where: {
        hospitalId,
        name: name.trim(),
        isActive: true
      }
    });

    if (existingLocation) {
      return res.status(409).json({
        success: false,
        error: 'A pickup location with this name already exists for this hospital'
      });
    }

    const pickupLocation = await databaseManager.getPrismaClient().pickupLocation.create({
      data: {
        hospitalId,
        name: name.trim(),
        description: description?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        floor: floor?.trim() || null,
        room: room?.trim() || null
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: pickupLocation,
      message: 'Pickup location created successfully'
    });
  } catch (error) {
    console.error('Error creating pickup location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create pickup location'
    });
  }
});

// Update a pickup location
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      contactPhone,
      contactEmail,
      floor,
      room,
      isActive
    } = req.body;

    // Check if pickup location exists
    const existingLocation = await databaseManager.getPrismaClient().pickupLocation.findUnique({
      where: { id }
    });

    if (!existingLocation) {
      return res.status(404).json({
        success: false,
        error: 'Pickup location not found'
      });
    }

    // If updating name, check for duplicates
    if (name && name.trim() !== existingLocation.name) {
      const duplicateLocation = await databaseManager.getPrismaClient().pickupLocation.findFirst({
        where: {
          hospitalId: existingLocation.hospitalId,
          name: name.trim(),
          isActive: true,
          id: { not: id }
        }
      });

      if (duplicateLocation) {
        return res.status(409).json({
          success: false,
          error: 'A pickup location with this name already exists for this hospital'
        });
      }
    }

    const updatedLocation = await databaseManager.getPrismaClient().pickupLocation.update({
      where: { id },
      data: {
        name: name?.trim() || existingLocation.name,
        description: description?.trim() || existingLocation.description,
        contactPhone: contactPhone?.trim() || existingLocation.contactPhone,
        contactEmail: contactEmail?.trim() || existingLocation.contactEmail,
        floor: floor?.trim() || existingLocation.floor,
        room: room?.trim() || existingLocation.room,
        isActive: isActive !== undefined ? isActive : existingLocation.isActive
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedLocation,
      message: 'Pickup location updated successfully'
    });
  } catch (error) {
    console.error('Error updating pickup location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pickup location'
    });
  }
});

// Delete a pickup location (soft delete by setting isActive to false)
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if pickup location exists
    const existingLocation = await databaseManager.getPrismaClient().pickupLocation.findUnique({
      where: { id }
    });

    if (!existingLocation) {
      return res.status(404).json({
        success: false,
        error: 'Pickup location not found'
      });
    }

    // Check if pickup location is being used by any trips
    const tripsUsingLocation = await databaseManager.getPrismaClient().trip.findFirst({
      where: {
        pickupLocationId: id
      }
    });

    if (tripsUsingLocation) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete pickup location that is being used by existing trips. Deactivate instead.'
      });
    }

    // Soft delete by setting isActive to false
    await databaseManager.getPrismaClient().pickupLocation.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Pickup location deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting pickup location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete pickup location'
    });
  }
});

// Hard delete a pickup location (permanent deletion)
router.delete('/:id/hard', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if pickup location exists
    const existingLocation = await databaseManager.getPrismaClient().pickupLocation.findUnique({
      where: { id }
    });

    if (!existingLocation) {
      return res.status(404).json({
        success: false,
        error: 'Pickup location not found'
      });
    }

    // Check if pickup location is being used by any trips
    const tripsUsingLocation = await databaseManager.getPrismaClient().trip.findFirst({
      where: {
        pickupLocationId: id
      }
    });

    if (tripsUsingLocation) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete pickup location that is being used by existing trips'
      });
    }

    // Hard delete
    await databaseManager.getPrismaClient().pickupLocation.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Pickup location permanently deleted'
    });
  } catch (error) {
    console.error('Error hard deleting pickup location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete pickup location'
    });
  }
});

export default router;
