const { PrismaClient } = require('.prisma/center');

const centerPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_CENTER || "postgresql://postgres:password@localhost:5434/tcc_center?schema=public"
    }
  }
});

async function createTestAgenciesInCenter() {
  try {
    console.log('Creating test agencies in Center database...');
    
    // Create test agencies
    const agencies = [
      {
        name: 'Altoona Regional EMS',
        contactName: 'John Smith',
        phone: '814-555-0101',
        email: 'contact@altoonaems.com',
        address: '123 Main St',
        city: 'Altoona',
        state: 'PA',
        zipCode: '16601',
        serviceArea: ['Altoona and surrounding areas'],
        capabilities: ['ALS', 'BLS', 'CCT'],
        isActive: true,
        status: 'ACTIVE'
      },
      {
        name: 'Blair County EMS',
        contactName: 'Sarah Johnson',
        phone: '814-555-0102',
        email: 'dispatch@blaircountyems.com',
        address: '456 Oak Ave',
        city: 'Hollidaysburg',
        state: 'PA',
        zipCode: '16648',
        serviceArea: ['Blair County'],
        capabilities: ['ALS', 'BLS'],
        isActive: true,
        status: 'ACTIVE'
      },
      {
        name: 'Mountain View EMS',
        contactName: 'Mike Wilson',
        phone: '814-555-0103',
        email: 'info@mountainviewems.com',
        address: '789 Pine St',
        city: 'Tyrone',
        state: 'PA',
        zipCode: '16686',
        serviceArea: ['Tyrone and surrounding areas'],
        capabilities: ['BLS'],
        isActive: true,
        status: 'ACTIVE'
      },
      {
        name: 'Central PA Medical Transport',
        contactName: 'Lisa Brown',
        phone: '814-555-0104',
        email: 'contact@centralpamedical.com',
        address: '321 Elm St',
        city: 'State College',
        state: 'PA',
        zipCode: '16801',
        serviceArea: ['Central Pennsylvania'],
        capabilities: ['CCT', 'ALS'],
        isActive: true,
        status: 'ACTIVE'
      }
    ];

    for (const agencyData of agencies) {
      const agency = await centerPrisma.eMSAgency.create({
        data: agencyData
      });
      console.log(`Created agency in Center DB: ${agency.name} (ID: ${agency.id})`);
    }

    console.log('Test agencies created successfully in Center database!');
  } catch (error) {
    console.error('Error creating test agencies in Center database:', error);
  } finally {
    await centerPrisma.$disconnect();
  }
}

createTestAgenciesInCenter();
