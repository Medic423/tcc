import { PrismaClient } from '@prisma/client';

class DatabaseManager {
  private static instance: DatabaseManager;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  // Backward compatibility methods for existing service calls
  public getCenterDB(): PrismaClient {
    return this.prisma;
  }

  public getEMSDB(): PrismaClient {
    return this.prisma;
  }

  public getHospitalDB(): PrismaClient {
    return this.prisma;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const databaseManager = DatabaseManager.getInstance();
export default databaseManager;
