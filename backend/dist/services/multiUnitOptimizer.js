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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiUnitOptimizer = void 0;
var MultiUnitOptimizer = /** @class */ (function () {
    function MultiUnitOptimizer(revenueOptimizer, backhaulDetector, constraints) {
        this.revenueOptimizer = revenueOptimizer;
        this.backhaulDetector = backhaulDetector;
        this.constraints = __assign({ maxUnitsPerRequest: 1, maxRequestsPerUnit: 5, maxTotalDeadheadMiles: 100, maxTotalWaitTime: 300, requireBackhaulOptimization: true, minEfficiencyThreshold: 0.7 }, constraints);
    }
    /**
     * Optimize assignments across multiple units
     */
    MultiUnitOptimizer.prototype.optimizeMultiUnit = function (units_1, requests_1) {
        return __awaiter(this, arguments, void 0, function (units, requests, currentTime) {
            var availableUnits, pendingRequests, backhaulPairs, optimizationMatrix, optimizedAssignments, totalRevenue, totalDeadheadMiles, totalWaitTime, totalEfficiency, totalMiles, loadedMileRatio, totalHours, revenuePerUnitHour, pairedTripsPercentage, averageResponseTime;
            if (currentTime === void 0) { currentTime = new Date(); }
            return __generator(this, function (_a) {
                availableUnits = units.filter(function (unit) {
                    return unit.isActive &&
                        (unit.currentStatus === 'AVAILABLE' || unit.currentStatus === 'ON_CALL');
                });
                if (availableUnits.length === 0) {
                    throw new Error('No available units for optimization');
                }
                pendingRequests = requests.filter(function (req) { return req.status === 'PENDING'; });
                if (pendingRequests.length === 0) {
                    throw new Error('No pending requests for optimization');
                }
                backhaulPairs = this.backhaulDetector.findPairs(pendingRequests);
                optimizationMatrix = this.createOptimizationMatrix(availableUnits, pendingRequests, currentTime);
                optimizedAssignments = [];
                if (this.constraints.requireBackhaulOptimization && backhaulPairs.length > 0) {
                    optimizedAssignments = this.optimizeWithBackhaul(optimizationMatrix, backhaulPairs, availableUnits, pendingRequests);
                }
                else {
                    optimizedAssignments = this.optimizeWithoutBackhaul(optimizationMatrix, availableUnits, pendingRequests);
                }
                totalRevenue = optimizedAssignments.reduce(function (sum, assignment) { return sum + assignment.revenue; }, 0);
                totalDeadheadMiles = optimizedAssignments.reduce(function (sum, assignment) { return sum + assignment.deadheadMiles; }, 0);
                totalWaitTime = optimizedAssignments.reduce(function (sum, assignment) { return sum + assignment.waitTime; }, 0);
                totalEfficiency = optimizedAssignments.length > 0
                    ? optimizedAssignments.reduce(function (sum, assignment) { return sum + assignment.efficiency; }, 0) / optimizedAssignments.length
                    : 0;
                totalMiles = totalDeadheadMiles + this.calculateLoadedMiles(optimizedAssignments);
                loadedMileRatio = totalMiles > 0 ? (totalMiles - totalDeadheadMiles) / totalMiles : 0;
                totalHours = this.calculateTotalHours(optimizedAssignments);
                revenuePerUnitHour = totalHours > 0 ? totalRevenue / totalHours : 0;
                pairedTripsPercentage = this.calculatePairedTripsPercentage(optimizedAssignments, backhaulPairs);
                averageResponseTime = this.calculateAverageResponseTime(optimizedAssignments, currentTime);
                return [2 /*return*/, {
                        totalRevenue: totalRevenue,
                        totalDeadheadMiles: totalDeadheadMiles,
                        totalWaitTime: totalWaitTime,
                        totalEfficiency: totalEfficiency,
                        unitAssignments: optimizedAssignments.map(function (assignment) {
                            var _a;
                            return (__assign(__assign({}, assignment), { unitNumber: ((_a = availableUnits.find(function (unit) { return unit.id === assignment.unitId; })) === null || _a === void 0 ? void 0 : _a.unitNumber) || 'Unknown' }));
                        }),
                        backhaulPairs: backhaulPairs.slice(0, 10), // Top 10 pairs
                        globalOptimization: {
                            loadedMileRatio: loadedMileRatio,
                            revenuePerUnitHour: revenuePerUnitHour,
                            pairedTripsPercentage: pairedTripsPercentage,
                            averageResponseTime: averageResponseTime
                        }
                    }];
            });
        });
    };
    /**
     * Create optimization matrix for all unit-request combinations
     */
    MultiUnitOptimizer.prototype.createOptimizationMatrix = function (units, requests, currentTime) {
        var matrix = [];
        for (var _i = 0, units_1 = units; _i < units_1.length; _i++) {
            var unit = units_1[_i];
            for (var _a = 0, requests_1 = requests; _a < requests_1.length; _a++) {
                var request = requests_1[_a];
                var canHandle = this.revenueOptimizer.canHandleRequest(unit, request);
                var score = canHandle ? this.revenueOptimizer.calculateScore(unit, request, currentTime) : 0;
                var revenue = this.revenueOptimizer.calculateRevenue(request);
                var deadheadMiles = this.revenueOptimizer.calculateDeadheadMiles(unit, request);
                var waitTime = this.revenueOptimizer.calculateWaitTime(unit, request, currentTime);
                var overtimeRisk = this.revenueOptimizer.calculateOvertimeRisk(unit, request, currentTime);
                matrix.push({
                    unitId: unit.id,
                    requestId: request.id,
                    score: score,
                    revenue: revenue,
                    deadheadMiles: deadheadMiles,
                    waitTime: waitTime,
                    overtimeRisk: overtimeRisk,
                    canHandle: canHandle
                });
            }
        }
        return matrix.sort(function (a, b) { return b.score - a.score; });
    };
    /**
     * Optimize with backhaul consideration
     */
    MultiUnitOptimizer.prototype.optimizeWithBackhaul = function (matrix, backhaulPairs, units, requests) {
        var _this = this;
        var assignments = [];
        var assignedRequests = new Set();
        var unitAssignments = new Map();
        // Initialize unit assignments
        for (var _i = 0, units_2 = units; _i < units_2.length; _i++) {
            var unit = units_2[_i];
            unitAssignments.set(unit.id, []);
        }
        var _loop_1 = function (pair) {
            if (assignedRequests.has(pair.request1.id) || assignedRequests.has(pair.request2.id)) {
                return "continue";
            }
            // Find best unit for this pair
            var bestUnitId = '';
            var bestScore = -Infinity;
            var _loop_4 = function (unit) {
                var currentAssignments = unitAssignments.get(unit.id) || [];
                if (currentAssignments.length >= this_1.constraints.maxRequestsPerUnit) {
                    return "continue";
                }
                // Calculate combined score for both requests
                var request1Score = matrix.find(function (m) { return m.unitId === unit.id && m.requestId === pair.request1.id; });
                var request2Score = matrix.find(function (m) { return m.unitId === unit.id && m.requestId === pair.request2.id; });
                if ((request1Score === null || request1Score === void 0 ? void 0 : request1Score.canHandle) && (request2Score === null || request2Score === void 0 ? void 0 : request2Score.canHandle)) {
                    var combinedScore = request1Score.score + request2Score.score + pair.revenueBonus;
                    if (combinedScore > bestScore) {
                        bestScore = combinedScore;
                        bestUnitId = unit.id;
                    }
                }
            };
            for (var _e = 0, units_3 = units; _e < units_3.length; _e++) {
                var unit = units_3[_e];
                _loop_4(unit);
            }
            if (bestUnitId) {
                var unitAssignmentsList = unitAssignments.get(bestUnitId) || [];
                unitAssignmentsList.push(pair.request1, pair.request2);
                unitAssignments.set(bestUnitId, unitAssignmentsList);
                assignedRequests.add(pair.request1.id);
                assignedRequests.add(pair.request2.id);
            }
        };
        var this_1 = this;
        // Process backhaul pairs first (highest priority)
        for (var _a = 0, backhaulPairs_1 = backhaulPairs; _a < backhaulPairs_1.length; _a++) {
            var pair = backhaulPairs_1[_a];
            _loop_1(pair);
        }
        var _loop_2 = function (entry) {
            if (assignedRequests.has(entry.requestId) || !entry.canHandle) {
                return "continue";
            }
            var currentAssignments = unitAssignments.get(entry.unitId) || [];
            if (currentAssignments.length >= this_2.constraints.maxRequestsPerUnit) {
                return "continue";
            }
            var request = requests.find(function (req) { return req.id === entry.requestId; });
            if (request) {
                currentAssignments.push(request);
                unitAssignments.set(entry.unitId, currentAssignments);
                assignedRequests.add(entry.requestId);
            }
        };
        var this_2 = this;
        // Process remaining individual requests
        for (var _b = 0, matrix_1 = matrix; _b < matrix_1.length; _b++) {
            var entry = matrix_1[_b];
            _loop_2(entry);
        }
        var _loop_3 = function (unitId, assignedRequestsList) {
            if (assignedRequestsList.length > 0) {
                var revenue = assignedRequestsList.reduce(function (sum, req) {
                    return sum + _this.revenueOptimizer.calculateRevenue(req);
                }, 0);
                var deadheadMiles = assignedRequestsList.reduce(function (sum, req) {
                    var unit = units.find(function (u) { return u.id === unitId; });
                    return unit ? sum + _this.revenueOptimizer.calculateDeadheadMiles(unit, req) : sum;
                }, 0);
                var waitTime = assignedRequestsList.reduce(function (sum, req) {
                    var unit = units.find(function (u) { return u.id === unitId; });
                    return unit ? sum + _this.revenueOptimizer.calculateWaitTime(unit, req, new Date()) : sum;
                }, 0);
                var efficiency = this_3.calculateAssignmentEfficiency(assignedRequestsList, deadheadMiles, waitTime);
                var score = assignedRequestsList.reduce(function (sum, req) {
                    var unit = units.find(function (u) { return u.id === unitId; });
                    return unit ? sum + _this.revenueOptimizer.calculateScore(unit, req, new Date()) : sum;
                }, 0);
                assignments.push({
                    unitId: unitId,
                    assignedRequests: assignedRequestsList,
                    revenue: revenue,
                    deadheadMiles: deadheadMiles,
                    waitTime: waitTime,
                    efficiency: efficiency,
                    score: score
                });
            }
        };
        var this_3 = this;
        // Convert to result format
        for (var _c = 0, unitAssignments_1 = unitAssignments; _c < unitAssignments_1.length; _c++) {
            var _d = unitAssignments_1[_c], unitId = _d[0], assignedRequestsList = _d[1];
            _loop_3(unitId, assignedRequestsList);
        }
        return assignments;
    };
    /**
     * Optimize without backhaul consideration
     */
    MultiUnitOptimizer.prototype.optimizeWithoutBackhaul = function (matrix, units, requests) {
        var _this = this;
        var assignments = [];
        var assignedRequests = new Set();
        var unitAssignments = new Map();
        // Initialize unit assignments
        for (var _i = 0, units_4 = units; _i < units_4.length; _i++) {
            var unit = units_4[_i];
            unitAssignments.set(unit.id, []);
        }
        var _loop_5 = function (entry) {
            if (assignedRequests.has(entry.requestId) || !entry.canHandle) {
                return "continue";
            }
            var currentAssignments = unitAssignments.get(entry.unitId) || [];
            if (currentAssignments.length >= this_4.constraints.maxRequestsPerUnit) {
                return "continue";
            }
            var request = requests.find(function (req) { return req.id === entry.requestId; });
            if (request) {
                currentAssignments.push(request);
                unitAssignments.set(entry.unitId, currentAssignments);
                assignedRequests.add(entry.requestId);
            }
        };
        var this_4 = this;
        // Assign requests to units based on highest scores
        for (var _a = 0, matrix_2 = matrix; _a < matrix_2.length; _a++) {
            var entry = matrix_2[_a];
            _loop_5(entry);
        }
        var _loop_6 = function (unitId, assignedRequestsList) {
            if (assignedRequestsList.length > 0) {
                var revenue = assignedRequestsList.reduce(function (sum, req) {
                    return sum + _this.revenueOptimizer.calculateRevenue(req);
                }, 0);
                var deadheadMiles = assignedRequestsList.reduce(function (sum, req) {
                    var unit = units.find(function (u) { return u.id === unitId; });
                    return unit ? sum + _this.revenueOptimizer.calculateDeadheadMiles(unit, req) : sum;
                }, 0);
                var waitTime = assignedRequestsList.reduce(function (sum, req) {
                    var unit = units.find(function (u) { return u.id === unitId; });
                    return unit ? sum + _this.revenueOptimizer.calculateWaitTime(unit, req, new Date()) : sum;
                }, 0);
                var efficiency = this_5.calculateAssignmentEfficiency(assignedRequestsList, deadheadMiles, waitTime);
                var score = assignedRequestsList.reduce(function (sum, req) {
                    var unit = units.find(function (u) { return u.id === unitId; });
                    return unit ? sum + _this.revenueOptimizer.calculateScore(unit, req, new Date()) : sum;
                }, 0);
                assignments.push({
                    unitId: unitId,
                    assignedRequests: assignedRequestsList,
                    revenue: revenue,
                    deadheadMiles: deadheadMiles,
                    waitTime: waitTime,
                    efficiency: efficiency,
                    score: score
                });
            }
        };
        var this_5 = this;
        // Convert to result format
        for (var _b = 0, unitAssignments_2 = unitAssignments; _b < unitAssignments_2.length; _b++) {
            var _c = unitAssignments_2[_b], unitId = _c[0], assignedRequestsList = _c[1];
            _loop_6(unitId, assignedRequestsList);
        }
        return assignments;
    };
    /**
     * Calculate assignment efficiency
     */
    MultiUnitOptimizer.prototype.calculateAssignmentEfficiency = function (requests, deadheadMiles, waitTime) {
        var _this = this;
        if (requests.length === 0)
            return 0;
        var totalRevenue = requests.reduce(function (sum, req) {
            return sum + _this.revenueOptimizer.calculateRevenue(req);
        }, 0);
        var totalMiles = deadheadMiles + this.calculateLoadedMilesForRequests(requests);
        var loadedMileRatio = totalMiles > 0 ? (totalMiles - deadheadMiles) / totalMiles : 0;
        var waitTimePenalty = Math.max(0, 1 - (waitTime / 120)); // Penalty for wait time > 2 hours
        var revenueEfficiency = totalRevenue / (requests.length * 200); // Normalize by expected revenue
        return (loadedMileRatio * 0.4 + waitTimePenalty * 0.3 + revenueEfficiency * 0.3);
    };
    /**
     * Calculate loaded miles for requests
     */
    MultiUnitOptimizer.prototype.calculateLoadedMilesForRequests = function (requests) {
        var _this = this;
        return requests.reduce(function (sum, req) {
            return sum + _this.revenueOptimizer.calculateDistance(req.originLocation, req.destinationLocation);
        }, 0);
    };
    /**
     * Calculate loaded miles for assignments
     */
    MultiUnitOptimizer.prototype.calculateLoadedMiles = function (assignments) {
        var _this = this;
        return assignments.reduce(function (sum, assignment) {
            return sum + _this.calculateLoadedMilesForRequests(assignment.assignedRequests);
        }, 0);
    };
    /**
     * Calculate total hours for assignments
     */
    MultiUnitOptimizer.prototype.calculateTotalHours = function (assignments) {
        return assignments.reduce(function (sum, assignment) {
            return sum + assignment.assignedRequests.length * 1.5; // Assume 1.5 hours per request
        }, 0);
    };
    /**
     * Calculate paired trips percentage
     */
    MultiUnitOptimizer.prototype.calculatePairedTripsPercentage = function (assignments, backhaulPairs) {
        var totalRequests = assignments.reduce(function (sum, assignment) {
            return sum + assignment.assignedRequests.length;
        }, 0);
        if (totalRequests === 0)
            return 0;
        var pairedRequests = backhaulPairs.length * 2; // Each pair has 2 requests
        return (pairedRequests / totalRequests) * 100;
    };
    /**
     * Calculate average response time
     */
    MultiUnitOptimizer.prototype.calculateAverageResponseTime = function (assignments, currentTime) {
        var totalResponseTime = 0;
        var requestCount = 0;
        for (var _i = 0, assignments_1 = assignments; _i < assignments_1.length; _i++) {
            var assignment = assignments_1[_i];
            for (var _a = 0, _b = assignment.assignedRequests; _a < _b.length; _a++) {
                var request = _b[_a];
                var responseTime = (currentTime.getTime() - request.requestTimestamp.getTime()) / (1000 * 60); // minutes
                totalResponseTime += responseTime;
                requestCount++;
            }
        }
        return requestCount > 0 ? totalResponseTime / requestCount : 0;
    };
    /**
     * Update constraints
     */
    MultiUnitOptimizer.prototype.updateConstraints = function (newConstraints) {
        this.constraints = __assign(__assign({}, this.constraints), newConstraints);
    };
    /**
     * Get current constraints
     */
    MultiUnitOptimizer.prototype.getConstraints = function () {
        return __assign({}, this.constraints);
    };
    return MultiUnitOptimizer;
}());
exports.MultiUnitOptimizer = MultiUnitOptimizer;
