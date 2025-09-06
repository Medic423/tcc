import { PrismaClient as HospitalPrismaClient } from '@prisma/hospital';
import { PrismaClient as EMSPrisaClient } from '@prisma/ems';

const hospitalPrisma = new HospitalPrismaClient();
const emsPrisma = new EMSPrisaClient();

export interface CreateTripRequest {
  patientId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: 'BLS' | 'ALS' | 'CCT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  specialRequirements?: string;
  readyStart: string; // ISO string
  readyEnd: string; // ISO string
  isolation: boolean;
  bariatric: boolean;
  createdById: string | null;
}

export interface UpdateTripStatusRequest {
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedAgencyId?: string;
  assignedUnitId?: string;
  acceptedTimestamp?: string;
  pickupTimestamp?: string;
  completionTimestamp?: string;
}

export class TripService {
  /**
   * Create a new transport request
   */
  async createTrip(data: CreateTripRequest) {
    console.log('TCC_DEBUG: Creating trip with data:', data);
    
    try {
      const trip = await hospitalPrisma.transportRequest.create({
        data: {
          patientId: data.patientId,
          originFacilityId: data.originFacilityId,
          destinationFacilityId: data.destinationFacilityId,
          transportLevel: data.transportLevel,
          priority: data.priority,
          specialRequirements: data.specialRequirements,
          readyStart: new Date(data.readyStart),
          readyEnd: new Date(data.readyEnd),
          isolation: data.isolation,
          bariatric: data.bariatric,
          createdById: data.createdById || null,
        },
        include: {
          originFacility: true,
          destinationFacility: true,
          createdBy: true,
        },
      });

      console.log('TCC_DEBUG: Trip created successfully:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error creating trip:', error);
      return { success: false, error: 'Failed to create transport request' };
    }
  }

  /**
   * Get all transport requests with optional filtering
   */
  async getTrips(filters?: {
    status?: string;
    transportLevel?: string;
    priority?: string;
    agencyId?: string;
  }) {
    console.log('TCC_DEBUG: Getting trips with filters:', filters);
    
    try {
      const where: any = {};
      
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.transportLevel) {
        where.transportLevel = filters.transportLevel;
      }
      if (filters?.priority) {
        where.priority = filters.priority;
      }
      if (filters?.agencyId) {
        where.assignedAgencyId = filters.agencyId;
      }

      const trips = await hospitalPrisma.transportRequest.findMany({
        where,
        include: {
          originFacility: true,
          destinationFacility: true,
          createdBy: true,
        },
        orderBy: {
          requestTimestamp: 'desc',
        },
      });

      console.log('TCC_DEBUG: Found trips:', trips.length);
      return { success: true, data: trips };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting trips:', error);
      return { success: false, error: 'Failed to fetch transport requests' };
    }
  }

  /**
   * Get a single transport request by ID
   */
  async getTripById(id: string) {
    console.log('TCC_DEBUG: Getting trip by ID:', id);
    
    try {
      const trip = await hospitalPrisma.transportRequest.findUnique({
        where: { id },
        include: {
          originFacility: true,
          destinationFacility: true,
          createdBy: true,
        },
      });

      if (!trip) {
        return { success: false, error: 'Transport request not found' };
      }

      console.log('TCC_DEBUG: Trip found:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting trip:', error);
      return { success: false, error: 'Failed to fetch transport request' };
    }
  }

  /**
   * Update trip status (accept/decline/complete)
   */
  async updateTripStatus(id: string, data: UpdateTripStatusRequest) {
    console.log('TCC_DEBUG: Updating trip status:', { id, data });
    
    try {
      const updateData: any = {
        status: data.status,
      };

      if (data.assignedAgencyId) {
        updateData.assignedAgencyId = data.assignedAgencyId;
      }
      if (data.assignedUnitId) {
        updateData.assignedUnitId = data.assignedUnitId;
      }
      if (data.acceptedTimestamp) {
        updateData.acceptedTimestamp = new Date(data.acceptedTimestamp);
      }
      if (data.pickupTimestamp) {
        updateData.pickupTimestamp = new Date(data.pickupTimestamp);
      }
      if (data.completionTimestamp) {
        updateData.completionTimestamp = new Date(data.completionTimestamp);
      }

      const trip = await hospitalPrisma.transportRequest.update({
        where: { id },
        data: updateData,
        include: {
          originFacility: true,
          destinationFacility: true,
          createdBy: true,
        },
      });

      console.log('TCC_DEBUG: Trip status updated:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error updating trip status:', error);
      return { success: false, error: 'Failed to update transport request' };
    }
  }

  /**
   * Get available EMS agencies for assignment
   */
  async getAvailableAgencies() {
    console.log('TCC_DEBUG: Getting available EMS agencies');
    
    try {
      const agencies = await emsPrisma.eMSAgency.findMany({
        where: {
          isActive: true,
          status: 'ACTIVE',
        },
        include: {
          units: {
            where: {
              isActive: true,
              currentStatus: 'AVAILABLE',
            },
          },
        },
      });

      console.log('TCC_DEBUG: Found agencies:', agencies.length);
      return { success: true, data: agencies };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting agencies:', error);
      return { success: false, error: 'Failed to fetch EMS agencies' };
    }
  }
}

export const tripService = new TripService();
