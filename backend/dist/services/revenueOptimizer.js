"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueOptimizer = void 0;
var RevenueOptimizer = /** @class */ (function () {
    function RevenueOptimizer(databaseManager, customWeights) {
        this.databaseManager = databaseManager;
        // Default weights based on industry standards and reference documents
        this.weights = __assign({ deadheadMiles: 0.5, waitTime: 0.1, backhaulBonus: 25.0, overtimeRisk: 2.0, baseRevenue: 1.0 }, customWeights);
    }
    /**
     * Calculate optimization score for a unit-request assignment
     * Formula: score(u, r, t_now) = revenue(r) - α*deadhead_miles - β*wait_time + γ*backhaul_bonus - δ*overtime_risk
     */
    RevenueOptimizer.prototype.calculateScore = function (unit, request, currentTime) {
        var revenue = this.calculateRevenue(request);
        var deadheadMiles = this.calculateDeadheadMiles(unit, request);
        var waitTime = this.calculateWaitTime(unit, request, currentTime);
        var backhaulBonus = this.calculateBackhaulBonus(unit, request);
        var overtimeRisk = this.calculateOvertimeRisk(unit, request, currentTime);
        var score = revenue
            - (this.weights.deadheadMiles * deadheadMiles)
            - (this.weights.waitTime * waitTime)
            + (this.weights.backhaulBonus * backhaulBonus)
            - (this.weights.overtimeRisk * overtimeRisk);
        return Math.round(score * 100) / 100; // Round to 2 decimal places
    };
    /**
     * Calculate base revenue for a transport request
     */
    RevenueOptimizer.prototype.calculateRevenue = function (request) {
        // If insurance-specific pricing is available, use it
        if (request.insurancePayRate && request.perMileRate && request.distanceMiles) {
            var baseRevenue = request.insurancePayRate;
            var mileageRevenue = request.perMileRate * request.distanceMiles;
            // Priority multipliers still apply
            var priorityMultipliers_1 = {
                'LOW': 1.0,
                'MEDIUM': 1.1,
                'HIGH': 1.25,
                'URGENT': 1.5
            };
            var priorityMultiplier_1 = priorityMultipliers_1[request.priority] || 1.0;
            // Special requirements surcharge
            var specialSurcharge_1 = request.specialRequirements ? 50.0 : 0.0;
            return (baseRevenue + mileageRevenue + specialSurcharge_1) * priorityMultiplier_1 * this.weights.baseRevenue;
        }
        // Fallback to standard rates if insurance pricing not available
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
        // Special requirements surcharge
        var specialSurcharge = request.specialRequirements ? 50.0 : 0.0;
        return (baseRate * priorityMultiplier + specialSurcharge) * this.weights.baseRevenue;
    };
    /**
     * Calculate deadhead miles (empty miles) to reach the request
     */
    RevenueOptimizer.prototype.calculateDeadheadMiles = function (unit, request) {
        return this.calculateDistance(unit.currentLocation, request.originLocation);
    };
    /**
     * Calculate wait time in minutes
     */
    RevenueOptimizer.prototype.calculateWaitTime = function (unit, request, currentTime) {
        var travelTime = this.calculateTravelTime(unit.currentLocation, request.originLocation);
        var arrivalTime = new Date(currentTime.getTime() + (travelTime * 60000));
        // If we arrive before ready time, calculate wait
        if (arrivalTime < request.readyStart) {
            return (request.readyStart.getTime() - arrivalTime.getTime()) / 60000;
        }
        return 0; // No wait time if arriving after ready time
    };
    /**
     * Calculate backhaul bonus (simplified - will be enhanced by BackhaulDetector)
     */
    RevenueOptimizer.prototype.calculateBackhaulBonus = function (unit, request) {
        // This is a simplified version - the full backhaul detection will be in BackhaulDetector
        // For now, return 0 - this will be calculated when we have multiple requests
        return 0;
    };
    /**
     * Calculate overtime risk penalty
     */
    RevenueOptimizer.prototype.calculateOvertimeRisk = function (unit, request, currentTime) {
        // If no shift end time is available, assume no overtime risk
        if (!unit.shiftEnd) {
            return 0;
        }
        var estimatedTripTime = this.calculateTripTime(request);
        var estimatedCompletionTime = new Date(currentTime.getTime() + (estimatedTripTime * 60000));
        // Check if completion would be after shift end
        if (estimatedCompletionTime > unit.shiftEnd) {
            var overtimeHours = (estimatedCompletionTime.getTime() - unit.shiftEnd.getTime()) / (1000 * 60 * 60);
            return overtimeHours;
        }
        return 0;
    };
    /**
     * Calculate distance between two points using Haversine formula
     */
    RevenueOptimizer.prototype.calculateDistance = function (point1, point2) {
        var R = 3959; // Earth's radius in miles
        var dLat = this.toRadians(point2.lat - point1.lat);
        var dLng = this.toRadians(point2.lng - point1.lng);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    /**
     * Calculate travel time in minutes (assuming average speed of 30 mph)
     */
    RevenueOptimizer.prototype.calculateTravelTime = function (point1, point2) {
        var distance = this.calculateDistance(point1, point2);
        var averageSpeed = 30; // mph
        return (distance / averageSpeed) * 60; // Convert to minutes
    };
    /**
     * Calculate total trip time including pickup and delivery
     */
    RevenueOptimizer.prototype.calculateTripTime = function (request) {
        var pickupTime = this.calculateTravelTime(request.originLocation, request.destinationLocation);
        var serviceTime = 15; // 15 minutes for patient loading/unloading
        return pickupTime + serviceTime;
    };
    /**
     * Convert degrees to radians
     */
    RevenueOptimizer.prototype.toRadians = function (degrees) {
        return degrees * (Math.PI / 180);
    };
    /**
     * Get current optimization weights
     */
    RevenueOptimizer.prototype.getWeights = function () {
        return __assign({}, this.weights);
    };
    /**
     * Update optimization weights
     */
    RevenueOptimizer.prototype.updateWeights = function (newWeights) {
        this.weights = __assign(__assign({}, this.weights), newWeights);
    };
    /**
     * Validate that a unit can handle a request (capabilities, status, etc.)
     */
    RevenueOptimizer.prototype.canHandleRequest = function (unit, request) {
        // Check if unit is available
        if (unit.currentStatus !== 'AVAILABLE' && unit.currentStatus !== 'ON_CALL') {
            return false;
        }
        // Check if unit has required capabilities
        var requiredCapabilities = this.getRequiredCapabilities(request.transportLevel);
        var hasCapabilities = requiredCapabilities.every(function (cap) {
            return unit.capabilities.includes(cap);
        });
        if (!hasCapabilities) {
            return false;
        }
        // Check if unit is active
        if (!unit.isActive) {
            return false;
        }
        return true;
    };
    /**
     * Get required capabilities for a transport level
     */
    RevenueOptimizer.prototype.getRequiredCapabilities = function (transportLevel) {
        var capabilityMap = {
            'BLS': ['BLS'],
            'ALS': ['BLS', 'ALS'],
            'CCT': ['BLS', 'ALS', 'CCT']
        };
        return capabilityMap[transportLevel] || ['BLS'];
    };
    return RevenueOptimizer;
}());
exports.RevenueOptimizer = RevenueOptimizer;
