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
    this.emsPrisma = databaseManager.getEMSDB();
    console.log('TCC_DEBUG: AuthService constructor - JWT_SECRET loaded:', this.jwtSecret ? 'YES' : 'NO');
    console.log('TCC_DEBUG: JWT_SECRET value:', this.jwtSecret);
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      console.log('TCC_DEBUG: AuthService.login called with:', { email: credentials.email, password: credentials.password ? '***' : 'missing' });
      const { email, password } = credentials;

      // First try Center database (Admin and User types)
      const centerDB = databaseManager.getCenterDB();
      let user = await centerDB.centerUser.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          userType: true,
          phone: true,
          emailNotifications: true,
          smsNotifications: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      let userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS' = 'ADMIN';
      let userData: User;

      if (user) {
        // Use the actual userType from the Center database
        userType = user.userType as 'ADMIN' | 'USER';
        // Ensure the user object has the new fields
        user = {
          ...user,
          phone: user.phone || null,
          emailNotifications: user.emailNotifications || true,
          smsNotifications: user.smsNotifications || false
        };
      } else {
        // Try Hospital database (Healthcare users)
        const hospitalDB = databaseManager.getHospitalDB();
        const hospitalUser = await hospitalDB.healthcareUser.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            phone: true,
            emailNotifications: true,
            smsNotifications: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            facilityName: true,
            facilityType: true
          }
        });
        if (hospitalUser) {
          userType = 'HEALTHCARE';
          // Convert hospital user to center user format
          user = {
            id: hospitalUser.id,
            email: hospitalUser.email,
            password: hospitalUser.password,
            name: hospitalUser.name,
            userType: 'HEALTHCARE',
            phone: hospitalUser.phone || null,
            emailNotifications: hospitalUser.emailNotifications || true,
            smsNotifications: hospitalUser.smsNotifications || false,
            isActive: hospitalUser.isActive,
            createdAt: hospitalUser.createdAt,
            updatedAt: hospitalUser.updatedAt
          };
        }
      }

      if (!user) {
        // Try EMS database (EMS users)
        const emsDB = databaseManager.getEMSDB();
        const emsUser = await emsDB.eMSUser.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            phone: true,
            emailNotifications: true,
            smsNotifications: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            agencyName: true,
            agencyId: true
          }
        });
        if (emsUser) {
          userType = 'EMS';
          // Convert EMS user to center user format
          user = {
            id: emsUser.id,
            email: emsUser.email,
            password: emsUser.password,
            name: emsUser.name,
            userType: 'EMS',
            phone: emsUser.phone || null,
            emailNotifications: emsUser.emailNotifications || true,
            smsNotifications: emsUser.smsNotifications || false,
            isActive: emsUser.isActive,
            createdAt: emsUser.createdAt,
            updatedAt: emsUser.updatedAt
          };
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
      if (userType === 'ADMIN') {
        userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: 'ADMIN'
        };
      } else if (userType === 'USER') {
        userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: 'USER'
        };
      } else if (userType === 'HEALTHCARE') {
        userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: 'HEALTHCARE',
          facilityName: (user as any).facilityName
        };
      } else {
        userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: 'EMS',
          agencyName: (user as any).agencyName
        };
      }

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

      // Verify user still exists and is active based on user type
      if (decoded.userType === 'ADMIN' || decoded.userType === 'USER') {
        const centerDB = databaseManager.getCenterDB();
        const user = await centerDB.centerUser.findUnique({
          where: { id: decoded.id }
        });

        if (!user || !user.isActive) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType as 'ADMIN' | 'USER'
        };
      } else if (decoded.userType === 'HEALTHCARE') {
        const hospitalDB = databaseManager.getHospitalDB();
        const user = await hospitalDB.healthcareUser.findUnique({
          where: { id: decoded.id }
        });

        if (!user || !user.isActive) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: 'HEALTHCARE',
          facilityName: user.facilityName
        };
      } else if (decoded.userType === 'EMS') {
        const emsDB = databaseManager.getEMSDB();
        // For EMS users, decoded.id contains the agency ID, not the user ID
        // We need to find the user by email since that's what we have in the token
        const user = await emsDB.eMSUser.findUnique({
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
          agencyName: user.agencyName
        };
      }

      return null;

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