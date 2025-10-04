"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitService = void 0;
const client_1 = require("@prisma/client");
const databaseManager_1 = require("./databaseManager");
class UnitService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    /**
     * Get all units (for admin users)
     */
    async getAllUnits() {
        try {
            console.log('TCC_DEBUG: getAllUnits called');
            const prisma = databaseManager_1.databaseManager.getEMSDB();
            const units = await prisma.unit.findMany({
                where: {
                    isActive: true
                },
                include: {
                    analytics: true,
                    agency: true
                },
                orderBy: {
                    unitNumber: 'asc'
                }
            });
            // Transform Prisma units to our Unit interface
            const transformedUnits = units.map((unit) => ({
                id: unit.id,
                agencyId: unit.agencyId,
                unitNumber: unit.unitNumber,
                type: unit.type,
                capabilities: unit.capabilities,
                currentStatus: unit.status,
                currentLocation: unit.location ? JSON.stringify(unit.location) : 'Unknown',
                crew: [], // Will be populated from separate crew management
                isActive: unit.isActive,
                totalTripsCompleted: unit.analytics?.totalTrips || 0,
                averageResponseTime: unit.analytics?.averageResponseTime?.toNumber() || 0,
                lastMaintenanceDate: unit.lastMaintenance || new Date(),
                nextMaintenanceDate: unit.nextMaintenance || new Date(),
                createdAt: unit.createdAt,
                updatedAt: unit.updatedAt
            }));
            console.log('TCC_DEBUG: Found all units:', transformedUnits.length);
            return transformedUnits;
        }
        catch (error) {
            console.error('Error getting all units:', error);
            throw new Error('Failed to retrieve units');
        }
    }
    /**
     * Get all units for an agency
     */
    async getUnitsByAgency(agencyId) {
        try {
            console.log('TCC_DEBUG: getUnitsByAgency called with agencyId:', agencyId);
            const prisma = databaseManager_1.databaseManager.getEMSDB();
            const units = await prisma.unit.findMany({
                where: {
                    agencyId: agencyId,
                    isActive: true
                },
                include: {
                    analytics: true
                },
                orderBy: {
                    unitNumber: 'asc'
                }
            });
            // Transform Prisma units to our Unit interface
            const transformedUnits = units.map((unit) => ({
                id: unit.id,
                agencyId: unit.agencyId,
                unitNumber: unit.unitNumber,
                type: unit.type,
                capabilities: unit.capabilities,
                currentStatus: unit.status,
                currentLocation: unit.location ? JSON.stringify(unit.location) : 'Unknown',
                crew: [], // Will be populated from separate crew management
                isActive: unit.isActive,
                totalTripsCompleted: unit.analytics?.totalTrips || 0,
                averageResponseTime: unit.analytics?.averageResponseTime?.toNumber() || 0,
                lastMaintenanceDate: unit.lastMaintenance || new Date(),
                nextMaintenanceDate: unit.nextMaintenance || new Date(),
                createdAt: unit.createdAt,
                updatedAt: unit.updatedAt
            }));
            console.log('TCC_DEBUG: Found units:', transformedUnits.length);
            return transformedUnits;
        }
        catch (error) {
            console.error('Error getting units by agency:', error);
            throw new Error('Failed to retrieve units');
        }
    }
    /**
     * Get a single unit by ID
     */
    async getUnitById(unitId) {
        try {
            // TODO: Implement proper Unit model in Prisma schema
            // For now, return mock data
            console.log('TCC_DEBUG: getUnitById called with unitId:', unitId);
            const mockUnit = {
                id: unitId,
                agencyId: 'mock-agency',
                unitNumber: 'U001',
                type: 'AMBULANCE',
                capabilities: ['BLS'],
                currentStatus: 'AVAILABLE',
                currentLocation: 'Station 1',
                crew: ['John Doe', 'Jane Smith'],
                isActive: true,
                totalTripsCompleted: 0,
                averageResponseTime: 0,
                lastMaintenanceDate: new Date(),
                nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            return mockUnit;
        }
        catch (error) {
            console.error('Error getting unit by ID:', error);
            throw new Error('Failed to retrieve unit');
        }
    }
    /**
     * Create a new unit
     */
    async createUnit(unitData, agencyId) {
        try {
            console.log('TCC_DEBUG: createUnit called with data:', unitData);
            const prisma = databaseManager_1.databaseManager.getEMSDB();
            // Create the unit in the database
            const newUnit = await prisma.unit.create({
                data: {
                    agencyId: agencyId,
                    unitNumber: unitData.unitNumber,
                    type: unitData.type,
                    capabilities: unitData.capabilities,
                    status: 'AVAILABLE',
                    crewSize: 2, // Default crew size
                    equipment: [], // Default empty equipment array
                    isActive: unitData.isActive,
                    lastMaintenance: new Date(),
                    nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                },
                include: {
                    analytics: true
                }
            });
            // Create analytics record for the new unit
            await prisma.unit_analytics.create({
                data: {
                    id: `analytics-${newUnit.id}`,
                    unitId: newUnit.id,
                    totalTrips: 0,
                    averageResponseTime: 0,
                    performanceScore: 0,
                    efficiency: 0
                }
            });
            // Transform to our Unit interface
            const transformedUnit = {
                id: newUnit.id,
                agencyId: newUnit.agencyId,
                unitNumber: newUnit.unitNumber,
                type: newUnit.type,
                capabilities: newUnit.capabilities,
                currentStatus: newUnit.status,
                currentLocation: newUnit.location ? JSON.stringify(newUnit.location) : 'Station 1',
                crew: [],
                isActive: newUnit.isActive,
                totalTripsCompleted: 0,
                averageResponseTime: 0,
                lastMaintenanceDate: newUnit.lastMaintenance || new Date(),
                nextMaintenanceDate: newUnit.nextMaintenance || new Date(),
                createdAt: newUnit.createdAt,
                updatedAt: newUnit.updatedAt
            };
            console.log('TCC_DEBUG: Unit created successfully:', transformedUnit);
            return transformedUnit;
        }
        catch (error) {
            console.error('Error creating unit:', error);
            throw new Error('Failed to create unit');
        }
    }
    /**
     * Update a unit
     */
    async updateUnit(unitId, unitData) {
        try {
            // TODO: Implement proper Unit model in Prisma schema
            console.log('TCC_DEBUG: updateUnit called with unitId:', unitId, 'data:', unitData);
            const mockUnit = {
                id: unitId,
                agencyId: 'mock-agency',
                unitNumber: unitData.unitNumber,
                type: unitData.type,
                capabilities: unitData.capabilities,
                currentStatus: 'AVAILABLE',
                currentLocation: 'Station 1',
                crew: [],
                isActive: unitData.isActive,
                totalTripsCompleted: 0,
                averageResponseTime: 0,
                lastMaintenanceDate: new Date(),
                nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            return mockUnit;
        }
        catch (error) {
            console.error('Error updating unit:', error);
            throw new Error('Failed to update unit');
        }
    }
    /**
     * Delete a unit
     */
    async deleteUnit(unitId) {
        try {
            // TODO: Implement proper Unit model in Prisma schema
            console.log('TCC_DEBUG: deleteUnit called with unitId:', unitId);
        }
        catch (error) {
            console.error('Error deleting unit:', error);
            throw new Error('Failed to delete unit');
        }
    }
    /**
     * Update unit status
     */
    async updateUnitStatus(unitId, statusUpdate) {
        try {
            // TODO: Implement proper Unit model in Prisma schema
            console.log('TCC_DEBUG: updateUnitStatus called with unitId:', unitId, 'status:', statusUpdate);
            const mockUnit = {
                id: unitId,
                agencyId: 'mock-agency',
                unitNumber: 'U001',
                type: 'AMBULANCE',
                capabilities: ['BLS'],
                currentStatus: statusUpdate.status,
                currentLocation: statusUpdate.location || 'Station 1',
                crew: statusUpdate.crew || ['John Doe', 'Jane Smith'],
                isActive: true,
                totalTripsCompleted: 0,
                averageResponseTime: 0,
                lastMaintenanceDate: new Date(),
                nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            return mockUnit;
        }
        catch (error) {
            console.error('Error updating unit status:', error);
            throw new Error('Failed to update unit status');
        }
    }
    /**
     * Get available units for optimization
     */
    async getAvailableUnits(agencyId) {
        try {
            // TODO: Implement proper Unit model in Prisma schema
            console.log('TCC_DEBUG: getAvailableUnits called with agencyId:', agencyId);
            const mockUnits = [
                {
                    id: '1',
                    agencyId: agencyId,
                    unitNumber: 'U001',
                    type: 'AMBULANCE',
                    capabilities: ['BLS'],
                    currentStatus: 'AVAILABLE',
                    currentLocation: 'Station 1',
                    crew: ['John Doe', 'Jane Smith'],
                    isActive: true,
                    totalTripsCompleted: 0,
                    averageResponseTime: 0,
                    lastMaintenanceDate: new Date(),
                    nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            return mockUnits;
        }
        catch (error) {
            console.error('Error getting available units:', error);
            throw new Error('Failed to retrieve available units');
        }
    }
    /**
     * Get unit analytics for an agency
     */
    async getUnitAnalytics(agencyId) {
        try {
            // TODO: Implement proper Unit model in Prisma schema
            console.log('TCC_DEBUG: getUnitAnalytics called with agencyId:', agencyId);
            const mockAnalytics = {
                totalUnits: 2,
                availableUnits: 1,
                committedUnits: 0,
                outOfServiceUnits: 0,
                maintenanceUnits: 0,
                offDutyUnits: 0,
                totalTripsToday: 0,
                averageResponseTime: 0,
                efficiency: 0.5
            };
            return mockAnalytics;
        }
        catch (error) {
            console.error('Error getting unit analytics:', error);
            throw new Error('Failed to retrieve unit analytics');
        }
    }
    /**
     * Map Prisma unit to Unit interface
     */
    mapPrismaUnitToUnit(unit) {
        return {
            id: unit.id,
            agencyId: unit.agencyId,
            unitNumber: unit.unitNumber,
            type: unit.type,
            capabilities: unit.capabilities || [],
            currentStatus: unit.currentStatus || 'AVAILABLE',
            currentLocation: unit.currentLocation || 'Unknown',
            crew: unit.crew || [],
            isActive: unit.isActive !== false,
            totalTripsCompleted: unit.totalTripsCompleted || 0,
            averageResponseTime: unit.averageResponseTime || 0,
            lastMaintenanceDate: unit.lastMaintenanceDate ? new Date(unit.lastMaintenanceDate) : new Date(),
            nextMaintenanceDate: unit.nextMaintenanceDate ? new Date(unit.nextMaintenanceDate) : new Date(),
            createdAt: unit.createdAt ? new Date(unit.createdAt) : new Date(),
            updatedAt: unit.updatedAt ? new Date(unit.updatedAt) : new Date()
        };
    }
}
exports.unitService = new UnitService();
//# sourceMappingURL=unitService.js.map