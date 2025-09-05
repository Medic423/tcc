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
    const centerDB = databaseManager.getCenterDB();
    const emsDB = databaseManager.getEMSDB();
    const hospitalDB = databaseManager.getHospitalDB();

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
      centerDB.hospital.count(),
      centerDB.hospital.count({ where: { isActive: true } }),
      emsDB.eMSAgency.count(),
      emsDB.eMSAgency.count({ where: { isActive: true } }),
      hospitalDB.facility.count(),
      hospitalDB.facility.count({ where: { isActive: true } }),
      emsDB.unit.count(),
      emsDB.unit.count({ where: { isActive: true } })
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
    const hospitalDB = databaseManager.getHospitalDB();

    const totalTrips = await hospitalDB.transportRequest.count();
    const pendingTrips = await hospitalDB.transportRequest.count({ where: { status: 'PENDING' } });
    const acceptedTrips = await hospitalDB.transportRequest.count({ where: { status: 'ACCEPTED' } });
    const completedTrips = await hospitalDB.transportRequest.count({ where: { status: 'COMPLETED' } });
    const cancelledTrips = await hospitalDB.transportRequest.count({ where: { status: 'CANCELLED' } });

    // Get trips by level
    const tripsByLevel = await hospitalDB.transportRequest.groupBy({
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
    const tripsByPriority = await hospitalDB.transportRequest.groupBy({
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
    const emsDB = databaseManager.getEMSDB();
    const hospitalDB = databaseManager.getHospitalDB();

    const agencies = await emsDB.eMSAgency.findMany({
      where: { isActive: true },
      include: {
        units: true
      }
    });

    const performanceData: AgencyPerformance[] = [];

    for (const agency of agencies) {
      const totalTrips = await hospitalDB.transportRequest.count({
        where: { assignedAgencyId: agency.id }
      });

      const acceptedTrips = await hospitalDB.transportRequest.count({
        where: { 
          assignedAgencyId: agency.id,
          status: { in: ['ACCEPTED', 'IN_TRANSIT', 'COMPLETED'] }
        }
      });

      const completedTrips = await hospitalDB.transportRequest.count({
        where: { 
          assignedAgencyId: agency.id,
          status: 'COMPLETED'
        }
      });

      // Calculate average response time (simplified)
      const averageResponseTime = 0; // TODO: Implement actual calculation

      performanceData.push({
        agencyId: agency.id,
        agencyName: agency.name,
        totalTrips,
        acceptedTrips,
        completedTrips,
        averageResponseTime,
        totalUnits: agency.units.length,
        activeUnits: agency.units.filter((unit: any) => unit.isActive).length
      });
    }

    return performanceData;
  }

  async getHospitalActivity(): Promise<HospitalActivity[]> {
    const centerDB = databaseManager.getCenterDB();
    const hospitalDB = databaseManager.getHospitalDB();

    const hospitals = await centerDB.hospital.findMany({
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
