import { PrismaClient } from '@prisma/client';
import { productionDatabaseManager } from './productionDatabaseManager';

const prisma = productionDatabaseManager.getDatabase();

export interface Unit {
  id: string;
  agencyId: string;
  unitNumber: string;
  type: string;
  capabilities: string[];
  currentStatus: string;
  currentLocation?: string;
  shiftStart?: string;
  shiftEnd?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUnitData {
  unitNumber: string;
  type: string;
  capabilities: string[];
  currentStatus: string;
  currentLocation?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface UpdateUnitData {
  unitNumber?: string;
  type?: string;
  capabilities?: string[];
  currentStatus?: string;
  currentLocation?: string;
  shiftStart?: string;
  shiftEnd?: string;
  isActive?: boolean;
}

export class ProductionUnitService {
  async getUnitsByAgency(agencyId: string): Promise<Unit[]> {
    try {
      const units = await prisma.unit.findMany({
        where: {
          agencyId: agencyId,
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return units.map(unit => ({
        id: unit.id,
        agencyId: unit.agencyId,
        unitNumber: unit.unitNumber,
        type: unit.type,
        capabilities: unit.capabilities || [],
        currentStatus: unit.currentStatus,
        currentLocation: unit.currentLocation || undefined,
        shiftStart: unit.shiftStart || undefined,
        shiftEnd: unit.shiftEnd || undefined,
        isActive: unit.isActive,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching units by agency:', error);
      throw new Error('Failed to fetch units');
    }
  }

  async getAllUnits(): Promise<Unit[]> {
    try {
      const units = await prisma.unit.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return units.map(unit => ({
        id: unit.id,
        agencyId: unit.agencyId,
        unitNumber: unit.unitNumber,
        type: unit.type,
        capabilities: unit.capabilities || [],
        currentStatus: unit.currentStatus,
        currentLocation: unit.currentLocation || undefined,
        shiftStart: unit.shiftStart || undefined,
        shiftEnd: unit.shiftEnd || undefined,
        isActive: unit.isActive,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching all units:', error);
      throw new Error('Failed to fetch units');
    }
  }

  async createUnit(agencyId: string, unitData: CreateUnitData): Promise<Unit> {
    try {
      const unit = await prisma.unit.create({
        data: {
          agencyId,
          ...unitData,
          isActive: true
        }
      });

      return {
        id: unit.id,
        agencyId: unit.agencyId,
        unitNumber: unit.unitNumber,
        type: unit.type,
        capabilities: unit.capabilities || [],
        currentStatus: unit.currentStatus,
        currentLocation: unit.currentLocation || undefined,
        shiftStart: unit.shiftStart || undefined,
        shiftEnd: unit.shiftEnd || undefined,
        isActive: unit.isActive,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      };
    } catch (error) {
      console.error('Error creating unit:', error);
      throw new Error('Failed to create unit');
    }
  }

  async updateUnit(unitId: string, unitData: UpdateUnitData): Promise<Unit> {
    try {
      const unit = await prisma.unit.update({
        where: { id: unitId },
        data: unitData
      });

      return {
        id: unit.id,
        agencyId: unit.agencyId,
        unitNumber: unit.unitNumber,
        type: unit.type,
        capabilities: unit.capabilities || [],
        currentStatus: unit.currentStatus,
        currentLocation: unit.currentLocation || undefined,
        shiftStart: unit.shiftStart || undefined,
        shiftEnd: unit.shiftEnd || undefined,
        isActive: unit.isActive,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      };
    } catch (error) {
      console.error('Error updating unit:', error);
      throw new Error('Failed to update unit');
    }
  }

  async deleteUnit(unitId: string): Promise<void> {
    try {
      await prisma.unit.update({
        where: { id: unitId },
        data: { isActive: false }
      });
    } catch (error) {
      console.error('Error deleting unit:', error);
      throw new Error('Failed to delete unit');
    }
  }

  async updateUnitStatus(unitId: string, status: string): Promise<Unit> {
    try {
      const unit = await prisma.unit.update({
        where: { id: unitId },
        data: { currentStatus: status }
      });

      return {
        id: unit.id,
        agencyId: unit.agencyId,
        unitNumber: unit.unitNumber,
        type: unit.type,
        capabilities: unit.capabilities || [],
        currentStatus: unit.currentStatus,
        currentLocation: unit.currentLocation || undefined,
        shiftStart: unit.shiftStart || undefined,
        shiftEnd: unit.shiftEnd || undefined,
        isActive: unit.isActive,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      };
    } catch (error) {
      console.error('Error updating unit status:', error);
      throw new Error('Failed to update unit status');
    }
  }

  async getUnitAnalytics(agencyId?: string): Promise<any> {
    try {
      const whereClause = agencyId ? { agencyId, isActive: true } : { isActive: true };
      
      const totalUnits = await prisma.unit.count({ where: whereClause });
      const availableUnits = await prisma.unit.count({ 
        where: { ...whereClause, currentStatus: 'Available' } 
      });
      const committedUnits = await prisma.unit.count({ 
        where: { ...whereClause, currentStatus: 'Committed' } 
      });
      const outOfServiceUnits = await prisma.unit.count({ 
        where: { ...whereClause, currentStatus: 'Out of Service' } 
      });
      const maintenanceUnits = await prisma.unit.count({ 
        where: { ...whereClause, currentStatus: 'Maintenance' } 
      });

      return {
        totalUnits,
        availableUnits,
        committedUnits,
        outOfServiceUnits,
        maintenanceUnits,
        availabilityRate: totalUnits > 0 ? (availableUnits / totalUnits) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching unit analytics:', error);
      throw new Error('Failed to fetch unit analytics');
    }
  }
}

export const productionUnitService = new ProductionUnitService();
