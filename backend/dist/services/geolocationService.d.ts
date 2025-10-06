/**
 * Geolocation Service
 * Handles GPS coordinate lookup and distance calculations for trips
 */
export interface FacilityLocation {
    latitude: number;
    longitude: number;
    name: string;
}
export interface TripLocationData {
    originLatitude: number;
    originLongitude: number;
    destinationLatitude: number;
    destinationLongitude: number;
    distanceMiles: number;
    estimatedTripTimeMinutes: number;
    tripCost: number;
}
export declare class GeolocationService {
    private static facilityLocations;
    /**
     * Find facility location by name
     */
    static findFacilityLocation(facilityName: string): FacilityLocation | null;
    /**
     * Calculate trip cost based on distance and transport level
     */
    static calculateTripCost(distance: number, transportLevel: string): number;
    /**
     * Estimate trip time based on distance
     */
    static estimateTripTime(distance: number): number;
    /**
     * Get location data for a trip
     */
    static getTripLocationData(fromLocation: string, toLocation: string, transportLevel: string): TripLocationData | null;
    /**
     * Add a new facility location
     */
    static addFacilityLocation(name: string, latitude: number, longitude: number): void;
    /**
     * Get all facility locations
     */
    static getAllFacilityLocations(): Record<string, FacilityLocation>;
}
//# sourceMappingURL=geolocationService.d.ts.map