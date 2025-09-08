import express from 'express';
import { authService } from '../services/authService';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import { databaseManager } from '../services/databaseManager';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const router = express.Router();

/**
 * POST /api/auth/login
 * Admin login endpoint
 */
router.post('/login', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Login request received:', { 
      email: req.body.email, 
      password: req.body.password ? '***' : 'missing',
      body: req.body,
      headers: req.headers
    });
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await authService.login({ email, password });

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint (client-side token removal)
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * GET /api/auth/verify
 * Verify token and get user info
 */
router.get('/verify', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * POST /api/auth/healthcare/register
 * Register new Healthcare Facility (Public)
 */
router.post('/healthcare/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      facilityName, 
      facilityType, 
      address, 
      city, 
      state, 
      zipCode, 
      phone, 
      latitude, 
      longitude 
    } = req.body;

    if (!email || !password || !name || !facilityName || !facilityType) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, facilityName, and facilityType are required'
      });
    }

    // Validate coordinates if provided
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: 'Invalid latitude or longitude coordinates'
        });
      }
    }

    const hospitalDB = databaseManager.getHospitalDB();
    
    // Check if user already exists
    const existingUser = await hospitalDB.healthcareUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Create new healthcare user
    const user = await hospitalDB.healthcareUser.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        name,
        facilityName,
        facilityType,
        userType: 'HEALTHCARE',
        isActive: false // Requires admin approval
      }
    });

    // Also create a corresponding Hospital record in Center database for TCC dashboard
    const centerDB = databaseManager.getCenterDB();
    await centerDB.hospital.create({
      data: {
        name: facilityName,
        address: address || 'Address to be provided',
        city: city || 'City to be provided',
        state: state || 'State to be provided',
        zipCode: zipCode || '00000',
        phone: phone || null,
        email: email,
        type: facilityType,
        capabilities: [], // Will be updated when approved
        region: 'Region to be determined',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isActive: false, // Requires admin approval
        requiresReview: true // Flag for admin review
      }
    });

    res.status(201).json({
      success: true,
      message: 'Healthcare facility registration submitted for approval',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        facilityName: user.facilityName,
        facilityType: user.facilityType,
        userType: user.userType,
        isActive: user.isActive
      }
    });

  } catch (error: any) {
    console.error('Healthcare registration error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
});

/**
 * PUT /api/auth/healthcare/facility/update
 * Update healthcare facility information (Authenticated)
 */
router.put('/healthcare/facility/update', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Healthcare facility update request received:', {
      userId: req.user?.id,
      userType: req.user?.userType,
      body: req.body
    });

    const userId = req.user?.id;
    if (!userId) {
      console.log('TCC_DEBUG: No user ID found in request');
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const updateData = req.body;
    console.log('TCC_DEBUG: Update data received:', updateData);

    const hospitalDB = databaseManager.getHospitalDB();
    const centerDB = databaseManager.getCenterDB();

    console.log('TCC_DEBUG: Attempting to update healthcare user record...');
    
    // Update healthcare user record
    const updatedUser = await hospitalDB.healthcareUser.update({
      where: { id: userId },
      data: {
        facilityName: updateData.facilityName,
        facilityType: updateData.facilityType,
        email: updateData.email,
        updatedAt: new Date()
      }
    });

    console.log('TCC_DEBUG: Healthcare user updated successfully:', updatedUser);

    console.log('TCC_DEBUG: Attempting to update Hospital record in Center database...');
    
    // Also update the corresponding Hospital record in Center database
    const hospitalUpdateResult = await centerDB.hospital.updateMany({
      where: { email: updatedUser.email },
      data: {
        name: updateData.facilityName,
        type: updateData.facilityType,
        email: updateData.email,
        phone: updateData.phone,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        zipCode: updateData.zipCode,
        updatedAt: new Date()
      }
    });

    console.log('TCC_DEBUG: Hospital record update result:', hospitalUpdateResult);

    res.json({
      success: true,
      message: 'Facility information updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('TCC_DEBUG: Update healthcare facility error:', error);
    console.error('TCC_DEBUG: Error stack:', (error as Error).stack);
    res.status(500).json({
      success: false,
      error: 'Failed to update facility information'
    });
  }
});

/**
 * PUT /api/auth/ems/agency/update
 * Update EMS agency information (Authenticated)
 */
router.put('/ems/agency/update', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: EMS agency update request received:', {
      userId: req.user?.id,
      userType: req.user?.userType,
      body: req.body
    });

    const userId = req.user?.id;
    if (!userId) {
      console.log('TCC_DEBUG: No user ID found in request');
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const updateData = req.body;
    console.log('TCC_DEBUG: Update data received:', updateData);

    const emsDB = databaseManager.getEMSDB();
    const centerDB = databaseManager.getCenterDB();

    console.log('TCC_DEBUG: Attempting to update EMS user record...');
    
    // Update EMS user record
    const updatedUser = await emsDB.eMSUser.update({
      where: { id: userId },
      data: {
        agencyName: updateData.agencyName,
        email: updateData.email,
        name: updateData.contactName,
        updatedAt: new Date()
      }
    });

    console.log('TCC_DEBUG: EMS user updated successfully:', updatedUser);

    console.log('TCC_DEBUG: Attempting to find existing Agency record in Center database...');
    
    // Check if agency record exists
    const existingAgency = await centerDB.eMSAgency.findFirst({
      where: { email: updateData.email }
    });

    let agencyUpdateResult;
    if (existingAgency) {
      console.log('TCC_DEBUG: Updating existing Agency record...');
      agencyUpdateResult = await centerDB.eMSAgency.update({
        where: { id: existingAgency.id },
        data: {
          name: updateData.agencyName,
          email: updateData.email,
          contactName: updateData.contactName,
          phone: updateData.phone,
          address: updateData.address,
          city: updateData.city,
          state: updateData.state,
          zipCode: updateData.zipCode,
          serviceArea: updateData.serviceType ? [updateData.serviceType] : [],
          capabilities: updateData.serviceType ? [updateData.serviceType] : [],
          updatedAt: new Date()
        }
      });
    } else {
      console.log('TCC_DEBUG: Creating new Agency record...');
      agencyUpdateResult = await centerDB.eMSAgency.create({
        data: {
          name: updateData.agencyName,
          email: updateData.email,
          contactName: updateData.contactName,
          phone: updateData.phone,
          address: updateData.address,
          city: updateData.city,
          state: updateData.state,
          zipCode: updateData.zipCode,
          serviceArea: updateData.serviceType ? [updateData.serviceType] : [],
          capabilities: updateData.serviceType ? [updateData.serviceType] : [],
          isActive: true,
          status: "ACTIVE"
        }
      });
    }

    console.log('TCC_DEBUG: Agency record operation result:', agencyUpdateResult);

    res.json({
      success: true,
      message: 'Agency information updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('TCC_DEBUG: Update EMS agency error:', error);
    console.error('TCC_DEBUG: Error stack:', (error as Error).stack);
    res.status(500).json({
      success: false,
      error: 'Failed to update agency information'
    });
  }
});

/**
 * POST /api/auth/ems/register
 * Register new EMS Agency (Public)
 */
router.post('/ems/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      agencyName, 
      serviceType, 
      address, 
      city, 
      state, 
      zipCode, 
      phone, 
      latitude, 
      longitude, 
      capabilities, 
      operatingHours 
    } = req.body;

    if (!email || !password || !name || !agencyName || !serviceType) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, agencyName, and serviceType are required'
      });
    }

    // Validate coordinates if provided
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: 'Invalid latitude or longitude coordinates'
        });
      }
    }

    const emsDB = databaseManager.getEMSDB();
    
    // Check if user already exists
    const existingUser = await emsDB.eMSUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Create new EMS user
    const user = await emsDB.eMSUser.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        name,
        agencyName,
        userType: 'EMS',
        isActive: false // Requires admin approval
      }
    });

    // Also create a corresponding EMSAgency record in Center database for TCC dashboard
    const centerDB = databaseManager.getCenterDB();
    await centerDB.eMSAgency.create({
      data: {
        name: agencyName,
        contactName: name,
        phone: phone || 'Phone to be provided',
        email: email,
        address: address || 'Address to be provided',
        city: city || 'City to be provided',
        state: state || 'State to be provided',
        zipCode: zipCode || '00000',
        capabilities: capabilities || [],
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isActive: false, // Requires admin approval
        requiresReview: true // Flag for admin review
      }
    });

    res.status(201).json({
      success: true,
      message: 'EMS agency registration submitted for approval',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        agencyName: user.agencyName,
        userType: user.userType,
        isActive: user.isActive
      }
    });

  } catch (error: any) {
    console.error('EMS registration error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
});

/**
 * POST /api/auth/register
 * Register new user (Admin only)
 */
router.post('/register', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    // Only admins can create new users
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can create new users'
      });
    }

    const { email, password, name, userType } = req.body;

    if (!email || !password || !name || !userType) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, and userType are required'
      });
    }

    if (!['ADMIN', 'USER'].includes(userType)) {
      return res.status(400).json({
        success: false,
        error: 'userType must be either ADMIN or USER'
      });
    }

    const user = await authService.createUser({
      email,
      password,
      name,
      userType
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType
      }
    });

  } catch (error: any) {
    console.error('User registration error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/users
 * Get all users (Admin only)
 */
router.get('/users', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    // Only admins can view all users
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can view all users'
      });
    }

    const centerDB = (await import('../services/databaseManager')).databaseManager.getCenterDB();
    const users = await centerDB.centerUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/ems/login
 * EMS Agency login endpoint
 */
router.post('/ems/login', async (req, res) => {
  try {
    console.log('TCC_DEBUG: EMS Login request received:', { 
      email: req.body.email, 
      password: req.body.password ? '***' : 'missing'
    });
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const emsDB = databaseManager.getEMSDB();
    const user = await emsDB.eMSUser.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('TCC_DEBUG: No EMS user found for email:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        userType: 'EMS' 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: 'EMS',
        agencyName: user.agencyName
      },
      token
    });

  } catch (error) {
    console.error('EMS Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/healthcare/login
 * Healthcare Facility login endpoint
 */
router.post('/healthcare/login', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Healthcare Login request received:', { 
      email: req.body.email, 
      password: req.body.password ? '***' : 'missing'
    });
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const hospitalDB = databaseManager.getHospitalDB();
    const user = await hospitalDB.healthcareUser.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('TCC_DEBUG: No Healthcare user found for email:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        userType: 'HEALTHCARE' 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: 'HEALTHCARE',
        facilityName: user.facilityName,
        facilityType: user.facilityType
      },
      token
    });

  } catch (error) {
    console.error('Healthcare Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
