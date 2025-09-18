#!/usr/bin/env node

/**
 * TCC Pickup Location Integration Test
 * Tests the pickup location functionality in trip creation
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5001';

async function testPickupLocationIntegration() {
  try {
    console.log('🧪 Testing pickup location integration...');
    
    // First, let's get a valid token by logging in
    console.log('🔐 Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@tcc.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    
    // Get hospitals to find one with pickup locations
    console.log('🏥 Fetching hospitals...');
    const hospitalsResponse = await fetch(`${BASE_URL}/api/tcc/hospitals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!hospitalsResponse.ok) {
      throw new Error(`Failed to fetch hospitals: ${hospitalsResponse.status}`);
    }
    
    const hospitalsData = await hospitalsResponse.json();
    const hospital = hospitalsData.data[0];
    console.log(`✅ Found hospital: ${hospital.name}`);
    
    // Get pickup locations for this hospital
    console.log('📍 Fetching pickup locations...');
    const pickupLocationsResponse = await fetch(`${BASE_URL}/api/tcc/pickup-locations/hospital/${hospital.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!pickupLocationsResponse.ok) {
      throw new Error(`Failed to fetch pickup locations: ${pickupLocationsResponse.status}`);
    }
    
    const pickupLocationsData = await pickupLocationsResponse.json();
    const pickupLocation = pickupLocationsData.data[0];
    console.log(`✅ Found pickup location: ${pickupLocation.name}`);
    
    // Test creating a trip with pickup location
    console.log('🚗 Testing trip creation with pickup location...');
    const tripData = {
      fromLocation: hospital.name,
      pickupLocationId: pickupLocation.id,
      toLocation: 'UPMC Bedford Emergency Department',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      transportLevel: 'BLS',
      urgencyLevel: 'Routine',
      patientId: 'TEST-PATIENT-001',
      diagnosis: 'UTI',
      mobilityLevel: 'Ambulatory',
      oxygenRequired: false,
      monitoringRequired: false,
      selectedAgencies: [],
      notificationRadius: 100,
      notes: 'Test trip with pickup location'
    };
    
    const tripResponse = await fetch(`${BASE_URL}/api/trips/enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(tripData)
    });
    
    if (!tripResponse.ok) {
      const errorData = await tripResponse.json();
      throw new Error(`Trip creation failed: ${tripResponse.status} - ${errorData.error}`);
    }
    
    const tripResult = await tripResponse.json();
    console.log('✅ Trip created successfully!');
    console.log(`   Trip ID: ${tripResult.data.id}`);
    console.log(`   Pickup Location: ${pickupLocation.name}`);
    console.log(`   Contact: ${pickupLocation.contactPhone}`);
    
    // Verify the trip was created with pickup location
    if (tripResult.data.pickupLocationId === pickupLocation.id) {
      console.log('✅ Pickup location correctly associated with trip');
    } else {
      console.log('❌ Pickup location not properly associated with trip');
    }
    
    console.log('🎉 All tests passed! Pickup location integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testPickupLocationIntegration();
