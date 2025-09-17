import express from 'express';
import { RevenueOptimizer } from '../services/revenueOptimizer';
import { BackhaulDetector } from '../services/backhaulDetector';
import { MultiUnitOptimizer } from '../services/multiUnitOptimizer';
import { databaseManager } from '../services/databaseManager';

const router = express.Router();

// Initialize optimization services
const revenueOptimizer = new RevenueOptimizer(databaseManager);
const backhaulDetector = new BackhaulDetector();
const multiUnitOptimizer = new MultiUnitOptimizer(revenueOptimizer, backhaulDetector);

/**
 * POST /api/optimize/routes
 * Optimize routes for a specific unit
 */
router.post('/routes', async (req, res) => {
  try {
    const { unitId, requestIds, constraints } = req.body;

    if (!unitId || !requestIds || !Array.isArray(requestIds)) {
      return res.status(400).json({
        success: false,
        error: 'unitId and requestIds array are required'
      });
    }

    // Get unit information
    const unit = await getUnitById(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found'
      });
    }

    // Get request information
    const requests = await getRequestsByIds(requestIds);
    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid requests found'
      });
    }

    // Calculate optimization scores
    const currentTime = new Date();
    const optimizationResults = requests
      .filter(request => revenueOptimizer.canHandleRequest(unit, request))
      .map(request => {
        const score = revenueOptimizer.calculateScore(unit, request, currentTime);
        const revenue = revenueOptimizer.calculateRevenue(request);
        const deadheadMiles = revenueOptimizer.calculateDeadheadMiles(unit, request);
        const waitTime = revenueOptimizer.calculateWaitTime(unit, request, currentTime);
        const overtimeRisk = revenueOptimizer.calculateOvertimeRisk(unit, request, currentTime);

        return {
          requestId: request.id,
          score,
          revenue,
          deadheadMiles,
          waitTime,
          overtimeRisk,
          canHandle: true
        };
      })
      .sort((a, b) => b.score - a.score); // Sort by score descending

    // Find backhaul opportunities
    const backhaulPairs = backhaulDetector.findPairs(requests);

    res.json({
      success: true,
      data: {
        unitId,
        optimizedRequests: optimizationResults,
        backhaulPairs: backhaulPairs.slice(0, 5), // Top 5 pairs
        totalRevenue: optimizationResults.reduce((sum, result) => sum + result.revenue, 0),
        totalDeadheadMiles: optimizationResults.reduce((sum, result) => sum + result.deadheadMiles, 0),
        totalWaitTime: optimizationResults.reduce((sum, result) => sum + result.waitTime, 0),
        averageScore: optimizationResults.length > 0 
          ? optimizationResults.reduce((sum, result) => sum + result.score, 0) / optimizationResults.length 
          : 0
      }
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during route optimization'
    });
  }
});

/**
 * GET /api/optimize/revenue
 * Get revenue analytics for a time period
 */
router.get('/revenue', async (req, res) => {
  try {
    const { timeframe = '24h', agencyId } = req.query;

    // Calculate time range
    const now = new Date();
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const timeRange = timeRanges[timeframe as keyof typeof timeRanges] || timeRanges['24h'];
    const startTime = new Date(now.getTime() - timeRange);

    // Get completed trips in time range
    const trips = await getCompletedTripsInRange(startTime, now, agencyId as string);
    console.log('TCC_DEBUG: Revenue analytics - trips found:', trips.length);
    console.log('TCC_DEBUG: Revenue analytics - sample trip:', trips[0]);

    // Calculate metrics using new database fields when available
    const totalRevenue = trips.reduce((sum, trip) => sum + calculateTripRevenue(trip), 0);
    const totalMiles = trips.reduce((sum, trip) => sum + calculateTripMiles(trip), 0);
    const loadedMiles = trips.reduce((sum, trip) => sum + calculateLoadedMiles(trip), 0);
    const loadedMileRatio = totalMiles > 0 ? loadedMiles / totalMiles : 0;
    
    // Use stored revenuePerHour if available, otherwise calculate
    const storedRevenuePerHour = trips.find(trip => trip.revenuePerHour)?.revenuePerHour;
    const revenuePerHour = storedRevenuePerHour ? Number(storedRevenuePerHour) : totalRevenue / (timeRange / (1000 * 60 * 60));
    
    console.log('TCC_DEBUG: Revenue analytics - calculated values:', {
      totalRevenue,
      totalMiles,
      loadedMiles,
      loadedMileRatio,
      revenuePerHour
    });

    res.json({
      success: true,
      data: {
        timeframe,
        totalRevenue,
        loadedMileRatio,
        revenuePerHour,
        totalTrips: trips.length,
        averageRevenuePerTrip: trips.length > 0 ? totalRevenue / trips.length : 0,
        totalMiles,
        loadedMiles
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during revenue analytics'
    });
  }
});

/**
 * POST /api/optimize/backhaul
 * Find backhaul opportunities for given requests
 */
router.post('/backhaul', async (req, res) => {
  try {
    const { requestIds } = req.body;

    if (!requestIds || !Array.isArray(requestIds)) {
      return res.status(400).json({
        success: false,
        error: 'requestIds array is required'
      });
    }

    // Get request information
    const requests = await getRequestsByIds(requestIds);
    if (requests.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 requests are required for backhaul analysis'
      });
    }

    // Find backhaul pairs
    const pairs = backhaulDetector.findPairs(requests);
    const statistics = backhaulDetector.getBackhaulStatistics(requests);

    res.json({
      success: true,
      data: {
        pairs,
        statistics,
        recommendations: pairs.slice(0, 10).map(pair => ({
          pairId: `${pair.request1.id}-${pair.request2.id}`,
          efficiency: pair.efficiency,
          distance: pair.distance,
          timeWindow: pair.timeWindow,
          revenueBonus: pair.revenueBonus,
          potentialRevenue: backhaulDetector.calculatePairingRevenue(pair)
        }))
      }
    });
  } catch (error) {
    console.error('Backhaul analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during backhaul analysis'
    });
  }
});

/**
 * GET /api/optimize/return-trips
 * Find return trip opportunities in the system (e.g., Altoona → Pittsburgh → Altoona)
 */
router.get('/return-trips', async (req, res) => {
  try {
    console.log('TCC_DEBUG: Finding return trip opportunities...');
    
    // Get all pending requests
    const allRequests = await getAllPendingRequests();
    console.log('TCC_DEBUG: Found pending requests:', allRequests.length);
    
    // Find return trip opportunities
    const returnTrips = backhaulDetector.findAllReturnTripOpportunities(allRequests);
    console.log('TCC_DEBUG: Found return trip opportunities:', returnTrips.length);
    
    // Calculate statistics
    const statistics = {
      totalRequests: allRequests.length,
      returnTripOpportunities: returnTrips.length,
      averageEfficiency: returnTrips.length > 0 
        ? returnTrips.reduce((sum, pair) => sum + pair.efficiency, 0) / returnTrips.length 
        : 0,
      potentialRevenueIncrease: returnTrips.reduce((sum, pair) => 
        sum + backhaulDetector.calculatePairingRevenue(pair), 0
      )
    };

    res.json({
      success: true,
      data: {
        returnTrips: returnTrips.slice(0, 20), // Limit to top 20
        statistics,
        recommendations: returnTrips.slice(0, 10).map(pair => ({
          pairId: `${pair.request1.id}-${pair.request2.id}`,
          efficiency: pair.efficiency,
          distance: pair.distance,
          timeWindow: pair.timeWindow,
          revenueBonus: pair.revenueBonus,
          potentialRevenue: backhaulDetector.calculatePairingRevenue(pair),
          isReturnTrip: true
        }))
      }
    });
  } catch (error) {
    console.error('Return trip analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during return trip analysis'
    });
  }
});

/**
 * POST /api/optimize/multi-unit
 * Optimize assignments across multiple units
 */
router.post('/multi-unit', async (req, res) => {
  try {
    const { unitIds, requestIds, constraints } = req.body;

    if (!unitIds || !Array.isArray(unitIds) || !requestIds || !Array.isArray(requestIds)) {
      return res.status(400).json({
        success: false,
        error: 'unitIds and requestIds arrays are required'
      });
    }

    // Get units information
    const units = await getUnitsByIds(unitIds);
    if (units.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid units found'
      });
    }

    // Get requests information
    const requests = await getRequestsByIds(requestIds);
    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid requests found'
      });
    }

    // Update constraints if provided
    if (constraints) {
      multiUnitOptimizer.updateConstraints(constraints);
    }

    // Run multi-unit optimization
    const currentTime = new Date();
    const optimizationResult = await multiUnitOptimizer.optimizeMultiUnit(
      units,
      requests,
      currentTime
    );

    res.json({
      success: true,
      data: optimizationResult
    });
  } catch (error) {
    console.error('Multi-unit optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during multi-unit optimization'
    });
  }
});

/**
 * GET /api/optimize/performance
 * Get performance metrics for units
 */
router.get('/performance', async (req, res) => {
  try {
    const { timeframe = '24h', unitId } = req.query;

    // Calculate time range
    const now = new Date();
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const timeRange = timeRanges[timeframe as keyof typeof timeRanges] || timeRanges['24h'];
    const startTime = new Date(now.getTime() - timeRange);

    // Get performance data
    const performanceData = await getPerformanceMetrics(startTime, now, unitId as string);
    console.log('TCC_DEBUG: Performance metrics - data:', performanceData);

    res.json({
      success: true,
      data: {
        timeframe,
        ...performanceData
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during performance analysis'
    });
  }
});

// Helper functions - Real database queries

async function getAllPendingRequests(): Promise<any[]> {
  try {
    const prisma = databaseManager.getCenterDB();
    
    const trips = await prisma.trip.findMany({
      where: {
        status: 'PENDING'
      },
      select: {
        id: true,
        patientId: true,
        fromLocation: true,
        toLocation: true,
        transportLevel: true,
        priority: true,
        scheduledTime: true,
        specialNeeds: true,
        originLatitude: true,
        originLongitude: true,
        destinationLatitude: true,
        destinationLongitude: true,
        createdAt: true
      }
    });

    // Convert to TransportRequest format
    return trips.map(trip => ({
      id: trip.id,
      patientId: trip.patientId,
      originFacilityId: trip.fromLocation,
      destinationFacilityId: trip.toLocation,
      transportLevel: trip.transportLevel,
      priority: trip.priority,
      status: 'PENDING',
      specialRequirements: trip.specialNeeds || '',
      requestTimestamp: new Date(trip.createdAt),
      readyStart: new Date(trip.scheduledTime),
      readyEnd: new Date(new Date(trip.scheduledTime).getTime() + 60 * 60 * 1000), // 1 hour window
      originLocation: {
        lat: trip.originLatitude || 40.7128,
        lng: trip.originLongitude || -74.0060
      },
      destinationLocation: {
        lat: trip.destinationLatitude || 40.7589,
        lng: trip.destinationLongitude || -73.9851
      }
    }));
  } catch (error) {
    console.error('Error getting pending requests:', error);
    return [];
  }
}

async function getUnitById(unitId: string): Promise<any> {
  try {
    const prisma = databaseManager.getEMSDB();
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        agency: true
      }
    });

    if (!unit) {
      return null;
    }

    return {
      id: unit.id,
      agencyId: unit.agencyId,
      unitNumber: unit.unitNumber,
      type: unit.type,
      capabilities: unit.capabilities || [],
      currentStatus: unit.currentStatus,
      currentLocation: unit.currentLocation && typeof unit.currentLocation === 'object' && 'lat' in unit.currentLocation ? {
        lat: (unit.currentLocation as any).lat,
        lng: (unit.currentLocation as any).lng
      } : { lat: 0, lng: 0 },
      shiftStart: (unit as any).shiftStart || new Date(),
      shiftEnd: (unit as any).shiftEnd || new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      isActive: unit.isActive
    };
  } catch (error) {
    console.error('Error fetching unit by ID:', error);
    return null;
  }
}

async function getUnitsByIds(unitIds: string[]): Promise<any[]> {
  try {
    const prisma = databaseManager.getEMSDB();
    const units = await prisma.unit.findMany({
      where: { 
        id: { in: unitIds },
        isActive: true
      },
      include: {
        agency: true
      }
    });

    return units.map((unit: any) => ({
      id: unit.id,
      agencyId: unit.agencyId,
      unitNumber: unit.unitNumber,
      type: unit.type,
      capabilities: unit.capabilities || [],
      currentStatus: unit.currentStatus,
      currentLocation: unit.currentLocation && typeof unit.currentLocation === 'object' && 'lat' in unit.currentLocation ? {
        lat: (unit.currentLocation as any).lat,
        lng: (unit.currentLocation as any).lng
      } : { lat: 0, lng: 0 },
      shiftStart: (unit as any).shiftStart || new Date(),
      shiftEnd: (unit as any).shiftEnd || new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      isActive: unit.isActive
    }));
  } catch (error) {
    console.error('Error fetching units by IDs:', error);
    return [];
  }
}

async function getRequestsByIds(requestIds: string[]): Promise<any[]> {
  try {
    const prisma = databaseManager.getCenterDB();
    const trips = await prisma.trip.findMany({
      where: { 
        id: { in: requestIds },
        status: 'PENDING'
      }
    });

    return trips.map(trip => ({
      id: trip.id,
      patientId: trip.patientId,
      originFacilityId: trip.fromLocation,
      destinationFacilityId: trip.toLocation,
      transportLevel: trip.transportLevel,
      priority: trip.priority,
      status: trip.status,
      specialRequirements: trip.specialNeeds || '',
      requestTimestamp: trip.requestTimestamp || trip.createdAt,
      readyStart: trip.scheduledTime,
      readyEnd: new Date(trip.scheduledTime.getTime() + 30 * 60 * 1000), // 30 minutes window
      originLocation: trip.originLatitude && trip.originLongitude ? {
        lat: trip.originLatitude,
        lng: trip.originLongitude
      } : { lat: 0, lng: 0 },
      destinationLocation: trip.destinationLatitude && trip.destinationLongitude ? {
        lat: trip.destinationLatitude,
        lng: trip.destinationLongitude
      } : { lat: 0, lng: 0 },
      // Revenue and distance data
      tripCost: trip.tripCost,
      distanceMiles: trip.distanceMiles,
      insurancePayRate: trip.insurancePayRate,
      perMileRate: trip.perMileRate
    }));
  } catch (error) {
    console.error('Error fetching requests by IDs:', error);
    return [];
  }
}

async function getCompletedTripsInRange(startTime: Date, endTime: Date, agencyId?: string): Promise<any[]> {
  try {
    const prisma = databaseManager.getCenterDB();
    
    const whereClause: any = {
      status: 'COMPLETED',
      completionTimestamp: {
        gte: startTime,
        lte: endTime
      }
    };

    // If agencyId is provided, filter by assigned agency
    if (agencyId) {
      whereClause.assignedAgencyId = agencyId;
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      select: {
        id: true,
        transportLevel: true,
        priority: true,
        completionTimestamp: true,
        tripCost: true,
        distanceMiles: true,
        responseTimeMinutes: true,
        actualTripTimeMinutes: true,
        assignedAgencyId: true,
        // New analytics fields
        loadedMiles: true,
        customerSatisfaction: true,
        efficiency: true,
        performanceScore: true,
        revenuePerHour: true,
        backhaulOpportunity: true
      }
    });

    return trips.map(trip => ({
      id: trip.id,
      transportLevel: trip.transportLevel,
      priority: trip.priority,
      completedAt: trip.completionTimestamp,
      revenue: trip.tripCost || 0,
      miles: trip.distanceMiles || 0,
      loadedMiles: trip.loadedMiles || trip.distanceMiles || 0, // Use stored loadedMiles if available
      responseTimeMinutes: trip.responseTimeMinutes || 0,
      actualTripTimeMinutes: trip.actualTripTimeMinutes || 0,
      assignedAgencyId: trip.assignedAgencyId,
      // New analytics fields
      customerSatisfaction: trip.customerSatisfaction,
      efficiency: trip.efficiency,
      performanceScore: trip.performanceScore,
      revenuePerHour: trip.revenuePerHour,
      backhaulOpportunity: trip.backhaulOpportunity
    }));
  } catch (error) {
    console.error('Error fetching completed trips in range:', error);
    return [];
  }
}

function calculateTripRevenue(trip: any): number {
  // Use stored trip cost if available
  if (trip.tripCost && trip.tripCost > 0) {
    return Number(trip.tripCost);
  }

  // Use stored revenue if available (new field)
  if (trip.revenue && trip.revenue > 0) {
    return Number(trip.revenue);
  }

  // Fallback to calculated revenue
  const baseRates = { 'BLS': 150.0, 'ALS': 250.0, 'CCT': 400.0 };
  const baseRate = baseRates[trip.transportLevel as keyof typeof baseRates] || 150.0;
  const priorityMultipliers = { 'LOW': 1.0, 'MEDIUM': 1.1, 'HIGH': 1.25, 'URGENT': 1.5 };
  const multiplier = priorityMultipliers[trip.priority as keyof typeof priorityMultipliers] || 1.0;
  return baseRate * multiplier;
}

function calculateTripMiles(trip: any): number {
  return trip.distanceMiles || trip.miles || 0;
}

function calculateLoadedMiles(trip: any): number {
  // Use stored loadedMiles if available (new field)
  if (trip.loadedMiles && trip.loadedMiles > 0) {
    return Number(trip.loadedMiles);
  }
  
  // Fallback to calculated loaded miles (same as total miles for now)
  return trip.distanceMiles || trip.miles || 0;
}

async function getPerformanceMetrics(startTime: Date, endTime: Date, unitId?: string): Promise<any> {
  try {
    const prisma = databaseManager.getCenterDB();
    
    const whereClause: any = {
      status: 'COMPLETED',
      completionTimestamp: {
        gte: startTime,
        lte: endTime
      }
    };

    // If unitId is provided, filter by assigned unit
    if (unitId) {
      whereClause.assignedUnitId = unitId;
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      select: {
        id: true,
        tripCost: true,
        responseTimeMinutes: true,
        actualTripTimeMinutes: true,
        completionTimestamp: true,
        createdAt: true
      }
    });

    const totalTrips = trips.length;
    const completedTrips = trips.filter(trip => trip.completionTimestamp).length;
    
    const totalRevenue = trips.reduce((sum, trip) => sum + (Number(trip.tripCost) || 0), 0);
    
    const responseTimes = trips
      .filter(trip => trip.responseTimeMinutes)
      .map(trip => trip.responseTimeMinutes!);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const tripTimes = trips
      .filter(trip => trip.actualTripTimeMinutes)
      .map(trip => trip.actualTripTimeMinutes!);
    const averageTripTime = tripTimes.length > 0 
      ? tripTimes.reduce((sum, time) => sum + time, 0) / tripTimes.length 
      : 0;

    const efficiency = totalTrips > 0 ? completedTrips / totalTrips : 0;

    return {
      totalTrips,
      completedTrips,
      averageResponseTime,
      averageTripTime,
      totalRevenue,
      efficiency,
      customerSatisfaction: 4.2 // Placeholder - would need customer feedback system
    };
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return {
      totalTrips: 0,
      completedTrips: 0,
      averageResponseTime: 0,
      averageTripTime: 0,
      totalRevenue: 0,
      efficiency: 0,
      customerSatisfaction: 0
    };
  }
}

export default router;
