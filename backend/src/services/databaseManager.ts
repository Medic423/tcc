// Prisma clients will be generated after running npm run db:generate
// For now, we'll use any type to avoid compilation errors
type PrismaClient = any;

class DatabaseManager {
  private static instance: DatabaseManager;
  private hospitalDB: PrismaClient;
  private emsDB: PrismaClient;
  private centerDB: PrismaClient;

  private constructor() {
    // Prisma clients will be properly initialized after generation
    // For now, we'll use placeholder objects
    this.hospitalDB = {} as PrismaClient;
    this.emsDB = {} as PrismaClient;
    this.centerDB = {} as PrismaClient;
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getHospitalDB(): PrismaClient {
    return this.hospitalDB;
  }

  public getEMSDB(): PrismaClient {
    return this.emsDB;
  }

  public getCenterDB(): PrismaClient {
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
