import { databaseManager } from './databaseManager';

export interface SystemOverview {
  totalHospitals: number;
  totalAgencies: number;
  totalFacilities: number;
  activeHospitals: number;
  activeAgencies: number;
  activeFacilities: number;
  totalUnits: number;
  activeUnits: number;
}

export interface TripStatistics {
  totalTrips: number;
  pendingTrips: number;
  acceptedTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  tripsByLevel: {
    BLS: number;
    ALS: number;
    CCT: number;
  };
  tripsByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

export interface AgencyPerformance {
  agencyId: string;
  agencyName: string;
  totalTrips: number;
  acceptedTrips: number;
  completedTrips: number;
  averageResponseTime: number;
  totalUnits: number;
  activeUnits: number;
}

export interface HospitalActivity {
  hospitalId: string;
  hospitalName: string;
  totalTrips: number;
  tripsByLevel: {
    BLS: number;
    ALS: number;
    CCT: number;
  };
  lastActivity: Date;
}

export class AnalyticsService {
  async getSystemOverview(): Promise<SystemOverview> {
    const prisma = databaseManager.getCenterDB();

    const [
      totalHospitals,
      activeHospitals,
      totalAgencies,
      activeAgencies,
      totalFacilities,
      activeFacilities,
      totalUnits,
      activeUnits
    ] = await Promise.all([
      prisma.hospital.count(),
      prisma.hospital.count({ where: { isActive: true } }),
      prisma.eMSAgency.count(),
      prisma.eMSAgency.count({ where: { isActive: true } }),
      0, // No facilities in Center database
      0, // No facilities in Center database
      0, // Units not available in unified schema
      0  // Units not available in unified schema
    ]);

    return {
      totalHospitals,
      totalAgencies,
      totalFacilities,
      activeHospitals,
      activeAgencies,
      activeFacilities,
      totalUnits,
      activeUnits
    };
  }

  async getTripStatistics(): Promise<TripStatistics> {
    const prisma = databaseManager.getPrismaClient();

    const totalTrips = await prisma.trip.count();
    const pendingTrips = await prisma.trip.count({ where: { status: 'PENDING' } });
    const acceptedTrips = await prisma.trip.count({ where: { status: 'ACCEPTED' } });
    const completedTrips = await prisma.trip.count({ where: { status: 'COMPLETED' } });
    const cancelledTrips = await prisma.trip.count({ where: { status: 'CANCELLED' } });

    // Get trips by level
    // Transport level grouping not available in unified Trip model
    const tripsByLevel: any[] = [];

    const tripsByLevelFormatted = {
      BLS: 0,
      ALS: 0,
      CCT: 0
    };

    tripsByLevel.forEach((group: any) => {
      if (group.transportLevel in tripsByLevelFormatted) {
        tripsByLevelFormatted[group.transportLevel as keyof typeof tripsByLevelFormatted] = group._count.transportLevel;
      }
    });

    // Get trips by priority
    const tripsByPriority = await prisma.trip.groupBy({
      by: ['priority'],
      _count: { priority: true }
    });

    const tripsByPriorityFormatted = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0
    };

    tripsByPriority.forEach((group: any) => {
      if (group.priority in tripsByPriorityFormatted) {
        tripsByPriorityFormatted[group.priority as keyof typeof tripsByPriorityFormatted] = group._count.priority;
      }
    });

    return {
      totalTrips,
      pendingTrips,
      acceptedTrips,
      completedTrips,
      cancelledTrips,
      tripsByLevel: tripsByLevelFormatted,
      tripsByPriority: tripsByPriorityFormatted
    };
  }

  async getAgencyPerformance(): Promise<AgencyPerformance[]> {
    const prisma = databaseManager.getCenterDB();

    const agencies = await prisma.eMSAgency.findMany({
      where: { isActive: true },
    });

    const performanceData: AgencyPerformance[] = [];

    for (const agency of agencies) {
      // Since Center database doesn't have trip data, return basic agency info
      performanceData.push({
        agencyId: agency.id,
        agencyName: agency.name,
        totalTrips: 0, // Trip data not available in Center database
        acceptedTrips: 0,
        completedTrips: 0,
        averageResponseTime: 0,
        totalUnits: 0, // Units not available in Center database
        activeUnits: 0  // Units not available in Center database
      });
    }

    return performanceData;
  }

  async getHospitalActivity(): Promise<HospitalActivity[]> {
    const prisma = databaseManager.getPrismaClient();

    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true }
    });

    const activityData: HospitalActivity[] = [];

    for (const hospital of hospitals) {
      // Get trips for this hospital (simplified - would need proper relationship)
      const totalTrips = 0; // TODO: Implement proper relationship
      
      const tripsByLevel = {
        BLS: 0,
        ALS: 0,
        CCT: 0
      };

      const lastActivity = new Date(); // TODO: Implement actual last activity

      activityData.push({
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        totalTrips,
        tripsByLevel,
        lastActivity
      });
    }

    return activityData;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
