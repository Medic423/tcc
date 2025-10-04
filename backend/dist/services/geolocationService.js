"use strict";
/**
 * Geolocation Service
 * Handles GPS coordinate lookup and distance calculations for trips
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeolocationService = void 0;
const distanceService_1 = require("./distanceService");
class GeolocationService {
    /**
     * Find facility location by name
     */
    static findFacilityLocation(facilityName) {
        if (!facilityName)
            return null;
        // Try exact match first
        if (this.facilityLocations[facilityName]) {
            return this.facilityLocations[facilityName];
        }
        // Try partial match
        for (const [key, location] of Object.entries(this.facilityLocations)) {
            if (facilityName.toLowerCase().includes(key.toLowerCase()) ||
                key.toLowerCase().includes(facilityName.toLowerCase())) {
                return location;
            }
        }
        return null;
    }
    /**
     * Calculate trip cost based on distance and transport level
     */
    static calculateTripCost(distance, transportLevel) {
        const baseRate = {
            'BLS': 2.50, // Basic Life Support
            'ALS': 3.75, // Advanced Life Support  
            'CCT': 5.00, // Critical Care Transport
            'Other': 2.50 // Default to BLS rate
        };
        const rate = baseRate[transportLevel] || baseRate['BLS'];
        return Math.round((distance * rate + 50) * 100) / 100; // $50 base fee + distance rate
    }
    /**
     * Estimate trip time based on distance
     */
    static estimateTripTime(distance) {
        // Assume average speed of 30 mph for medical transport
        const averageSpeed = 30;
        return Math.round((distance / averageSpeed) * 60); // Convert to minutes
    }
    /**
     * Get location data for a trip
     */
    static getTripLocationData(fromLocation, toLocation, transportLevel) {
        console.log('TCC_DEBUG: Getting location data for trip:', { fromLocation, toLocation, transportLevel });
        const originLocation = this.findFacilityLocation(fromLocation);
        const destinationLocation = this.findFacilityLocation(toLocation);
        if (!originLocation) {
            console.log('TCC_DEBUG: Origin location not found:', fromLocation);
            return null;
        }
        if (!destinationLocation) {
            console.log('TCC_DEBUG: Destination location not found:', toLocation);
            return null;
        }
        // Calculate distance
        const distance = distanceService_1.DistanceService.calculateDistance(originLocation, destinationLocation);
        console.log('TCC_DEBUG: Calculated distance:', distance, 'miles');
        // Calculate trip cost
        const tripCost = this.calculateTripCost(distance, transportLevel);
        console.log('TCC_DEBUG: Calculated trip cost:', tripCost);
        // Estimate trip time
        const estimatedTripTimeMinutes = this.estimateTripTime(distance);
        console.log('TCC_DEBUG: Estimated trip time:', estimatedTripTimeMinutes, 'minutes');
        return {
            originLatitude: originLocation.latitude,
            originLongitude: originLocation.longitude,
            destinationLatitude: destinationLocation.latitude,
            destinationLongitude: destinationLocation.longitude,
            distanceMiles: Math.round(distance * 10) / 10, // Round to 1 decimal place
            estimatedTripTimeMinutes,
            tripCost
        };
    }
    /**
     * Add a new facility location
     */
    static addFacilityLocation(name, latitude, longitude) {
        this.facilityLocations[name] = { latitude, longitude, name };
    }
    /**
     * Get all facility locations
     */
    static getAllFacilityLocations() {
        return { ...this.facilityLocations };
    }
}
exports.GeolocationService = GeolocationService;
// Mock facility locations (in production, these would come from a geocoding service)
GeolocationService.facilityLocations = {
    'UPMC Bedford': { latitude: 40.0158, longitude: -78.5047, name: 'UPMC Bedford' },
    'UPMC Altoona': { latitude: 40.5187, longitude: -78.3947, name: 'UPMC Altoona' },
    'UPMC Shadyside': { latitude: 40.4500, longitude: -79.9333, name: 'UPMC Shadyside' },
    'UPMC Presbyterian': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Presbyterian' },
    'UPMC Mercy': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Mercy' },
    'UPMC Children\'s Hospital': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Children\'s Hospital' },
    'UPMC Magee-Womens Hospital': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Magee-Womens Hospital' },
    'UPMC St. Margaret': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC St. Margaret' },
    'UPMC East': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC East' },
    'UPMC Passavant': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Passavant' },
    'UPMC McKeesport': { latitude: 40.3500, longitude: -79.8500, name: 'UPMC McKeesport' },
    'UPMC Horizon': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Horizon' },
    'UPMC Jameson': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Jameson' },
    'UPMC Northwest': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Northwest' },
    'UPMC Hamot': { latitude: 42.1292, longitude: -80.0851, name: 'UPMC Hamot' },
    'UPMC Chautauqua': { latitude: 42.1292, longitude: -80.0851, name: 'UPMC Chautauqua' },
    'UPMC Cole': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Cole' },
    'UPMC Kane': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Kane' },
    'UPMC Muncy': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Muncy' },
    'UPMC Wellsboro': { latitude: 40.4418, longitude: -79.9631, name: 'UPMC Wellsboro' },
    'Test Hospital': { latitude: 40.4418, longitude: -79.9631, name: 'Test Hospital' },
    'Altoona Regional Hospital': { latitude: 40.5187, longitude: -78.3947, name: 'Altoona Regional Hospital' },
    'Bedford Medical Center': { latitude: 40.0176, longitude: -78.5034, name: 'Bedford Medical Center' },
    'Altoona Rehabilitation Center': { latitude: 40.5100, longitude: -78.4000, name: 'Altoona Rehabilitation Center' }
};
//# sourceMappingURL=geolocationService.js.map