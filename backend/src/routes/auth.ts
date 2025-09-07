import express from 'express';
import { authService } from '../services/authService';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';

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

export default router;
