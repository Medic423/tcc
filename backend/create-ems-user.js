const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const emsPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_EMS
    }
  }
});

async function createEMSUser() {
  try {
    console.log('Creating EMS user...');
    
    // First, find the agency we just created
    const agency = await emsPrisma.eMSAgency.findFirst({
      where: { email: 'fferguson@movalleyems.com' }
    });
    
    if (!agency) {
      console.error('Agency not found. Please run setup-test-data.js first.');
      return;
    }
    
    console.log('Found agency:', agency.id);
    
    // Create EMS user in EMS database
    const hashedPassword = await bcrypt.hash('movalley123', 10);
    const emsUser = await emsPrisma.eMSUser.create({
      data: {
        email: 'fferguson@movalleyems.com',
        password: hashedPassword,
        name: 'Frank Ferguson',
        agencyName: agency.name,
        agencyId: agency.id,
        userType: 'EMS',
        isActive: true
      }
    });
    
    console.log('EMS User created in EMS database:', emsUser.id);
    console.log('EMS login credentials:');
    console.log('Email: fferguson@movalleyems.com');
    console.log('Password: movalley123');
    
  } catch (error) {
    console.error('Error creating EMS user:', error);
  } finally {
    await emsPrisma.$disconnect();
  }
}

createEMSUser();