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
    const centerPrisma = databaseManager.getCenterDB();
    const emsPrisma = databaseManager.getEMSDB();

    const [
      totalHospitals,
      activeHospitals,
      totalAgencies,
      activeAgencies,
      totalUnits,
      activeUnits
    ] = await Promise.all([
      centerPrisma.hospital.count(),
      centerPrisma.hospital.count({ where: { isActive: true } }),
      emsPrisma.eMSAgency.count(),
      emsPrisma.eMSAgency.count({ where: { isActive: true } }),
      emsPrisma.unit.count(),
      emsPrisma.unit.count({ where: { isActive: true } })
    ]);

    return {
      totalHospitals,
      totalAgencies,
      totalFacilities: totalHospitals, // Using hospitals as facilities
      activeHospitals,
      activeAgencies,
      activeFacilities: activeHospitals, // Using hospitals as facilities
      totalUnits,
      activeUnits
    };
  }

  async getTripStatistics(): Promise<TripStatistics> {
    const prisma = databaseManager.getCenterDB();

    const totalTrips = await prisma.trip.count();
    const pendingTrips = await prisma.trip.count({ where: { status: 'PENDING' } });
    const acceptedTrips = await prisma.trip.count({ where: { status: 'ACCEPTED' } });
    const completedTrips = await prisma.trip.count({ where: { status: 'COMPLETED' } });
    const cancelledTrips = await prisma.trip.count({ where: { status: 'CANCELLED' } });

    // Get trips by transport level
    const tripsByLevel = await prisma.trip.groupBy({
      by: ['transportLevel'],
      _count: { transportLevel: true }
    });

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
    const centerPrisma = databaseManager.getCenterDB();
    const emsPrisma = databaseManager.getEMSDB();

    const agencies = await emsPrisma.eMSAgency.findMany({
      where: { isActive: true },
    });

    const performanceData: AgencyPerformance[] = [];

    for (const agency of agencies) {
      // Get trip data for this agency
      const totalTrips = await centerPrisma.trip.count({
        where: { assignedAgencyId: agency.id }
      });
      
      const acceptedTrips = await centerPrisma.trip.count({
        where: { 
          assignedAgencyId: agency.id,
          status: 'ACCEPTED'
        }
      });
      
      const completedTrips = await centerPrisma.trip.count({
        where: { 
          assignedAgencyId: agency.id,
          status: 'COMPLETED'
        }
      });

      // Get unit data for this agency
      const totalUnits = await emsPrisma.unit.count({
        where: { agencyId: agency.id }
      });
      
      const activeUnits = await emsPrisma.unit.count({
        where: { 
          agencyId: agency.id,
          isActive: true
        }
      });

      // Calculate average response time
      const responseTimeData = await centerPrisma.trip.findMany({
        where: {
          assignedAgencyId: agency.id,
          responseTimeMinutes: { not: null }
        },
        select: { responseTimeMinutes: true }
      });

      const averageResponseTime = responseTimeData.length > 0
        ? responseTimeData.reduce((sum, trip) => sum + (trip.responseTimeMinutes || 0), 0) / responseTimeData.length
        : 0;

      performanceData.push({
        agencyId: agency.id,
        agencyName: agency.name,
        totalTrips,
        acceptedTrips,
        completedTrips,
        averageResponseTime,
        totalUnits,
        activeUnits
      });
    }

    return performanceData;
  }

  async getHospitalActivity(): Promise<HospitalActivity[]> {
    const prisma = databaseManager.getCenterDB();

    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true }
    });

    const activityData: HospitalActivity[] = [];

    for (const hospital of hospitals) {
      // Get trips for this hospital by location
      const totalTrips = await prisma.trip.count({
        where: {
          OR: [
            { fromLocation: hospital.name },
            { toLocation: hospital.name }
          ]
        }
      });
      
      // Get trips by level for this hospital
      const tripsByLevelData = await prisma.trip.groupBy({
        by: ['transportLevel'],
        where: {
          OR: [
            { fromLocation: hospital.name },
            { toLocation: hospital.name }
          ]
        },
        _count: { transportLevel: true }
      });

      const tripsByLevel = {
        BLS: 0,
        ALS: 0,
        CCT: 0
      };

      tripsByLevelData.forEach((group: any) => {
        if (group.transportLevel in tripsByLevel) {
          tripsByLevel[group.transportLevel as keyof typeof tripsByLevel] = group._count.transportLevel;
        }
      });

      // Get last activity (most recent trip)
      const lastTrip = await prisma.trip.findFirst({
        where: {
          OR: [
            { fromLocation: hospital.name },
            { toLocation: hospital.name }
          ]
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      const lastActivity = lastTrip?.createdAt || new Date();

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
