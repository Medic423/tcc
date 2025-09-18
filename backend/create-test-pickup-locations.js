#!/usr/bin/env node

/**
 * TCC Test Pickup Locations Creation Script
 * Creates sample pickup locations for testing the pickup location functionality
 */

const { databaseManager } = require('./dist/services/databaseManager');

async function createTestPickupLocations() {
  try {
    console.log('🏥 Creating test pickup locations...');
    
    const prisma = databaseManager.getCenterDB();
    
    // Get the first hospital to create pickup locations for
    const hospital = await prisma.hospital.findFirst({
      where: { isActive: true }
    });
    
    if (!hospital) {
      console.log('❌ No active hospitals found. Please run the seed script first.');
      return;
    }
    
    console.log(`📍 Creating pickup locations for: ${hospital.name}`);
    
    // Create sample pickup locations
    const pickupLocations = [
      {
        hospitalId: hospital.id,
        name: 'Emergency Department',
        description: 'Main emergency department entrance',
        contactPhone: '(814) 889-2011',
        contactEmail: 'emergency@altoonaregional.org',
        floor: 'Ground Floor',
        room: 'ED-1'
      },
      {
        hospitalId: hospital.id,
        name: 'First Floor Nurses Station',
        description: 'Main nursing station on first floor',
        contactPhone: '(814) 889-2012',
        contactEmail: 'nursing@altoonaregional.org',
        floor: '1st Floor',
        room: 'NS-101'
      },
      {
        hospitalId: hospital.id,
        name: 'ICU Unit',
        description: 'Intensive Care Unit',
        contactPhone: '(814) 889-2013',
        contactEmail: 'icu@altoonaregional.org',
        floor: '2nd Floor',
        room: 'ICU-201'
      },
      {
        hospitalId: hospital.id,
        name: 'Surgery Recovery',
        description: 'Post-surgical recovery area',
        contactPhone: '(814) 889-2014',
        contactEmail: 'surgery@altoonaregional.org',
        floor: '3rd Floor',
        room: 'SR-301'
      },
      {
        hospitalId: hospital.id,
        name: 'Cancer Center',
        description: 'Oncology treatment center',
        contactPhone: '(814) 889-2015',
        contactEmail: 'oncology@altoonaregional.org',
        floor: '1st Floor',
        room: 'CC-102'
      }
    ];
    
    for (const locationData of pickupLocations) {
      const pickupLocation = await prisma.pickupLocation.create({
        data: locationData
      });
      console.log(`✅ Created pickup location: ${pickupLocation.name}`);
    }
    
    console.log('🎉 Test pickup locations created successfully!');
    
    // List all pickup locations for verification
    const allLocations = await prisma.pickupLocation.findMany({
      where: { hospitalId: hospital.id },
      include: { hospital: { select: { name: true } } }
    });
    
    console.log('\n📋 All pickup locations:');
    allLocations.forEach(location => {
      console.log(`  - ${location.name} (${location.floor}) - ${location.contactPhone}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating pickup locations:', error);
  } finally {
    await databaseManager.disconnect();
  }
}

// Run the script
createTestPickupLocations();
