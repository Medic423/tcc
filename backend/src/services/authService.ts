import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { databaseManager } from './databaseManager';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
  facilityName?: string;
  agencyName?: string;
  agencyId?: string;
  manageMultipleLocations?: boolean; // ✅ NEW: Multi-location flag
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export class AuthService {
  private jwtSecret: string;
  private emsPrisma: any;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.emsPrisma = databaseManager.getPrismaClient(); // ✅ FIXED: Use unified database
    console.log('TCC_DEBUG: AuthService constructor - JWT_SECRET loaded:', this.jwtSecret ? 'YES' : 'NO');
    console.log('TCC_DEBUG: JWT_SECRET value:', this.jwtSecret);
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      console.log('TCC_DEBUG: AuthService.login called with:', { email: credentials.email, password: credentials.password ? '***' : 'missing' });
      const { email, password } = credentials;

      // Use unified database to find user
      const db = databaseManager.getPrismaClient(); // ✅ FIXED: Use unified database
      let user: any = null;
      let userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS' = 'ADMIN';
      let userData: User;

      // Try to find user in CenterUser table first
      user = await db.centerUser.findUnique({
        where: { email }
      });
      if (user) {
        userType = user.userType as 'ADMIN' | 'USER';
      }

      // If not found, try HealthcareUser table
      if (!user) {
        user = await db.healthcareUser.findUnique({
          where: { email }
        });
        if (user) {
          userType = 'HEALTHCARE';
        }
      }

      // If still not found, try EMSUser table
      if (!user) {
        user = await db.eMSUser.findUnique({
          where: { email }
        });
        if (user) {
          userType = 'EMS';
        }
      }

      console.log('TCC_DEBUG: User found in database:', user ? { id: user.id, email: user.email, name: user.name, isActive: user.isActive, userType } : 'null');

      if (!user) {
        console.log('TCC_DEBUG: No user found for email:', email);
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          error: 'Account is deactivated'
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // For EMS users, use the agency ID from the relationship
      let agencyId = user.id; // Default to user ID for non-EMS users
      if (userType === 'EMS') {
        // Use the agencyId from the user record - this is required for EMS users
        const emsUser = user as any;
        if (!emsUser.agencyId) {
          console.error('TCC_DEBUG: EMS user missing agencyId:', { userId: user.id, email: user.email });
          return {
            success: false,
            error: 'User not properly associated with an agency'
          };
        }
        agencyId = emsUser.agencyId;
        console.log('TCC_DEBUG: Using agencyId for EMS user:', { userId: user.id, agencyId });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: userType === 'EMS' ? agencyId : user.id,
          email: user.email,
          userType: userType
        },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      // Create user data based on type
      userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: userType,
        facilityName: userType === 'HEALTHCARE' ? (user as any).facilityName : undefined,
        agencyName: userType === 'EMS' ? (user as any).agencyName : undefined,
        agencyId: userType === 'EMS' ? (user as any).agencyId : undefined,
        manageMultipleLocations: userType === 'HEALTHCARE' ? (user as any).manageMultipleLocations : undefined // ✅ NEW: Multi-location flag
      };

      return {
        success: true,
        user: userData,
        token
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      console.log('TCC_DEBUG: verifyToken called with JWT_SECRET:', this.jwtSecret ? 'SET' : 'NOT SET');
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      console.log('TCC_DEBUG: Token decoded successfully:', { id: decoded.id, email: decoded.email, userType: decoded.userType });
      
      if (!['ADMIN', 'USER', 'HEALTHCARE', 'EMS'].includes(decoded.userType)) {
        return null;
      }

      // Verify user still exists and is active using single database
      const db = databaseManager.getCenterDB();
      let user: any = null;

      if (decoded.userType === 'ADMIN' || decoded.userType === 'USER') {
        user = await db.centerUser.findUnique({
          where: { id: decoded.id }
        });
      } else if (decoded.userType === 'HEALTHCARE') {
        user = await db.healthcareUser.findUnique({
          where: { id: decoded.id }
        });
      } else if (decoded.userType === 'EMS') {
        // For EMS users, decoded.id contains the agency ID, not the user ID
        // We need to find the user by email since that's what we have in the token
        user = await db.eMSUser.findUnique({
          where: { email: decoded.email }
        });

        if (!user || !user.isActive) {
          return null;
        }

        return {
          id: decoded.id, // Use agency ID from token
          email: user.email,
          name: user.name,
          userType: 'EMS',
          agencyName: user.agencyName,
          agencyId: user.agencyId
        };
      }

      if (!user || !user.isActive) {
        return null;
      }

      // Return unified user data
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: decoded.userType as 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS',
        facilityName: decoded.userType === 'HEALTHCARE' ? (user as any).facilityName : undefined,
        agencyName: decoded.userType === 'EMS' ? (user as any).agencyName : undefined,
        agencyId: decoded.userType === 'EMS' ? (user as any).agencyId : undefined
      };

    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    userType: 'ADMIN' | 'USER';
  }): Promise<User> {
    const centerDB = databaseManager.getCenterDB();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await centerDB.centerUser.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        userType: userData.userType
      }
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType as 'ADMIN' | 'USER'
    };
  }

  async createAdminUser(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    return this.createUser({ ...userData, userType: 'ADMIN' });
  }

  async createRegularUser(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    return this.createUser({ ...userData, userType: 'USER' });
  }
}

export const authService = new AuthService();
export default authService;