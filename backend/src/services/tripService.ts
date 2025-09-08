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

export interface EnhancedCreateTripRequest {
  // Patient Information (HIPAA Compliant)
  patientId?: string; // Auto-generated if not provided
  patientWeight?: string;
  specialNeeds?: string;
  
  // Trip Details
  fromLocation: string;
  toLocation: string;
  scheduledTime: string; // ISO string
  transportLevel: 'BLS' | 'ALS' | 'CCT' | 'Other';
  urgencyLevel: 'Routine' | 'Urgent' | 'Emergent';
  
  // Clinical Details
  diagnosis?: string; // From DIAGNOSIS_OPTIONS
  mobilityLevel?: 'Ambulatory' | 'Wheelchair' | 'Stretcher' | 'Bed';
  oxygenRequired?: boolean;
  monitoringRequired?: boolean;
  
  // QR Code
  generateQRCode?: boolean;
  
  // Agency Notifications
  selectedAgencies?: string[]; // Array of agency IDs
  notificationRadius?: number; // Distance radius in miles
  
  // Additional Notes
  notes?: string;
  
  // Legacy fields
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdById?: string | null;
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
   * Create a new enhanced transport request
   */
  async createEnhancedTrip(data: EnhancedCreateTripRequest) {
    console.log('TCC_DEBUG: Creating enhanced trip with data:', data);
    
    try {
      // Generate patient ID if not provided
      const patientId = data.patientId || PatientIdService.generatePatientId();
      const tripNumber = `TRP-${Date.now()}`;
      
      // Generate QR code data if requested
      let qrCodeData: string | null = null;
      if (data.generateQRCode) {
        qrCodeData = PatientIdService.generateQRCodeData(tripNumber, patientId);
      }
      
      // Map urgency level to priority for backward compatibility
      const priorityMap = {
        'Routine': 'LOW',
        'Urgent': 'MEDIUM', 
        'Emergent': 'HIGH'
      } as const;
      
      const priority = data.priority || priorityMap[data.urgencyLevel] || 'LOW';
      const scheduledTime = new Date(data.scheduledTime);
      const transferRequestTime = new Date();
      
      // Create trip data object for all databases
      const tripData = {
        tripNumber: tripNumber,
        patientId: patientId,
        patientWeight: data.patientWeight || null,
        specialNeeds: data.specialNeeds || null,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        scheduledTime: scheduledTime,
        transportLevel: data.transportLevel,
        urgencyLevel: data.urgencyLevel,
        diagnosis: data.diagnosis || null,
        mobilityLevel: data.mobilityLevel || null,
        oxygenRequired: data.oxygenRequired || false,
        monitoringRequired: data.monitoringRequired || false,
        generateQRCode: data.generateQRCode || false,
        qrCodeData: qrCodeData,
        selectedAgencies: data.selectedAgencies || [],
        notificationRadius: data.notificationRadius || 100,
        transferRequestTime: transferRequestTime,
        status: 'PENDING',
        priority: priority,
        notes: data.notes || null,
        assignedTo: null,
      };
      
      // Create trip in Center database
      const centerTrip = await prisma.trip.create({
        data: tripData,
      });
      
      console.log('TCC_DEBUG: Enhanced trip created in Center DB:', centerTrip);
      
      // Sync to EMS database
      try {
        const emsPrisma = databaseManager.getEMSDB();
        await emsPrisma.transportRequest.create({
          data: {
            ...tripData,
            // EMS-specific fields
            originFacilityId: null, // Will be populated from facility lookup
            destinationFacilityId: null, // Will be populated from facility lookup
            createdById: null, // Will be populated when EMS user accepts
          },
        });
        console.log('TCC_DEBUG: Trip synced to EMS database');
      } catch (emsError) {
        console.error('TCC_DEBUG: Error syncing to EMS database:', emsError);
        // Continue execution - Center DB is primary
      }
      
      // Sync to Hospital database
      try {
        const hospitalPrisma = databaseManager.getHospitalDB();
        await hospitalPrisma.transportRequest.create({
          data: {
            ...tripData,
            // Hospital-specific fields
            originFacilityId: null, // Will be populated from facility lookup
            destinationFacilityId: null, // Will be populated from facility lookup
            healthcareCreatedById: null, // Will be populated from healthcare user
          },
        });
        console.log('TCC_DEBUG: Trip synced to Hospital database');
      } catch (hospitalError) {
        console.error('TCC_DEBUG: Error syncing to Hospital database:', hospitalError);
        // Continue execution - Center DB is primary
      }

      // Send notifications to selected agencies
      if (data.selectedAgencies && data.selectedAgencies.length > 0) {
        await this.sendNewTripNotifications(centerTrip);
      }

      return {
        success: true,
        data: centerTrip,
        message: 'Enhanced transport request created successfully'
      };
    } catch (error) {
      console.error('TCC_DEBUG: Error creating enhanced trip:', error);
      throw new Error('Failed to create enhanced transport request');
    }
  }

  /**
   * Create a new transport request (legacy method)
   */
  async createTrip(data: CreateTripRequest) {
    console.log('TCC_DEBUG: Creating trip with data:', data);
    
    try {
      const trip = await prisma.trip.create({
        data: {
          tripNumber: `TRP-${Date.now()}`,
          
          // Required fields for new schema
          patientId: data.patientId,
          transportLevel: data.transportLevel,
          urgencyLevel: 'Routine', // Default for legacy trips
          
          // Trip details
          fromLocation: data.originFacilityId,
          toLocation: data.destinationFacilityId,
          scheduledTime: new Date(data.readyStart),
          
          // Legacy fields
          status: 'PENDING',
          priority: data.priority,
          notes: data.specialNeeds,
          assignedTo: null,
        },
      });

      console.log('TCC_DEBUG: Trip created successfully:', trip.id);
      
      // Send email notifications to EMS agencies
      await this.sendNewTripNotifications(trip);
      
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

      const trips = await prisma.trip.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
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
      const trip = await prisma.trip.findUnique({
        where: { id },
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

      const trip = await prisma.trip.update({
        where: { id },
        data: updateData,
      });

      console.log('TCC_DEBUG: Trip status updated:', trip.id);
      
      // Send email notifications for status changes
      await this.sendStatusUpdateNotifications(trip, data.status);
      
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
      const agencies = await prisma.eMSAgency.findMany({
        where: {
          isActive: true,
        },
      });

      console.log('TCC_DEBUG: Found agencies:', agencies.length);
      return { success: true, data: agencies };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting agencies:', error);
      return { success: false, error: 'Failed to fetch EMS agencies' };
    }
  }

  /**
   * Send email notifications for new trip requests
   */
  private async sendNewTripNotifications(trip: any) {
    try {
      console.log('TCC_DEBUG: Sending new trip notifications for:', trip.id);
      
      // Get all active EMS agencies with email addresses and phone numbers
      const agencies = await prisma.eMSAgency.findMany({
        where: {
          isActive: true,
        },
        select: {
          // email field not available in unified Agency model
          // phone field not available in unified Agency model
          name: true,
        },
      });

      const agencyEmails = agencies
        .filter((agency: any) => agency.email)
        .map((agency: any) => agency.email!);

      const agencyPhones = agencies
        .filter((agency: any) => agency.phone)
        .map((agency: any) => agency.phone!);

      // Send email notifications
      if (agencyEmails.length > 0) {
        const emailSuccess = await emailService.sendNewTripNotification(trip, agencyEmails);
        if (emailSuccess) {
          console.log('TCC_DEBUG: New trip email notifications sent successfully');
        } else {
          console.log('TCC_DEBUG: Failed to send new trip email notifications');
        }
      } else {
        console.log('TCC_DEBUG: No agency emails found for notifications');
      }

      // Send SMS notifications
      if (agencyPhones.length > 0) {
        const smsSuccess = await emailService.sendNewTripSMS(trip, agencyPhones);
        if (smsSuccess) {
          console.log('TCC_DEBUG: New trip SMS notifications sent successfully');
        } else {
          console.log('TCC_DEBUG: Failed to send new trip SMS notifications');
        }
      } else {
        console.log('TCC_DEBUG: No agency phone numbers found for SMS notifications');
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error sending new trip notifications:', error);
    }
  }

  /**
   * Send email notifications for trip status updates
   */
  private async sendStatusUpdateNotifications(trip: any, newStatus: string) {
    try {
      console.log('TCC_DEBUG: Sending status update notifications for:', trip.id, 'Status:', newStatus);
      
      // Get hospital email and phone from the facility
      const hospitalEmail = trip.originFacility?.email;
      const hospitalPhone = trip.originFacility?.phone;
      
      if (!hospitalEmail && !hospitalPhone) {
        console.log('TCC_DEBUG: No hospital contact information found for status update notification');
        return;
      }

      let emailSuccess = false;
      let smsSuccess = false;

      // Send different notifications based on status
      switch (newStatus) {
        case 'ACCEPTED':
          // Get agency details for accepted notification
          const agency = await prisma.eMSAgency.findUnique({
            where: { id: trip.assignedAgencyId || '' },
            select: { name: true }
          });
          
          // Unit information not available in unified schema

          const tripWithAgency = {
            ...trip,
            assignedAgency: agency,
            assignedUnit: null // Unit not available in unified schema
          };

          // Send email notification
          if (hospitalEmail) {
            emailSuccess = await emailService.sendTripAcceptedNotification(tripWithAgency, hospitalEmail);
          }

          // Send SMS notification
          if (hospitalPhone) {
            smsSuccess = await emailService.sendTripStatusSMS(trip, hospitalPhone);
          }
          break;
        
        case 'IN_PROGRESS':
        case 'COMPLETED':
        case 'CANCELLED':
          // Send email notification
          if (hospitalEmail) {
            emailSuccess = await emailService.sendTripStatusUpdate(trip, hospitalEmail);
          }

          // Send SMS notification
          if (hospitalPhone) {
            smsSuccess = await emailService.sendTripStatusSMS(trip, hospitalPhone);
          }
          break;
        
        default:
          console.log('TCC_DEBUG: No notification needed for status:', newStatus);
          return;
      }

      if (emailSuccess || smsSuccess) {
        console.log('TCC_DEBUG: Status update notifications sent successfully', {
          email: emailSuccess,
          sms: smsSuccess
        });
      } else {
        console.log('TCC_DEBUG: Failed to send status update notifications');
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error sending status update notifications:', error);
    }
  }

  /**
   * Get email notification settings for a user
   */
  async getNotificationSettings(userId: string) {
    try {
      const settings = await prisma.systemAnalytics.findFirst({
        where: {
          metricName: 'notification_settings',
          userId: userId
        }
      });

      const defaultSettings = {
        emailNotifications: true,
        smsNotifications: true,
        newTripAlerts: true,
        statusUpdates: true,
        emailAddress: '',
        phoneNumber: ''
      };

      if (settings?.metricValue && typeof settings.metricValue === 'object') {
        // Ensure emailAddress and phoneNumber are always strings
        const metricValue = settings.metricValue as any;
        
        // Get the user's actual email from the database to ensure consistency
        const user = await prisma.centerUser.findUnique({
          where: { id: userId },
          select: { email: true }
        });
        
        return {
          ...defaultSettings,
          ...(typeof metricValue === 'object' ? metricValue : {}),
          emailAddress: user?.email || '',
          phoneNumber: metricValue?.phoneNumber || ''
        };
      }

      return defaultSettings;
    } catch (error) {
      console.error('TCC_DEBUG: Error getting notification settings:', error);
      return {
        emailNotifications: true,
        smsNotifications: true,
        newTripAlerts: true,
        statusUpdates: true,
        emailAddress: '',
        phoneNumber: ''
      };
    }
  }

  /**
   * Update email notification settings for a user
   */
  async updateNotificationSettings(userId: string, settings: any) {
    try {
      await prisma.systemAnalytics.upsert({
        where: {
          id: `notification_settings_${userId}`
        },
        update: {
          metricValue: {
            ...settings,
            updatedAt: new Date().toISOString()
          },
          userId: userId
        },
        create: {
          metricName: 'notification_settings',
          metricValue: {
            ...settings,
            createdAt: new Date().toISOString()
          },
          userId: userId
        }
      });

      console.log('TCC_DEBUG: Notification settings updated for user:', userId);
      return { success: true };
    } catch (error) {
      console.error('TCC_DEBUG: Error updating notification settings:', error);
      return { success: false, error: 'Failed to update notification settings' };
    }
  }

  /**
   * Get agencies within distance for a hospital
   */
  async getAgenciesForHospital(hospitalId: string, radiusMiles: number = 100) {
    try {
      // Get hospital location from Center database
      const hospital = await prisma.hospital.findUnique({
        where: { id: hospitalId },
        select: { latitude: true, longitude: true, name: true }
      });

      if (!hospital || !hospital.latitude || !hospital.longitude) {
        throw new Error('Hospital location not found');
      }

      // Get all active agencies from EMS database
      const emsPrisma = databaseManager.getEMSDB();
      const agencies = await emsPrisma.eMSAgency.findMany({
        where: {
          isActive: true,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          name: true,
          contactName: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          capabilities: true,
          serviceArea: true
        }
      });

      // For now, return all agencies since we don't have coordinates in the EMS schema
      // In a real implementation, you would add latitude/longitude fields to the EMS schema
      return {
        success: true,
        data: agencies,
        message: `Found ${agencies.length} agencies available for notification`
      };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting agencies for hospital:', error);
      throw new Error('Failed to get agencies for hospital');
    }
  }

  /**
   * Update trip time tracking
   */
  async updateTripTimes(tripId: string, timeUpdates: {
    transferAcceptedTime?: string;
    emsArrivalTime?: string;
    emsDepartureTime?: string;
  }) {
    try {
      const updateData: any = {};
      
      if (timeUpdates.transferAcceptedTime) {
        updateData.transferAcceptedTime = new Date(timeUpdates.transferAcceptedTime);
      }
      if (timeUpdates.emsArrivalTime) {
        updateData.emsArrivalTime = new Date(timeUpdates.emsArrivalTime);
      }
      if (timeUpdates.emsDepartureTime) {
        updateData.emsDepartureTime = new Date(timeUpdates.emsDepartureTime);
      }

      const trip = await prisma.trip.update({
        where: { id: tripId },
        data: updateData
      });

      return {
        success: true,
        data: trip,
        message: 'Trip times updated successfully'
      };
    } catch (error) {
      console.error('TCC_DEBUG: Error updating trip times:', error);
      throw new Error('Failed to update trip times');
    }
  }

  /**
   * Get diagnosis options
   */
  getDiagnosisOptions() {
    return {
      success: true,
      data: DIAGNOSIS_OPTIONS,
      message: 'Diagnosis options retrieved successfully'
    };
  }

  /**
   * Get mobility options
   */
  getMobilityOptions() {
    return {
      success: true,
      data: MOBILITY_OPTIONS,
      message: 'Mobility options retrieved successfully'
    };
  }

  /**
   * Get transport level options
   */
  getTransportLevelOptions() {
    return {
      success: true,
      data: TRANSPORT_LEVEL_OPTIONS,
      message: 'Transport level options retrieved successfully'
    };
  }

  /**
   * Get urgency options
   */
  getUrgencyOptions() {
    return {
      success: true,
      data: URGENCY_OPTIONS,
      message: 'Urgency options retrieved successfully'
    };
  }
}

export const tripService = new TripService();
