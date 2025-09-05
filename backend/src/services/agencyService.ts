import { databaseManager } from './databaseManager';

export interface AgencyData {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea: string[];
  operatingHours?: any;
  capabilities: string[];
  pricingStructure?: any;
  isActive?: boolean;
  status?: string;
}

export interface AgencySearchFilters {
  name?: string;
  city?: string;
  state?: string;
  capabilities?: string[];
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface AgencyListResult {
  agencies: any[];
  total: number;
  page: number;
  totalPages: number;
}

export class AgencyService {
  async createAgency(data: AgencyData): Promise<any> {
    const emsDB = databaseManager.getEMSDB();
    
    return await emsDB.eMSAgency.create({
      data: {
        name: data.name,
        contactName: data.contactName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        serviceArea: data.serviceArea,
        operatingHours: data.operatingHours,
        capabilities: data.capabilities,
        pricingStructure: data.pricingStructure,
        isActive: data.isActive ?? true,
        status: data.status ?? 'ACTIVE'
      }
    });
  }

  async getAgencies(filters: AgencySearchFilters = {}): Promise<AgencyListResult> {
    const emsDB = databaseManager.getEMSDB();
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
    if (whereFilters.capabilities && whereFilters.capabilities.length > 0) {
      where.capabilities = { hasSome: whereFilters.capabilities };
    }
    if (whereFilters.isActive !== undefined) {
      where.isActive = whereFilters.isActive;
    }

    const [agencies, total] = await Promise.all([
      emsDB.eMSAgency.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: {
          units: true
        }
      }),
      emsDB.eMSAgency.count({ where })
    ]);

    return {
      agencies,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getAgencyById(id: string): Promise<any | null> {
    const emsDB = databaseManager.getEMSDB();
    return await emsDB.eMSAgency.findUnique({
      where: { id },
      include: {
        units: true
      }
    });
  }

  async updateAgency(id: string, data: Partial<AgencyData>): Promise<any> {
    const emsDB = databaseManager.getEMSDB();
    return await emsDB.eMSAgency.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        units: true
      }
    });
  }

  async deleteAgency(id: string): Promise<void> {
    const emsDB = databaseManager.getEMSDB();
    await emsDB.eMSAgency.delete({
      where: { id }
    });
  }

  async searchAgencies(query: string): Promise<any[]> {
    const emsDB = databaseManager.getEMSDB();
    return await emsDB.eMSAgency.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { contactName: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true
      },
      take: 10,
      orderBy: { name: 'asc' }
    });
  }
}

export const agencyService = new AgencyService();
export default agencyService;
