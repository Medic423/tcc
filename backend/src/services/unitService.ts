import { PrismaClient as EMSPrismaClient } from '@prisma/ems';

// Types for unit management
export interface Unit {
  id: string;
  agencyId: string;
  unitNumber: string;
  type: string;
  capabilities: string[];
  currentStatus: string;
  currentLocation?: any;
  isActive: boolean;
  assignedTripId?: string;
  lastStatusUpdate: Date;
  statusHistory?: any[];
  currentTripDetails?: any;
  lastKnownLocation?: any;
  locationUpdatedAt?: Date;
  totalTripsCompleted: number;
  averageResponseTime?: number;
  lastMaintenanceDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitFormData {
  unitNumber: string;
  type: string;
  capabilities: string[];
  customCapabilities?: string[];
  isActive: boolean;
}

export interface UnitStatusUpdate {
  status: string;
  reason?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface UnitAnalytics {
  totalUnits: number;
  availableUnits: number;
  committedUnits: number;
  outOfServiceUnits: number;
  maintenanceUnits: number;
  offDutyUnits: number;
  averageResponseTime: number;
  totalTripsToday: number;
  efficiency: number;
}

export class UnitService {
  private prisma: EMSPrismaClient;

  constructor() {
    this.prisma = new EMSPrismaClient();
  }

  /**
   * Get all units for an agency
   */
  async getUnitsByAgency(agencyId: string): Promise<Unit[]> {
    try {
      const units = await this.prisma.unit.findMany({
        where: {
          agencyId: agencyId,
          isActive: true
        },
        orderBy: {
          unitNumber: 'asc'
        }
      });

      return units.map(unit => this.mapPrismaUnitToUnit(unit));
    } catch (error) {
      console.error('Error getting units by agency:', error);
      throw new Error('Failed to retrieve units');
    }
  }

  /**
   * Get a single unit by ID
   */
  async getUnitById(unitId: string): Promise<Unit | null> {
    try {
      const unit = await this.prisma.unit.findUnique({
        where: { id: unitId }
      });

      return unit ? this.mapPrismaUnitToUnit(unit) : null;
    } catch (error) {
      console.error('Error getting unit by ID:', error);
      throw new Error('Failed to retrieve unit');
    }
  }

  /**
   * Create a new unit
   */
  async createUnit(agencyId: string, unitData: UnitFormData): Promise<Unit> {
    try {
      // Validate unit number uniqueness within agency
      const existingUnit = await this.prisma.unit.findFirst({
        where: {
          agencyId: agencyId,
          unitNumber: unitData.unitNumber,
          isActive: true
        }
      });

      if (existingUnit) {
        throw new Error(`Unit number ${unitData.unitNumber} already exists for this agency`);
      }

      const unit = await this.prisma.unit.create({
        data: {
          agencyId: agencyId,
          unitNumber: unitData.unitNumber,
          type: unitData.type,
          capabilities: unitData.capabilities,
          currentStatus: 'AVAILABLE',
          isActive: unitData.isActive,
          lastStatusUpdate: new Date(),
          statusHistory: [{
            status: 'AVAILABLE',
            timestamp: new Date(),
            reason: 'Unit created'
          }],
          totalTripsCompleted: 0
        }
      });

      return this.mapPrismaUnitToUnit(unit);
    } catch (error) {
      console.error('Error creating unit:', error);
      throw error;
    }
  }

  /**
   * Update unit details
   */
  async updateUnit(unitId: string, unitData: Partial<UnitFormData>): Promise<Unit> {
    try {
      const updateData: any = {};

      if (unitData.unitNumber) updateData.unitNumber = unitData.unitNumber;
      if (unitData.type) updateData.type = unitData.type;
      if (unitData.capabilities) updateData.capabilities = unitData.capabilities;
      if (unitData.isActive !== undefined) updateData.isActive = unitData.isActive;

      const unit = await this.prisma.unit.update({
        where: { id: unitId },
        data: updateData
      });

      return this.mapPrismaUnitToUnit(unit);
    } catch (error) {
      console.error('Error updating unit:', error);
      throw new Error('Failed to update unit');
    }
  }

  /**
   * Update unit status
   */
  async updateUnitStatus(unitId: string, statusUpdate: UnitStatusUpdate): Promise<Unit> {
    try {
      const unit = await this.prisma.unit.findUnique({
        where: { id: unitId }
      });

      if (!unit) {
        throw new Error('Unit not found');
      }

      // Add to status history
      const statusHistory = unit.statusHistory as any[] || [];
      statusHistory.push({
        status: statusUpdate.status,
        timestamp: new Date(),
        reason: statusUpdate.reason || 'Status updated'
      });

      const updateData: any = {
        currentStatus: statusUpdate.status,
        lastStatusUpdate: new Date(),
        statusHistory: statusHistory
      };

      // Update location if provided
      if (statusUpdate.location) {
        updateData.lastKnownLocation = statusUpdate.location;
        updateData.locationUpdatedAt = new Date();
      }

      // Clear trip assignment if status is not COMMITTED
      if (statusUpdate.status !== 'COMMITTED') {
        updateData.assignedTripId = null;
        updateData.currentTripDetails = undefined;
      }

      const updatedUnit = await this.prisma.unit.update({
        where: { id: unitId },
        data: updateData
      });

      return this.mapPrismaUnitToUnit(updatedUnit);
    } catch (error) {
      console.error('Error updating unit status:', error);
      throw new Error('Failed to update unit status');
    }
  }

  /**
   * Assign trip to unit
   */
  async assignTripToUnit(unitId: string, tripId: string, tripDetails: any): Promise<Unit> {
    try {
      const unit = await this.prisma.unit.findUnique({
        where: { id: unitId }
      });

      if (!unit) {
        throw new Error('Unit not found');
      }

      if (unit.currentStatus !== 'AVAILABLE') {
        throw new Error('Unit is not available for assignment');
      }

      // Add to status history
      const statusHistory = unit.statusHistory as any[] || [];
      statusHistory.push({
        status: 'COMMITTED',
        timestamp: new Date(),
        reason: `Assigned to trip ${tripId}`
      });

      const updatedUnit = await this.prisma.unit.update({
        where: { id: unitId },
        data: {
          currentStatus: 'COMMITTED',
          assignedTripId: tripId,
          currentTripDetails: tripDetails,
          lastStatusUpdate: new Date(),
          statusHistory: statusHistory
        }
      });

      return this.mapPrismaUnitToUnit(updatedUnit);
    } catch (error) {
      console.error('Error assigning trip to unit:', error);
      throw new Error('Failed to assign trip to unit');
    }
  }

  /**
   * Complete trip assignment
   */
  async completeTripAssignment(unitId: string): Promise<Unit> {
    try {
      const unit = await this.prisma.unit.findUnique({
        where: { id: unitId }
      });

      if (!unit) {
        throw new Error('Unit not found');
      }

      // Add to status history
      const statusHistory = unit.statusHistory as any[] || [];
      statusHistory.push({
        status: 'AVAILABLE',
        timestamp: new Date(),
        reason: 'Trip completed'
      });

      const updatedUnit = await this.prisma.unit.update({
        where: { id: unitId },
        data: {
          currentStatus: 'AVAILABLE',
          assignedTripId: null,
          currentTripDetails: undefined,
          lastStatusUpdate: new Date(),
          statusHistory: statusHistory,
          totalTripsCompleted: (unit.totalTripsCompleted || 0) + 1
        }
      });

      return this.mapPrismaUnitToUnit(updatedUnit);
    } catch (error) {
      console.error('Error completing trip assignment:', error);
      throw new Error('Failed to complete trip assignment');
    }
  }

  /**
   * Deactivate unit (soft delete)
   */
  async deactivateUnit(unitId: string): Promise<Unit> {
    try {
      const unit = await this.prisma.unit.update({
        where: { id: unitId },
        data: {
          isActive: false,
          currentStatus: 'OUT_OF_SERVICE',
          lastStatusUpdate: new Date()
        }
      });

      return this.mapPrismaUnitToUnit(unit);
    } catch (error) {
      console.error('Error deactivating unit:', error);
      throw new Error('Failed to deactivate unit');
    }
  }

  /**
   * Get unit analytics for an agency
   */
  async getUnitAnalytics(agencyId: string): Promise<UnitAnalytics> {
    try {
      const units = await this.prisma.unit.findMany({
        where: {
          agencyId: agencyId,
          isActive: true
        }
      });

      const totalUnits = units.length;
      const availableUnits = units.filter(u => u.currentStatus === 'AVAILABLE').length;
      const committedUnits = units.filter(u => u.currentStatus === 'COMMITTED').length;
      const outOfServiceUnits = units.filter(u => u.currentStatus === 'OUT_OF_SERVICE').length;
      const maintenanceUnits = units.filter(u => u.currentStatus === 'MAINTENANCE').length;
      const offDutyUnits = units.filter(u => u.currentStatus === 'OFF_DUTY').length;

      const totalTripsToday = units.reduce((sum, unit) => sum + (unit.totalTripsCompleted || 0), 0);
      
      const averageResponseTime = units.length > 0 
        ? units.reduce((sum, unit) => sum + (unit.averageResponseTime || 0), 0) / units.length 
        : 0;

      const efficiency = totalUnits > 0 ? (availableUnits + committedUnits) / totalUnits : 0;

      return {
        totalUnits,
        availableUnits,
        committedUnits,
        outOfServiceUnits,
        maintenanceUnits,
        offDutyUnits,
        averageResponseTime,
        totalTripsToday,
        efficiency: Math.round(efficiency * 100) / 100
      };
    } catch (error) {
      console.error('Error getting unit analytics:', error);
      throw new Error('Failed to retrieve unit analytics');
    }
  }

  /**
   * Get available units for optimization
   */
  async getAvailableUnits(agencyId: string): Promise<Unit[]> {
    try {
      const units = await this.prisma.unit.findMany({
        where: {
          agencyId: agencyId,
          isActive: true,
          currentStatus: 'AVAILABLE'
        },
        orderBy: {
          unitNumber: 'asc'
        }
      });

      return units.map(unit => this.mapPrismaUnitToUnit(unit));
    } catch (error) {
      console.error('Error getting available units:', error);
      throw new Error('Failed to retrieve available units');
    }
  }

  /**
   * Map Prisma unit to Unit interface
   */
  private mapPrismaUnitToUnit(prismaUnit: any): Unit {
    return {
      id: prismaUnit.id,
      agencyId: prismaUnit.agencyId,
      unitNumber: prismaUnit.unitNumber,
      type: prismaUnit.type,
      capabilities: prismaUnit.capabilities || [],
      currentStatus: prismaUnit.currentStatus,
      currentLocation: prismaUnit.currentLocation,
      isActive: prismaUnit.isActive,
      assignedTripId: prismaUnit.assignedTripId,
      lastStatusUpdate: prismaUnit.lastStatusUpdate,
      statusHistory: prismaUnit.statusHistory || [],
      currentTripDetails: prismaUnit.currentTripDetails,
      lastKnownLocation: prismaUnit.lastKnownLocation,
      locationUpdatedAt: prismaUnit.locationUpdatedAt,
      totalTripsCompleted: prismaUnit.totalTripsCompleted || 0,
      averageResponseTime: prismaUnit.averageResponseTime,
      lastMaintenanceDate: prismaUnit.lastMaintenanceDate,
      createdAt: prismaUnit.createdAt,
      updatedAt: prismaUnit.updatedAt
    };
  }
}
