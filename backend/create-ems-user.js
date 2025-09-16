const { databaseManager } = require('./dist/services/databaseManager');
const bcrypt = require('bcrypt');

async function createEMSUser() {
  let emsPrisma;
  try {
    console.log('Creating EMS user...');
    
    emsPrisma = databaseManager.getEMSDB();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('movalley123', 10);
    
    // Create EMS user
    const emsUser = await emsPrisma.eMSUser.upsert({
      where: { email: 'fferguson@movalleyems.com' },
      update: { 
        password: hashedPassword,
        name: 'Frank Ferguson',
        agencyName: 'Mountain Valley EMS',
        isActive: true,
        userType: 'EMS'
      },
      create: {
        email: 'fferguson@movalleyems.com',
        password: hashedPassword,
        name: 'Frank Ferguson',
        agencyName: 'Mountain Valley EMS',
        isActive: true,
        userType: 'EMS'
      }
    });
    
    console.log('✅ EMS User created/updated:', emsUser.email);
    console.log('User ID:', emsUser.id);
    
    // Create EMS Agency
    const emsAgency = await emsPrisma.eMSAgency.create({
      data: {
        name: 'Mountain Valley EMS',
        contactName: 'Frank Ferguson',
        phone: '555-123-4567',
        email: 'contact@movalleyems.com',
        address: '123 Main Street',
        city: 'Mountain Valley',
        state: 'CA',
        zipCode: '90210',
        serviceArea: ['Mountain Valley', 'Valley View', 'Hillside'],
        capabilities: ['BLS', 'ALS', 'CCT'],
        isActive: true,
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ EMS Agency created/updated:', emsAgency.name);
    console.log('Agency ID:', emsAgency.id);
    
  } catch (error) {
    console.error('❌ Error creating EMS user/agency:', error);
  } finally {
    if (emsPrisma) {
      await emsPrisma.$disconnect();
    }
  }
}

createEMSUser();