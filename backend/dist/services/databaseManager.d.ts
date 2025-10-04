import { PrismaClient as CenterPrismaClient } from '@prisma/client';
declare class DatabaseManager {
    private static instance;
    private prisma;
    private emsPrisma;
    private hospitalPrisma;
    private connectionRetries;
    private maxRetries;
    private retryDelay;
    private constructor();
    static getInstance(): DatabaseManager;
    getPrismaClient(): CenterPrismaClient;
    getCenterDB(): CenterPrismaClient;
    getEMSDB(): any;
    getHospitalDB(): any;
    healthCheck(): Promise<boolean>;
    private executeWithRetry;
    private delay;
    disconnect(): Promise<void>;
}
export declare const databaseManager: DatabaseManager;
export default databaseManager;
//# sourceMappingURL=databaseManager.d.ts.map