"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitService = void 0;
const client_1 = require("@prisma/client");
class UnitService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    /**
     * Get all units for an agency
     */
    async getUnitsByAgency(agencyId) {
        try {
            // TODO: Implement proper Unit model in Prisma schema
            // For now, return mock data to get the system working
            console.log('TCC_DEBUG: getUnitsByAgency called with agencyId:', agencyId);
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
                    nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: '2',
                    agencyId: agencyId,
                    unitNumber: 'U002',
                    type: 'AMBULANCE',
                    capabilities: ['ALS'],
                    currentStatus: 'ON_CALL',
                    currentLocation: 'En Route',
                    crew: ['Bob Johnson', 'Alice Brown'],
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
            // TODO: Implement proper Unit model in Prisma schema
            console.log('TCC_DEBUG: createUnit called with data:', unitData);
            const mockUnit = {
                id: 'new-unit-id',
                agencyId: agencyId,
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