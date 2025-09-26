const { PrismaClient } = require('.prisma/center');

const centerPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_CENTER || "postgresql://scooper@localhost:5432/tcc_center?schema=public"
    }
  }
});

async function testAgencyResponse() {
  try {
    console.log('Testing agency response creation...');
    
    // Get the first agency ID
    const agency = await centerPrisma.eMSAgency.findFirst();
    if (!agency) {
      console.error('No agencies found in Center database');
      return;
    }
    
    console.log('Using agency:', agency.name, 'ID:', agency.id);
    
    // Get the first trip ID
    const trip = await centerPrisma.trip.findFirst();
    if (!trip) {
      console.error('No trips found in Center database');
      return;
    }
    
    console.log('Using trip:', trip.tripNumber, 'ID:', trip.id);
    
    // Test creating an agency response
    const agencyResponse = await centerPrisma.agencyResponse.create({
      data: {
        tripId: trip.id,
        agencyId: agency.id,
        response: 'ACCEPTED',
        responseNotes: 'Test response from script',
        estimatedArrival: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      }
    });
    
    console.log('Agency response created successfully:', agencyResponse.id);
    
    // Clean up - delete the test response
    await centerPrisma.agencyResponse.delete({
      where: { id: agencyResponse.id }
    });
    
    console.log('Test response cleaned up');
    
  } catch (error) {
    console.error('Error testing agency response creation:', error);
  } finally {
    await centerPrisma.$disconnect();
  }
}

testAgencyResponse();
