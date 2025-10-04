"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackhaulDetector = void 0;
var BackhaulDetector = /** @class */ (function () {
    function BackhaulDetector(maxTimeWindow, // 90 minutes as per reference documents
    maxDistance, // 15 miles as per reference documents
    revenueBonus // $25 bonus for backhaul pairs
    ) {
        if (maxTimeWindow === void 0) { maxTimeWindow = 90; }
        if (maxDistance === void 0) { maxDistance = 15; }
        if (revenueBonus === void 0) { revenueBonus = 25.0; }
        this.maxTimeWindow = maxTimeWindow;
        this.maxDistance = maxDistance;
        this.revenueBonus = revenueBonus;
    }
    /**
     * Find all possible backhaul pairs from a list of requests
     */
    BackhaulDetector.prototype.findPairs = function (requests) {
        var pairs = [];
        // Only consider pending requests
        var pendingRequests = requests.filter(function (req) { return req.status === 'PENDING'; });
        // Generate all possible pairs
        for (var i = 0; i < pendingRequests.length; i++) {
            for (var j = i + 1; j < pendingRequests.length; j++) {
                var request1 = pendingRequests[i];
                var request2 = pendingRequests[j];
                var pair = this.createPair(request1, request2);
                if (pair && this.isValidPair(pair)) {
                    pairs.push(pair);
                }
            }
        }
        // Sort by efficiency (highest first)
        return pairs.sort(function (a, b) { return b.efficiency - a.efficiency; });
    };
    /**
     * Create a backhaul pair from two requests
     */
    BackhaulDetector.prototype.createPair = function (request1, request2) {
        // Check for return trip scenario (destination of one matches origin of another)
        var isReturnTrip = this.isReturnTripScenario(request1, request2);
        var distance;
        if (isReturnTrip) {
            // For return trips, calculate distance from destination of first to origin of second
            distance = this.calculateDistance(request1.destinationLocation, request2.originLocation);
        }
        else {
            // For regular backhaul, calculate distance between destinations
            distance = this.calculateDistance(request1.destinationLocation, request2.destinationLocation);
        }
        // Calculate time window between ready times
        var timeWindow = this.calculateTimeWindow(request1, request2);
        // Calculate efficiency score (return trips get bonus)
        var efficiency = this.calculateEfficiency(request1, request2, distance, timeWindow, isReturnTrip);
        return {
            request1: request1,
            request2: request2,
            distance: distance,
            timeWindow: timeWindow,
            revenueBonus: isReturnTrip ? this.revenueBonus * 1.5 : this.revenueBonus, // 50% bonus for return trips
            efficiency: efficiency
        };
    };
    /**
     * Validate if a pair meets backhaul criteria
     */
    BackhaulDetector.prototype.isValidPair = function (pair) {
        return (pair.distance <= this.maxDistance &&
            pair.timeWindow <= this.maxTimeWindow &&
            this.hasCompatibleTransportLevels(pair.request1, pair.request2));
    };
    /**
     * Check if two requests have compatible transport levels
     */
    BackhaulDetector.prototype.hasCompatibleTransportLevels = function (request1, request2) {
        // For backhaul pairs, we need compatible transport levels
        // BLS can pair with BLS, ALS can pair with ALS or BLS, CCT can pair with any
        var levels = [request1.transportLevel, request2.transportLevel];
        if (levels.includes('CCT')) {
            return true; // CCT can handle any level
        }
        if (levels.includes('ALS')) {
            return true; // ALS can handle BLS or ALS
        }
        return levels.every(function (level) { return level === 'BLS'; }); // Both must be BLS
    };
    /**
     * Calculate distance between two points using Haversine formula
     */
    BackhaulDetector.prototype.calculateDistance = function (point1, point2) {
        var R = 3959; // Earth's radius in miles
        var dLat = this.toRadians(point2.lat - point1.lat);
        var dLng = this.toRadians(point2.lng - point1.lng);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100) / 100; // Round to 2 decimal places
    };
    /**
     * Calculate time window between two requests
     */
    BackhaulDetector.prototype.calculateTimeWindow = function (request1, request2) {
        var time1 = request1.readyStart.getTime();
        var time2 = request2.readyStart.getTime();
        return Math.abs(time2 - time1) / (1000 * 60); // Convert to minutes
    };
    /**
     * Check if this is a return trip scenario (destination of one matches origin of another)
     */
    BackhaulDetector.prototype.isReturnTripScenario = function (request1, request2) {
        // Check if destination of request1 matches origin of request2 (or vice versa)
        var dest1MatchesOrigin2 = this.locationsMatch(request1.destinationLocation, request2.originLocation);
        var dest2MatchesOrigin1 = this.locationsMatch(request2.destinationLocation, request1.originLocation);
        return dest1MatchesOrigin2 || dest2MatchesOrigin1;
    };
    /**
     * Check if two locations match (within 1 mile tolerance for GPS precision)
     */
    BackhaulDetector.prototype.locationsMatch = function (loc1, loc2) {
        var distance = this.calculateDistance(loc1, loc2);
        return distance <= 1.0; // Within 1 mile = same location
    };
    /**
     * Calculate efficiency score for a backhaul pair
     * Higher efficiency = better pairing
     */
    BackhaulDetector.prototype.calculateEfficiency = function (request1, request2, distance, timeWindow, isReturnTrip) {
        if (isReturnTrip === void 0) { isReturnTrip = false; }
        // Base efficiency from distance (closer = better)
        var distanceScore = Math.max(0, (this.maxDistance - distance) / this.maxDistance);
        // Time window efficiency (shorter window = better)
        var timeScore = Math.max(0, (this.maxTimeWindow - timeWindow) / this.maxTimeWindow);
        // Priority bonus (higher priority = better)
        var priorityScore = this.calculatePriorityScore(request1, request2);
        // Revenue potential (higher revenue = better)
        var revenueScore = this.calculateRevenueScore(request1, request2);
        // Return trip bonus (return trips are highly efficient)
        var returnTripBonus = isReturnTrip ? 0.3 : 0;
        // Weighted combination with return trip bonus
        return (distanceScore * 0.25 + timeScore * 0.15 + priorityScore * 0.25 + revenueScore * 0.15 + returnTripBonus);
    };
    /**
     * Calculate priority score for a pair
     */
    BackhaulDetector.prototype.calculatePriorityScore = function (request1, request2) {
        var priorityValues = {
            'LOW': 1,
            'MEDIUM': 2,
            'HIGH': 3,
            'URGENT': 4
        };
        var priority1 = priorityValues[request1.priority] || 1;
        var priority2 = priorityValues[request2.priority] || 1;
        // Average priority, normalized to 0-1
        return (priority1 + priority2) / 8; // Max possible is 8 (4+4)
    };
    /**
     * Calculate revenue score for a pair
     */
    BackhaulDetector.prototype.calculateRevenueScore = function (request1, request2) {
        var baseRates = {
            'BLS': 150.0,
            'ALS': 250.0,
            'CCT': 400.0
        };
        var revenue1 = baseRates[request1.transportLevel] || 150.0;
        var revenue2 = baseRates[request2.transportLevel] || 150.0;
        // Normalize to 0-1 (assuming max revenue is 400)
        return (revenue1 + revenue2) / 800;
    };
    /**
     * Find the best backhaul pairs for a specific request
     */
    BackhaulDetector.prototype.findBestPairsForRequest = function (request, allRequests) {
        var otherRequests = allRequests.filter(function (req) {
            return req.id !== request.id && req.status === 'PENDING';
        });
        var pairs = [];
        for (var _i = 0, otherRequests_1 = otherRequests; _i < otherRequests_1.length; _i++) {
            var otherRequest = otherRequests_1[_i];
            var pair = this.createPair(request, otherRequest);
            if (pair && this.isValidPair(pair)) {
                pairs.push(pair);
            }
        }
        return pairs.sort(function (a, b) { return b.efficiency - a.efficiency; });
    };
    /**
     * Find return trip opportunities for a specific request
     * This looks for requests that would bring the unit back to the original area
     */
    BackhaulDetector.prototype.findReturnTripOpportunities = function (request, allRequests) {
        var otherRequests = allRequests.filter(function (req) {
            return req.id !== request.id && req.status === 'PENDING';
        });
        var returnTrips = [];
        for (var _i = 0, otherRequests_2 = otherRequests; _i < otherRequests_2.length; _i++) {
            var otherRequest = otherRequests_2[_i];
            // Check if this would be a return trip
            var isReturnTrip = this.isReturnTripScenario(request, otherRequest);
            if (isReturnTrip) {
                var pair = this.createPair(request, otherRequest);
                if (pair && this.isValidPair(pair)) {
                    returnTrips.push(pair);
                }
            }
        }
        return returnTrips.sort(function (a, b) { return b.efficiency - a.efficiency; });
    };
    /**
     * Find all return trip opportunities in the system
     * This is specifically for scenarios like Altoona → Pittsburgh → Altoona
     */
    BackhaulDetector.prototype.findAllReturnTripOpportunities = function (allRequests) {
        var pendingRequests = allRequests.filter(function (req) { return req.status === 'PENDING'; });
        var returnTrips = [];
        for (var i = 0; i < pendingRequests.length; i++) {
            for (var j = i + 1; j < pendingRequests.length; j++) {
                var request1 = pendingRequests[i];
                var request2 = pendingRequests[j];
                var isReturnTrip = this.isReturnTripScenario(request1, request2);
                if (isReturnTrip) {
                    var pair = this.createPair(request1, request2);
                    if (pair && this.isValidPair(pair)) {
                        returnTrips.push(pair);
                    }
                }
            }
        }
        return returnTrips.sort(function (a, b) { return b.efficiency - a.efficiency; });
    };
    /**
     * Calculate potential revenue increase from backhaul pairing
     */
    BackhaulDetector.prototype.calculatePairingRevenue = function (pair) {
        // Base revenue from both requests
        var baseRevenue = this.calculateBaseRevenue(pair.request1) + this.calculateBaseRevenue(pair.request2);
        // Add backhaul bonus
        var totalRevenue = baseRevenue + pair.revenueBonus;
        // Calculate efficiency multiplier (better pairs get higher multiplier)
        var efficiencyMultiplier = 1 + (pair.efficiency * 0.2); // Up to 20% bonus
        return Math.round(totalRevenue * efficiencyMultiplier * 100) / 100;
    };
    /**
     * Calculate base revenue for a request
     */
    BackhaulDetector.prototype.calculateBaseRevenue = function (request) {
        var baseRates = {
            'BLS': 150.0,
            'ALS': 250.0,
            'CCT': 400.0
        };
        var baseRate = baseRates[request.transportLevel] || 150.0;
        // Priority multipliers
        var priorityMultipliers = {
            'LOW': 1.0,
            'MEDIUM': 1.1,
            'HIGH': 1.25,
            'URGENT': 1.5
        };
        var priorityMultiplier = priorityMultipliers[request.priority] || 1.0;
        return baseRate * priorityMultiplier;
    };
    /**
     * Get statistics about backhaul opportunities
     */
    BackhaulDetector.prototype.getBackhaulStatistics = function (requests) {
        var _this = this;
        var pendingRequests = requests.filter(function (req) { return req.status === 'PENDING'; });
        var pairs = this.findPairs(pendingRequests);
        var totalRequests = pendingRequests.length;
        var possiblePairs = (totalRequests * (totalRequests - 1)) / 2;
        var validPairs = pairs.length;
        var averageEfficiency = pairs.length > 0
            ? pairs.reduce(function (sum, pair) { return sum + pair.efficiency; }, 0) / pairs.length
            : 0;
        var potentialRevenueIncrease = pairs.reduce(function (sum, pair) {
            return sum + _this.calculatePairingRevenue(pair);
        }, 0);
        return {
            totalRequests: totalRequests,
            possiblePairs: possiblePairs,
            validPairs: validPairs,
            averageEfficiency: Math.round(averageEfficiency * 100) / 100,
            potentialRevenueIncrease: Math.round(potentialRevenueIncrease * 100) / 100
        };
    };
    /**
     * Convert degrees to radians
     */
    BackhaulDetector.prototype.toRadians = function (degrees) {
        return degrees * (Math.PI / 180);
    };
    /**
     * Update detection parameters
     */
    BackhaulDetector.prototype.updateParameters = function (maxTimeWindow, maxDistance, revenueBonus) {
        if (maxTimeWindow !== undefined)
            this.maxTimeWindow = maxTimeWindow;
        if (maxDistance !== undefined)
            this.maxDistance = maxDistance;
        if (revenueBonus !== undefined)
            this.revenueBonus = revenueBonus;
    };
    /**
     * Get current parameters
     */
    BackhaulDetector.prototype.getParameters = function () {
        return {
            maxTimeWindow: this.maxTimeWindow,
            maxDistance: this.maxDistance,
            revenueBonus: this.revenueBonus
        };
    };
    return BackhaulDetector;
}());
exports.BackhaulDetector = BackhaulDetector;
