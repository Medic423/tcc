import express from 'express';
import { databaseManager } from '../services/databaseManager';
import { authenticateAdmin } from '../middleware/authenticateAdmin';
import { AuthenticatedRequest } from '../middleware/authenticateAdmin';

const router = express.Router();

// Get all dropdown options for a category
router.get('/:category', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { category } = req.params;
    
    const hospitalPrisma = databaseManager.getHospitalDB();
    const options = await hospitalPrisma.dropdownOption.findMany({
      where: {
        category: category,
        isActive: true
      },
      orderBy: {
        value: 'asc'
      }
    });

    res.json({
      success: true,
      data: options,
      message: `${category} options retrieved successfully`
    });
  } catch (error) {
    console.error('TCC_DEBUG: Get dropdown options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dropdown options'
    });
  }
});

// Add new dropdown option
router.post('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { category, value } = req.body;
    
    if (!category || !value) {
      return res.status(400).json({
        success: false,
        error: 'Category and value are required'
      });
    }

    const hospitalPrisma = databaseManager.getHospitalDB();
    
    // Check if option already exists
    const existingOption = await hospitalPrisma.dropdownOption.findFirst({
      where: {
        category: category,
        value: value
      }
    });

    if (existingOption) {
      return res.status(400).json({
        success: false,
        error: 'This option already exists'
      });
    }

    const newOption = await hospitalPrisma.dropdownOption.create({
      data: {
        category: category,
        value: value,
        isActive: true
      }
    });

    res.json({
      success: true,
      data: newOption,
      message: 'Dropdown option added successfully'
    });
  } catch (error) {
    console.error('TCC_DEBUG: Add dropdown option error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add dropdown option'
    });
  }
});

// Update dropdown option
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { value, isActive } = req.body;
    
    const hospitalPrisma = databaseManager.getHospitalDB();
    
    const updatedOption = await hospitalPrisma.dropdownOption.update({
      where: { id },
      data: {
        value: value,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.json({
      success: true,
      data: updatedOption,
      message: 'Dropdown option updated successfully'
    });
  } catch (error) {
    console.error('TCC_DEBUG: Update dropdown option error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update dropdown option'
    });
  }
});

// Delete dropdown option (soft delete)
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const hospitalPrisma = databaseManager.getHospitalDB();
    
    await hospitalPrisma.dropdownOption.update({
      where: { id },
      data: {
        isActive: false
      }
    });

    res.json({
      success: true,
      message: 'Dropdown option deleted successfully'
    });
  } catch (error) {
    console.error('TCC_DEBUG: Delete dropdown option error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete dropdown option'
    });
  }
});

// Get all categories
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const hospitalPrisma = databaseManager.getHospitalDB();
    
    const categories = await hospitalPrisma.dropdownOption.findMany({
      select: {
        category: true
      },
      distinct: ['category'],
      where: {
        isActive: true
      }
    });

    res.json({
      success: true,
      data: categories.map((c: any) => c.category),
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('TCC_DEBUG: Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories'
    });
  }
});

export default router;
