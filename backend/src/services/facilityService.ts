import { databaseManager } from './databaseManager';

export interface FacilityData {
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  coordinates?: { lat: number; lng: number };
  isActive?: boolean;
}

export interface FacilitySearchFilters {
  name?: string;
  type?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface FacilityListResult {
  facilities: any[];
  total: number;
  page: number;
  totalPages: number;
}

export class FacilityService {
  async createFacility(data: FacilityData): Promise<any> {
    const hospitalDB = databaseManager.getHospitalDB();
    
    return await hospitalDB.facility.create({
      data: {
        name: data.name,
        type: data.type,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
        email: data.email,
        coordinates: data.coordinates,
        isActive: data.isActive ?? true
      }
    });
  }

  async getFacilities(filters: FacilitySearchFilters = {}): Promise<FacilityListResult> {
    const hospitalDB = databaseManager.getHospitalDB();
    const { page = 1, limit = 50, ...whereFilters } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (whereFilters.name) {
      where.name = { contains: whereFilters.name, mode: 'insensitive' };
    }
    if (whereFilters.type) {
      where.type = whereFilters.type;
    }
    if (whereFilters.city) {
      where.city = { contains: whereFilters.city, mode: 'insensitive' };
    }
    if (whereFilters.state) {
      where.state = whereFilters.state;
    }
    if (whereFilters.isActive !== undefined) {
      where.isActive = whereFilters.isActive;
    }

    const [facilities, total] = await Promise.all([
      hospitalDB.facility.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      hospitalDB.facility.count({ where })
    ]);

    return {
      facilities,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getFacilityById(id: string): Promise<any | null> {
    const hospitalDB = databaseManager.getHospitalDB();
    return await hospitalDB.facility.findUnique({
      where: { id }
    });
  }

  async updateFacility(id: string, data: Partial<FacilityData>): Promise<any> {
    const hospitalDB = databaseManager.getHospitalDB();
    return await hospitalDB.facility.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async deleteFacility(id: string): Promise<void> {
    const hospitalDB = databaseManager.getHospitalDB();
    await hospitalDB.facility.delete({
      where: { id }
    });
  }

  async searchFacilities(query: string): Promise<any[]> {
    const hospitalDB = databaseManager.getHospitalDB();
    return await hospitalDB.facility.findMany({
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
}

export const facilityService = new FacilityService();
export default facilityService;
