import { databaseManager } from './databaseManager';

export interface HospitalData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  type: string;
  capabilities: string[];
  region: string;
  coordinates?: { lat: number; lng: number };
  latitude?: number;
  longitude?: number;
  operatingHours?: string;
  isActive?: boolean;
  requiresReview?: boolean;
}

export interface HospitalSearchFilters {
  name?: string;
  city?: string;
  state?: string;
  type?: string;
  region?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface HospitalListResult {
  hospitals: any[];
  total: number;
  page: number;
  totalPages: number;
}

export class HospitalService {
  async createHospital(data: HospitalData): Promise<any> {
    const centerDB = databaseManager.getCenterDB();
    
    return await centerDB.hospital.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
        email: data.email,
        type: data.type,
        capabilities: data.capabilities,
        region: data.region,
        coordinates: data.coordinates,
        latitude: data.latitude,
        longitude: data.longitude,
        operatingHours: data.operatingHours,
        isActive: data.isActive ?? true,
        requiresReview: data.requiresReview ?? false
      }
    });
  }

  async getHospitals(filters: HospitalSearchFilters = {}): Promise<HospitalListResult> {
    const centerDB = databaseManager.getCenterDB();
    const { page = 1, limit = 50, ...whereFilters } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (whereFilters.name) {
      where.name = { contains: whereFilters.name, mode: 'insensitive' };
    }
    if (whereFilters.city) {
      where.city = { contains: whereFilters.city, mode: 'insensitive' };
    }
    if (whereFilters.state) {
      where.state = whereFilters.state;
    }
    if (whereFilters.type) {
      where.type = whereFilters.type;
    }
    if (whereFilters.region) {
      where.region = whereFilters.region;
    }
    if (whereFilters.isActive !== undefined) {
      where.isActive = whereFilters.isActive;
    }

    const [hospitals, total] = await Promise.all([
      centerDB.hospital.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      centerDB.hospital.count({ where })
    ]);

    return {
      hospitals,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getHospitalById(id: string): Promise<any | null> {
    const centerDB = databaseManager.getCenterDB();
    return await centerDB.hospital.findUnique({
      where: { id }
    });
  }

  async updateHospital(id: string, data: Partial<HospitalData>): Promise<any> {
    const centerDB = databaseManager.getCenterDB();
    return await centerDB.hospital.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async deleteHospital(id: string): Promise<void> {
    const centerDB = databaseManager.getCenterDB();
    await centerDB.hospital.delete({
      where: { id }
    });
  }

  async searchHospitals(query: string): Promise<any[]> {
    const centerDB = databaseManager.getCenterDB();
    return await centerDB.hospital.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true
      },
      take: 10,
      orderBy: { name: 'asc' }
    });
  }

  async approveHospital(id: string, approvedBy: string): Promise<any> {
    const centerDB = databaseManager.getCenterDB();
    return await centerDB.hospital.update({
      where: { id },
      data: {
        isActive: true,
        requiresReview: false,
        approvedAt: new Date(),
        approvedBy: approvedBy,
        updatedAt: new Date()
      }
    });
  }

  async rejectHospital(id: string, approvedBy: string): Promise<any> {
    const centerDB = databaseManager.getCenterDB();
    return await centerDB.hospital.update({
      where: { id },
      data: {
        isActive: false,
        requiresReview: false,
        approvedAt: new Date(),
        approvedBy: approvedBy,
        updatedAt: new Date()
      }
    });
  }
}

export const hospitalService = new HospitalService();
export default hospitalService;
