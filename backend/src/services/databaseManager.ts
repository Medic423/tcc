import { PrismaClient as CenterPrismaClient } from '@prisma/client';
import { PrismaClient as HospitalPrismaClient } from '@prisma/hospital';
import { PrismaClient as EMSPrismaClient } from '@prisma/ems';

class DatabaseManager {
  private static instance: DatabaseManager;
  private hospitalDB: HospitalPrismaClient;
  private emsDB: EMSPrismaClient;
  private centerDB: CenterPrismaClient;

  private constructor() {
    this.hospitalDB = new HospitalPrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_HOSPITAL
        }
      }
    });

    this.emsDB = new EMSPrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_EMS
        }
      }
    });

    this.centerDB = new CenterPrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_CENTER
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

  public getHospitalDB(): HospitalPrismaClient {
    return this.hospitalDB;
  }

  public getEMSDB(): EMSPrismaClient {
    return this.emsDB;
  }

  public getCenterDB(): CenterPrismaClient {
    return this.centerDB;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await Promise.all([
        this.hospitalDB.$queryRaw`SELECT 1`,
        this.emsDB.$queryRaw`SELECT 1`,
        this.centerDB.$queryRaw`SELECT 1`
      ]);
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    await Promise.all([
      this.hospitalDB.$disconnect(),
      this.emsDB.$disconnect(),
      this.centerDB.$disconnect()
    ]);
  }
}

export const databaseManager = DatabaseManager.getInstance();
export default databaseManager;
