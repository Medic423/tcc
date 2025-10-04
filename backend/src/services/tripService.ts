import { databaseManager } from './databaseManager';
import emailService from './emailService';
import { PatientIdService, DIAGNOSIS_OPTIONS, MOBILITY_OPTIONS, TRANSPORT_LEVEL_OPTIONS, URGENCY_OPTIONS } from './patientIdService';
import { DistanceService } from './distanceService';

const prisma = databaseManager.getCenterDB();

export interface CreateTripRequest {
  // Legacy fields (keeping for backward compatibility)
  patientId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: 'BLS' | 'ALS' | 'CCT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  specialNeeds?: string;
  readyStart: string; // ISO string
  readyEnd: string; // ISO string
  isolation: boolean;
  bariatric: boolean;
  createdById: string | null;
}

export interface UpdateTripStatusRequest {
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedAgencyId?: string;
  assignedUnitId?: string;
  acceptedTimestamp?: string;
  pickupTimestamp?: string;
  completionTimestamp?: string;
}

export interface EnhancedCreateTripRequest {
  patientId?: string;
  patientWeight?: string;
  specialNeeds?: string;
  insuranceCompany?: string;
  fromLocation: string;
  pickupLocationId?: string;
  toLocation: string;
  scheduledTime: string; // ISO string
  transportLevel: 'BLS' | 'ALS' | 'CCT' | 'Other';
  urgencyLevel: 'Routine' | 'Urgent' | 'Emergent';
  diagnosis?: string;
  mobilityLevel?: 'Ambulatory' | 'Wheelchair' | 'Stretcher' | 'Bed';
  oxygenRequired?: boolean;
  monitoringRequired?: boolean;
  generateQRCode?: boolean;
  selectedAgencies?: string[];
  notificationRadius?: number;
  notes?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class TripService {
  /**
   * Create a new transport request
   */
  async createTrip(data: CreateTripRequest) {
    console.log('TCC_DEBUG: Creating trip with data:', data);
    
    try {
      const tripNumber = `TRP-${Date.now()}`;
      
      const tripData = {
        tripNumber,
        patientId: data.patientId,
        patientWeight: null,
        specialNeeds: data.specialNeeds || null,
        originFacilityId: data.originFacilityId,
        destinationFacilityId: data.destinationFacilityId,
        fromLocation: null,
        toLocation: null,
        scheduledTime: new Date(data.readyStart),
        transportLevel: data.transportLevel,
        urgencyLevel: null,
        priority: data.priority,
        status: 'PENDING',
        specialRequirements: data.specialNeeds || null,
        diagnosis: null,
        mobilityLevel: null,
        oxygenRequired: false,
        monitoringRequired: false,
        generateQRCode: false,
        qrCodeData: null,
        selectedAgencies: [],
        notificationRadius: null,
        requestTimestamp: new Date(),
        acceptedTimestamp: null,
        pickupTimestamp: null,
        pickupLocationId: null,
        notes: null,
        isolation: data.isolation || false,
        bariatric: data.bariatric || false,
      };

      const trip = await prisma.transportRequest.create({
        data: tripData
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
        // Handle comma-separated status values (e.g., "ACCEPTED,IN_PROGRESS,COMPLETED")
        if (filters.status.includes(',')) {
          const statuses = filters.status.split(',').map(s => s.trim());
          where.status = {
            in: statuses
          };
        } else {
          where.status = filters.status;
        }
      }
      if (filters?.transportLevel) {
        where.transportLevel = filters.transportLevel;
      }
      if (filters?.priority) {
        where.priority = filters.priority;
      }
      // Note: assignedAgencyId doesn't exist in TransportRequest model, so we'll skip this filter for now

      const trips = await prisma.transportRequest.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          originFacility: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          destinationFacility: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
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
      const trip = await prisma.transportRequest.findUnique({
        where: { id },
        include: {
          originFacility: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          destinationFacility: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      if (!trip) {
        return { success: false, error: 'Transport request not found' };
      }

      console.log('TCC_DEBUG: Trip found:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting trip by ID:', error);
      return { success: false, error: 'Failed to fetch transport request' };
    }
  }

  /**
   * Update trip status
   */
  async updateTripStatus(id: string, data: UpdateTripStatusRequest) {
    console.log('TCC_DEBUG: Updating trip status:', { id, data });
    
    try {
      const updateData: any = {
        status: data.status,
        updatedAt: new Date()
      };

      if (data.status === 'COMPLETED' && data.completionTimestamp) {
        updateData.pickupTimestamp = new Date(data.completionTimestamp);
      }

      const trip = await prisma.transportRequest.update({
        where: { id },
        data: updateData
      });

      console.log('TCC_DEBUG: Trip status updated successfully:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error updating trip status:', error);
      return { success: false, error: 'Failed to update transport request status' };
    }
  }

  /**
   * Get agencies for a specific hospital (simplified version)
   */
  async getAgenciesForHospital(hospitalId: string) {
    console.log('TCC_DEBUG: getAgenciesForHospital called with hospitalId:', hospitalId);
    
    try {
      // For now, return a simple list of agencies
      // This can be expanded later to actually query agencies based on hospital location
      const agencies = await prisma.eMSAgency.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          state: true
        }
      });

      console.log('TCC_DEBUG: Found agencies:', agencies.length);
      return { success: true, data: agencies };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting agencies for hospital:', error);
      return { success: false, error: 'Failed to get agencies for hospital' };
    }
  }

  /**
   * Create an enhanced transport request
   */
  async createEnhancedTrip(data: EnhancedCreateTripRequest) {
    console.log('TCC_DEBUG: Creating enhanced trip with data:', data);
    
    try {
      const tripNumber = `TRP-${Date.now()}`;
      
      const tripData = {
        tripNumber,
        patientId: data.patientId || 'PAT-UNKNOWN',
        patientWeight: data.patientWeight || null,
        specialNeeds: data.specialNeeds || null,
        originFacilityId: null, // Not used in enhanced version
        destinationFacilityId: null, // Not used in enhanced version
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        scheduledTime: new Date(data.scheduledTime),
        transportLevel: data.transportLevel,
        urgencyLevel: data.urgencyLevel,
        priority: data.priority || 'MEDIUM',
        status: 'PENDING',
        specialRequirements: data.specialNeeds || null,
        diagnosis: data.diagnosis || null,
        mobilityLevel: data.mobilityLevel || null,
        oxygenRequired: data.oxygenRequired || false,
        monitoringRequired: data.monitoringRequired || false,
        generateQRCode: data.generateQRCode || false,
        qrCodeData: null,
        selectedAgencies: data.selectedAgencies || [],
        notificationRadius: data.notificationRadius || null,
        requestTimestamp: new Date(),
        acceptedTimestamp: null,
        pickupTimestamp: null,
        pickupLocationId: data.pickupLocationId || null,
        notes: data.notes || null,
        isolation: false,
        bariatric: false,
      };

      const trip = await prisma.transportRequest.create({
        data: tripData
      });

      console.log('TCC_DEBUG: Enhanced trip created successfully:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error creating enhanced trip:', error);
      return { success: false, error: 'Failed to create enhanced transport request' };
    }
  }

  /**
   * Get trip history with filtering
   */
  async getTripHistory(filters: {
    status?: string;
    agencyId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit: number;
    offset: number;
    search?: string;
  }) {
    console.log('TCC_DEBUG: Getting trip history with filters:', filters);
    
    try {
      const where: any = {};
      
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.dateFrom) {
        where.createdAt = { gte: new Date(filters.dateFrom) };
      }
      if (filters.dateTo) {
        where.createdAt = { 
          ...where.createdAt,
          lte: new Date(filters.dateTo) 
        };
      }
      if (filters.search) {
        where.OR = [
          { tripNumber: { contains: filters.search } },
          { patientId: { contains: filters.search } },
          { fromLocation: { contains: filters.search } },
          { toLocation: { contains: filters.search } }
        ];
      }

      const trips = await prisma.transportRequest.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: filters.limit,
        skip: filters.offset,
      });

      console.log('TCC_DEBUG: Found trip history:', trips.length);
      return { success: true, data: trips };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting trip history:', error);
      return { success: false, error: 'Failed to fetch trip history' };
    }
  }

  /**
   * Get available agencies
   */
  async getAvailableAgencies() {
    console.log('TCC_DEBUG: Getting available agencies');
    
    try {
      const agencies = await prisma.eMSAgency.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          state: true,
          capabilities: true,
          serviceArea: true
        }
      });

      console.log('TCC_DEBUG: Found available agencies:', agencies.length);
      return { success: true, data: agencies };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting available agencies:', error);
      return { success: false, error: 'Failed to get available agencies' };
    }
  }

  /**
   * Get notification settings for a user
   */
  async getNotificationSettings(userId: string) {
    console.log('TCC_DEBUG: Getting notification settings for user:', userId);
    
    // For now, return default settings
    // This can be expanded to actually store/retrieve user preferences
    return {
      emailNotifications: true,
      smsNotifications: true,
      newTripAlerts: true,
      statusUpdates: true,
      emailAddress: null,
      phoneNumber: null
    };
  }

  /**
   * Update notification settings for a user
   */
  async updateNotificationSettings(userId: string, settings: any) {
    console.log('TCC_DEBUG: Updating notification settings for user:', userId, settings);
    
    // For now, just return success
    // This can be expanded to actually store user preferences
    return { success: true, data: settings, error: null };
  }

  /**
   * Update trip times
   */
  async updateTripTimes(id: string, times: {
    transferAcceptedTime?: string;
    emsArrivalTime?: string;
    emsDepartureTime?: string;
  }) {
    console.log('TCC_DEBUG: Updating trip times:', { id, times });
    
    try {
      const updateData: any = {};
      
      if (times.transferAcceptedTime) {
        updateData.acceptedTimestamp = new Date(times.transferAcceptedTime);
      }
      if (times.emsArrivalTime) {
        updateData.pickupTimestamp = new Date(times.emsArrivalTime);
      }
      if (times.emsDepartureTime) {
        updateData.completionTimestamp = new Date(times.emsDepartureTime);
      }

      const trip = await prisma.transportRequest.update({
        where: { id },
        data: updateData
      });

      console.log('TCC_DEBUG: Trip times updated successfully:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error updating trip times:', error);
      return { success: false, error: 'Failed to update trip times' };
    }
  }

  /**
   * Get diagnosis options
   */
  getDiagnosisOptions() {
    return { success: true, data: DIAGNOSIS_OPTIONS };
  }

  /**
   * Get mobility options
   */
  getMobilityOptions() {
    return { success: true, data: MOBILITY_OPTIONS };
  }

  /**
   * Get transport level options
   */
  getTransportLevelOptions() {
    return { success: true, data: TRANSPORT_LEVEL_OPTIONS };
  }

  /**
   * Get urgency options
   */
  getUrgencyOptions() {
    return { success: true, data: URGENCY_OPTIONS };
  }

  /**
   * Get insurance options
   */
  async getInsuranceOptions() {
    console.log('TCC_DEBUG: Getting insurance options');
    
    // For now, return a simple list
    // This can be expanded to query from a database table
    const options = [
      'Medicare',
      'Medicaid',
      'Blue Cross Blue Shield',
      'Aetna',
      'Cigna',
      'UnitedHealth',
      'Self-Pay',
      'Other'
    ];

    return { success: true, data: options };
  }

  /**
   * Create trip with responses
   */
  async createTripWithResponses(data: any) {
    console.log('TCC_DEBUG: Creating trip with responses:', data);
    
    // For now, just create a regular trip
    // This can be expanded to handle response-specific logic
    return await this.createEnhancedTrip(data);
  }

  /**
   * Update trip response fields
   */
  async updateTripResponseFields(id: string, data: any) {
    console.log('TCC_DEBUG: Updating trip response fields:', { id, data });
    
    try {
      const trip = await prisma.transportRequest.update({
        where: { id },
        data: {
          updatedAt: new Date()
        }
      });

      console.log('TCC_DEBUG: Trip response fields updated successfully:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error updating trip response fields:', error);
      return { success: false, error: 'Failed to update trip response fields' };
    }
  }

  /**
   * Get trip with responses
   */
  async getTripWithResponses(id: string) {
    console.log('TCC_DEBUG: Getting trip with responses:', id);
    
    try {
      const trip = await prisma.transportRequest.findUnique({
        where: { id }
      });

      if (!trip) {
        return { success: false, error: 'Trip not found' };
      }

      // For now, return the trip without responses
      // This can be expanded to include agency responses
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting trip with responses:', error);
      return { success: false, error: 'Failed to get trip with responses' };
    }
  }

  /**
   * Get trip response summary
   */
  async getTripResponseSummary(id: string) {
    console.log('TCC_DEBUG: Getting trip response summary:', id);
    
    // For now, return a simple summary
    // This can be expanded to calculate actual response statistics
    return {
      success: true,
      data: {
        totalResponses: 0,
        acceptedResponses: 0,
        declinedResponses: 0,
        pendingResponses: 0
      },
      error: null
    };
  }

  /**
   * Create agency response
   */
  async createAgencyResponse(data: any) {
    console.log('TCC_DEBUG: Creating agency response:', data);
    
    // For now, return a simple success response
    // This can be expanded to actually store agency responses
    return { success: true, data: { id: 'temp-response-id', ...data }, error: null };
  }

  /**
   * Update agency response
   */
  async updateAgencyResponse(id: string, data: any) {
    console.log('TCC_DEBUG: Updating agency response:', { id, data });
    
    // For now, return a simple success response
    // This can be expanded to actually update agency responses
    return { success: true, data: { id, ...data }, error: null };
  }

  /**
   * Get agency responses
   */
  async getAgencyResponses(filters: any) {
    console.log('TCC_DEBUG: Getting agency responses with filters:', filters);
    
    // For now, return an empty array
    // This can be expanded to actually query agency responses
    return { success: true, data: [], error: null };
  }

  /**
   * Get agency response by ID
   */
  async getAgencyResponseById(id: string) {
    console.log('TCC_DEBUG: Getting agency response by ID:', id);
    
    // For now, return a simple response
    // This can be expanded to actually query agency responses
    return { success: true, data: { id, response: 'PENDING' }, error: null };
  }

  /**
   * Select agency for trip
   */
  async selectAgencyForTrip(tripId: string, data: any) {
    console.log('TCC_DEBUG: Selecting agency for trip:', { tripId, data });
    
    // For now, return a simple success response
    // This can be expanded to actually update trip assignment
    return { success: true, data: { tripId, agencyResponseId: data.agencyResponseId }, error: null };
  }
}

export const tripService = new TripService();