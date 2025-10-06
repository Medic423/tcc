"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.facilityService = exports.FacilityService = void 0;
const databaseManager_1 = require("./databaseManager");
class FacilityService {
    async createFacility(data) {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        return await prisma.hospital.create({
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
    async getFacilities(filters = {}) {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const { page = 1, limit = 50, ...whereFilters } = filters;
        const skip = (page - 1) * limit;
        const where = {};
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
    async getFacilityById(id) {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        return await prisma.facility.findUnique({
            where: { id }
        });
    }
    async updateFacility(id, data) {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        return await prisma.facility.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    }
    async deleteFacility(id) {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        await prisma.facility.delete({
            where: { id }
        });
    }
    async searchFacilities(query) {
        const prisma = databaseManager_1.databaseManager.getCenterDB();
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
exports.FacilityService = FacilityService;
exports.facilityService = new FacilityService();
exports.default = exports.facilityService;
//# sourceMappingURL=facilityService.js.map