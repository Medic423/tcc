import express from 'express';
import { RevenueOptimizer } from '../services/revenueOptimizer';
import { BackhaulDetector } from '../services/backhaulDetector';
import { databaseManager } from '../services/databaseManager';

const router = express.Router();

// Initialize optimization services
const revenueOptimizer = new RevenueOptimizer(databaseManager);
const backhaulDetector = new BackhaulDetector();

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

    // Calculate metrics
    const totalRevenue = trips.reduce((sum, trip) => sum + calculateTripRevenue(trip), 0);
    const totalMiles = trips.reduce((sum, trip) => sum + calculateTripMiles(trip), 0);
    const loadedMiles = trips.reduce((sum, trip) => sum + calculateLoadedMiles(trip), 0);
    const loadedMileRatio = totalMiles > 0 ? loadedMiles / totalMiles : 0;
    const revenuePerHour = totalRevenue / (timeRange / (1000 * 60 * 60));

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

// Helper functions (these would be implemented based on your database schema)

async function getUnitById(unitId: string): Promise<any> {
  // Mock implementation - replace with actual database query
  return {
    id: unitId,
    agencyId: 'agency-001',
    unitNumber: 'A-101',
    type: 'AMBULANCE',
    capabilities: ['BLS', 'ALS'],
    currentStatus: 'AVAILABLE',
    currentLocation: { lat: 40.7128, lng: -74.0060 },
    shiftStart: new Date(),
    shiftEnd: new Date(Date.now() + 8 * 60 * 60 * 1000),
    isActive: true
  };
}

async function getRequestsByIds(requestIds: string[]): Promise<any[]> {
  // Mock implementation - replace with actual database query
  return requestIds.map((id, index) => ({
    id,
    patientId: `patient-${id}`,
    originFacilityId: 'facility-001',
    destinationFacilityId: 'facility-002',
    transportLevel: ['BLS', 'ALS', 'CCT'][index % 3],
    priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][index % 4],
    status: 'PENDING',
    specialRequirements: index % 2 === 0 ? 'Special requirements' : '',
    requestTimestamp: new Date(),
    readyStart: new Date(Date.now() + 30 * 60 * 1000),
    readyEnd: new Date(Date.now() + 60 * 60 * 1000),
    originLocation: { lat: 40.7128 + (index * 0.01), lng: -74.0060 + (index * 0.01) },
    destinationLocation: { lat: 40.7589 + (index * 0.01), lng: -73.9851 + (index * 0.01) }
  }));
}

async function getCompletedTripsInRange(startTime: Date, endTime: Date, agencyId?: string): Promise<any[]> {
  // Mock implementation - replace with actual database query
  return [
    {
      id: 'trip-001',
      transportLevel: 'BLS',
      priority: 'MEDIUM',
      completedAt: new Date(),
      revenue: 150.0,
      miles: 5.2,
      loadedMiles: 4.8
    },
    {
      id: 'trip-002',
      transportLevel: 'ALS',
      priority: 'HIGH',
      completedAt: new Date(),
      revenue: 275.0,
      miles: 8.1,
      loadedMiles: 7.5
    }
  ];
}

function calculateTripRevenue(trip: any): number {
  const baseRates = { 'BLS': 150.0, 'ALS': 250.0, 'CCT': 400.0 };
  const baseRate = baseRates[trip.transportLevel as keyof typeof baseRates] || 150.0;
  const priorityMultipliers = { 'LOW': 1.0, 'MEDIUM': 1.1, 'HIGH': 1.25, 'URGENT': 1.5 };
  const multiplier = priorityMultipliers[trip.priority as keyof typeof priorityMultipliers] || 1.0;
  return baseRate * multiplier;
}

function calculateTripMiles(trip: any): number {
  return trip.miles || 0;
}

function calculateLoadedMiles(trip: any): number {
  return trip.loadedMiles || 0;
}

async function getPerformanceMetrics(startTime: Date, endTime: Date, unitId?: string): Promise<any> {
  // Mock implementation - replace with actual database query
  return {
    totalTrips: 15,
    completedTrips: 12,
    averageResponseTime: 8.5, // minutes
    averageTripTime: 45.2, // minutes
    totalRevenue: 2250.0,
    efficiency: 0.85,
    customerSatisfaction: 4.2
  };
}

export default router;
