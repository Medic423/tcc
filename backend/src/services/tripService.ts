import { PrismaClient as HospitalPrismaClient } from '@prisma/hospital';
import { PrismaClient as EMSPrisaClient } from '@prisma/ems';
import { PrismaClient as CenterPrismaClient } from '../../node_modules/.prisma/center';
import emailService from './emailService';

const hospitalPrisma = new HospitalPrismaClient();
const emsPrisma = new EMSPrisaClient();
const centerPrisma = new CenterPrismaClient();

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

  /**
   * Send email notifications for new trip requests
   */
  private async sendNewTripNotifications(trip: any) {
    try {
      console.log('TCC_DEBUG: Sending new trip notifications for:', trip.id);
      
      // Get all active EMS agencies with email addresses and phone numbers
      const agencies = await emsPrisma.eMSAgency.findMany({
        where: {
          isActive: true,
          status: 'ACTIVE',
        },
        select: {
          email: true,
          phone: true,
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
          const agency = await emsPrisma.eMSAgency.findUnique({
            where: { id: trip.assignedAgencyId || '' },
            select: { name: true, phone: true }
          });
          
          const unit = await emsPrisma.unit.findUnique({
            where: { id: trip.assignedUnitId || '' },
            select: { unitNumber: true }
          });

          const tripWithAgency = {
            ...trip,
            assignedAgency: agency,
            assignedUnit: unit
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
      const settings = await centerPrisma.systemAnalytics.findFirst({
        where: {
          metricName: 'notification_settings',
          metricValue: {
            path: ['userId'],
            equals: userId
          }
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
        const user = await centerPrisma.centerUser.findUnique({
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
      await centerPrisma.systemAnalytics.upsert({
        where: {
          id: `notification_settings_${userId}`
        },
        update: {
          metricValue: {
            userId,
            ...settings,
            updatedAt: new Date().toISOString()
          }
        },
        create: {
          metricName: 'notification_settings',
          metricValue: {
            userId,
            ...settings,
            createdAt: new Date().toISOString()
          }
        }
      });

      console.log('TCC_DEBUG: Notification settings updated for user:', userId);
      return { success: true };
    } catch (error) {
      console.error('TCC_DEBUG: Error updating notification settings:', error);
      return { success: false, error: 'Failed to update notification settings' };
    }
  }
}

export const tripService = new TripService();
