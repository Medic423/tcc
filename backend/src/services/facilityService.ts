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
    const prisma = databaseManager.getPrismaClient();
    
    return await prisma.facility.create({
      data: {
        name: data.name,
        type: data.type,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
        email: data.email,
        region: data.state, // Use state as region for now
        isActive: data.isActive ?? true
      }
    });
  }

  async getFacilities(filters: FacilitySearchFilters = {}): Promise<FacilityListResult> {
    const prisma = databaseManager.getPrismaClient();
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
      prisma.facility.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.facility.count({ where })
    ]);

    return {
      facilities,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getFacilityById(id: string): Promise<any | null> {
    const prisma = databaseManager.getPrismaClient();
    return await prisma.facility.findUnique({
      where: { id }
    });
  }

  async updateFacility(id: string, data: Partial<FacilityData>): Promise<any> {
    const prisma = databaseManager.getPrismaClient();
    return await prisma.facility.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async deleteFacility(id: string): Promise<void> {
    const prisma = databaseManager.getPrismaClient();
    await prisma.facility.delete({
      where: { id }
    });
  }

  async searchFacilities(query: string): Promise<any[]> {
    const prisma = databaseManager.getPrismaClient();
    return await prisma.facility.findMany({
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
