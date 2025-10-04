"use strict";
/**
 * Distance Calculation Service
 * Calculates distances between hospitals and EMS agencies for filtering
 */
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
exports.DistanceService = void 0;
var DistanceService = /** @class */ (function () {
    function DistanceService() {
    }
    /**
     * Calculate distance between two points using Haversine formula
     * @param point1 First location
     * @param point2 Second location
     * @returns Distance in miles
     */
    DistanceService.calculateDistance = function (point1, point2) {
        var R = 3959; // Earth's radius in miles
        var dLat = this.toRadians(point2.latitude - point1.latitude);
        var dLon = this.toRadians(point2.longitude - point1.longitude);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    /**
     * Convert degrees to radians
     */
    DistanceService.toRadians = function (degrees) {
        return degrees * (Math.PI / 180);
    };
    /**
     * Filter agencies within specified radius
     * @param hospitalLocation Hospital location
     * @param agencies Array of agencies with location data
     * @param radiusMiles Radius in miles (default: 100)
     * @returns Agencies within radius, sorted by distance
     */
    DistanceService.filterAgenciesByDistance = function (hospitalLocation, agencies, radiusMiles) {
        var _this = this;
        if (radiusMiles === void 0) { radiusMiles = 100; }
        return agencies
            .filter(function (agency) {
            return agency.latitude !== null &&
                agency.longitude !== null &&
                agency.availableUnits > 0;
        })
            .map(function (agency) {
            var distance = _this.calculateDistance(hospitalLocation, { latitude: agency.latitude, longitude: agency.longitude });
            return {
                id: agency.id,
                name: agency.name,
                distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
                availableUnits: agency.availableUnits,
                totalUnits: agency.totalUnits,
                capabilities: agency.capabilities,
                contactInfo: {
                    phone: agency.phone,
                    email: agency.email,
                    city: agency.city,
                    state: agency.state
                }
            };
        })
            .filter(function (agency) { return agency.distance <= radiusMiles; })
            .sort(function (a, b) { return a.distance - b.distance; });
    };
    /**
     * Get agencies within radius for a specific hospital
     * @param hospitalId Hospital ID
     * @param radiusMiles Radius in miles
     * @returns Promise of agencies within radius
     */
    DistanceService.getAgenciesForHospital = function (hospitalId_1) {
        return __awaiter(this, arguments, void 0, function (hospitalId, radiusMiles) {
            if (radiusMiles === void 0) { radiusMiles = 100; }
            return __generator(this, function (_a) {
                // This would be implemented with actual database queries
                // For now, returning empty array as placeholder
                return [2 /*return*/, []];
            });
        });
    };
    return DistanceService;
}());
exports.DistanceService = DistanceService;
