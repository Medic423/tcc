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

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      console.log('TCC_DEBUG: AuthService.login called with:', { email: credentials.email, password: credentials.password ? '***' : 'missing' });
      const { email, password } = credentials;

      // Get user from Center database
      const centerDB = databaseManager.getCenterDB();
      const user = await centerDB.centerUser.findUnique({
        where: { email }
      });

      console.log('TCC_DEBUG: User found in database:', user ? { id: user.id, email: user.email, name: user.name, isActive: user.isActive } : 'null');

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

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          userType: user.userType
        },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType as 'ADMIN' | 'USER'
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
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
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
        const user = await emsDB.eMSUser.findUnique({
          where: { id: decoded.id }
        });

        if (!user || !user.isActive) {
          return null;
        }

        return {
          id: user.id,
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