import { Request, Response, NextFunction } from 'express';
import { authService, User } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const user = await authService.verifyToken(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Alias for EMS users
export const authenticateToken = authenticateAdmin;
