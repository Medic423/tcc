import { PrismaClient as CenterPrismaClient } from '@prisma/client';
import { PrismaClient as HospitalPrismaClient } from '@prisma/hospital';
import { PrismaClient as EMSPrismaClient } from '@prisma/ems';

class DatabaseManager {
  private static instance: DatabaseManager;
  private prisma: CenterPrismaClient;
  private emsPrisma: EMSPrismaClient;
  private hospitalPrisma: HospitalPrismaClient;
  private connectionRetries = 0;
  private maxRetries = 5;
  private retryDelay = 2000; // 2 seconds

  private constructor() {
    this.prisma = new CenterPrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_CENTER
        }
      },
      // Add connection configuration for Render PostgreSQL
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
      errorFormat: 'pretty',
    });

    this.emsPrisma = new EMSPrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_EMS
        }
      },
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
      errorFormat: 'pretty',
    });

    this.hospitalPrisma = new HospitalPrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_HOSPITAL
        }
      },
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
      errorFormat: 'pretty',
    });

  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getPrismaClient(): CenterPrismaClient {
    return this.prisma;
  }

  // Backward compatibility methods for existing service calls
  public getCenterDB(): CenterPrismaClient {
    return this.prisma;
  }

  public getEMSDB(): any {
    return this.emsPrisma as any;
  }

  public getHospitalDB(): any {
    return this.hospitalPrisma as any;
  }

  public async healthCheck(): Promise<boolean> {
    return await this.executeWithRetry(async () => {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    });
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      const result = await operation();
      this.connectionRetries = 0; // Reset retry counter on success
      return result;
    } catch (error) {
      console.error(`Database operation failed (attempt ${this.connectionRetries + 1}/${this.maxRetries}):`, error);
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        console.log(`Retrying in ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay);
        
        // Exponential backoff
        this.retryDelay = Math.min(this.retryDelay * 1.5, 10000);
        
        return await this.executeWithRetry(operation);
      } else {
        console.error('Max retries reached, giving up');
        throw error;
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const databaseManager = DatabaseManager.getInstance();
export default databaseManager;
