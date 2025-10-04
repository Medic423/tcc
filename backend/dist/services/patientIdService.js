"use strict";
/**
 * Patient ID Generation Service
 * Generates HIPAA-compliant patient IDs for trip requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.URGENCY_OPTIONS = exports.TRANSPORT_LEVEL_OPTIONS = exports.MOBILITY_OPTIONS = exports.DIAGNOSIS_OPTIONS = exports.PatientIdService = void 0;
var PatientIdService = /** @class */ (function () {
    function PatientIdService() {
    }
    /**
     * Generate a unique patient ID in the format: PMTC + timestamp + random
     * Example: PMTC1NJKZ, PMTC2ABC3, etc.
     */
    PatientIdService.generatePatientId = function () {
        var timestamp = Date.now().toString(36);
        var random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return "PMTC".concat(timestamp).concat(random).toUpperCase();
    };
    /**
     * Validate patient ID format
     */
    PatientIdService.isValidPatientId = function (patientId) {
        var pattern = /^PMTC[A-Z0-9]{8,12}$/;
        return pattern.test(patientId);
    };
    /**
     * Generate QR code data for patient tracking
     */
    PatientIdService.generateQRCodeData = function (tripId, patientId) {
        // In a real implementation, this would be a URL to a patient tracking page
        // For now, we'll create a simple encoded string
        var baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return "".concat(baseUrl, "/trip-tracking/").concat(tripId, "?patient=").concat(patientId);
    };
    return PatientIdService;
}());
exports.PatientIdService = PatientIdService;
/**
 * Diagnosis options for the dropdown
 */
exports.DIAGNOSIS_OPTIONS = [
    'UTI',
    'Dialysis',
    'Cardiac',
    'Respiratory',
    'Neurological',
    'Orthopedic',
    'General Medical',
    'Other'
];
/**
 * Mobility level options
 */
exports.MOBILITY_OPTIONS = [
    'Ambulatory',
    'Wheelchair',
    'Stretcher',
    'Bed'
];
/**
 * Transport level options
 */
exports.TRANSPORT_LEVEL_OPTIONS = [
    'BLS',
    'ALS',
    'CCT',
    'Other'
];
/**
 * Urgency level options
 */
exports.URGENCY_OPTIONS = [
    'Routine',
    'Urgent',
    'Emergent'
];
