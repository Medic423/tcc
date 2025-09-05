import { PrismaClient as CenterPrismaClient } from '@prisma/center';
import { PrismaClient as EMSPrismaClient } from '@prisma/ems';
import { PrismaClient as HospitalPrismaClient } from '@prisma/hospital';
import bcrypt from 'bcryptjs';

const centerDB = new CenterPrismaClient();
const emsDB = new EMSPrismaClient();
const hospitalDB = new HospitalPrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await centerDB.centerUser.upsert({
    where: { email: 'admin@tcc.com' },
    update: {},
    create: {
      email: 'admin@tcc.com',
      password: hashedPassword,
      name: 'TCC Administrator',
      userType: 'ADMIN'
    }
  });
  console.log('✅ Admin user created:', adminUser.email);

  // Create sample hospitals
  const hospitals = await Promise.all([
    centerDB.hospital.upsert({
      where: { name: 'Altoona Regional Health System' },
      update: {},
      create: {
        name: 'Altoona Regional Health System',
        address: '620 Howard Ave',
        city: 'Altoona',
        state: 'PA',
        zipCode: '16601',
        phone: '(814) 889-2011',
        email: 'info@altoonaregional.org',
        type: 'HOSPITAL',
        capabilities: ['EMERGENCY', 'SURGERY', 'ICU', 'RADIOLOGY'],
        region: 'ALTOONA',
        coordinates: { lat: 40.5187, lng: -78.3947 },
        operatingHours: '24/7',
        isActive: true
      }
    }),
    centerDB.hospital.upsert({
      where: { name: 'UPMC Bedford' },
      update: {},
      create: {
        name: 'UPMC Bedford',
        address: '10455 Lincoln Hwy',
        city: 'Everett',
        state: 'PA',
        zipCode: '15537',
        phone: '(814) 623-6100',
        email: 'info@upmcbedford.org',
        type: 'HOSPITAL',
        capabilities: ['EMERGENCY', 'SURGERY', 'ICU'],
        region: 'ALTOONA',
        coordinates: { lat: 40.0115, lng: -78.3736 },
        operatingHours: '24/7',
        isActive: true
      }
    }),
    centerDB.hospital.upsert({
      where: { name: 'Jefferson University Hospital' },
      update: {},
      create: {
        name: 'Jefferson University Hospital',
        address: '111 S 11th St',
        city: 'Philadelphia',
        state: 'PA',
        zipCode: '19107',
        phone: '(215) 955-6000',
        email: 'info@jefferson.edu',
        type: 'HOSPITAL',
        capabilities: ['EMERGENCY', 'SURGERY', 'ICU', 'RADIOLOGY', 'CARDIOLOGY'],
        region: 'PHILADELPHIA',
        coordinates: { lat: 39.9440, lng: -75.1600 },
        operatingHours: '24/7',
        isActive: true
      }
    })
  ]);
  console.log('✅ Hospitals created:', hospitals.length);

  // Create sample EMS agencies
  const agencies = await Promise.all([
    emsDB.eMSAgency.upsert({
      where: { name: 'Altoona EMS' },
      update: {},
      create: {
        name: 'Altoona EMS',
        contactName: 'John Smith',
        phone: '(814) 555-0101',
        email: 'dispatch@altoonaems.com',
        address: '123 Main St',
        city: 'Altoona',
        state: 'PA',
        zipCode: '16601',
        serviceArea: ['Altoona', 'Hollidaysburg', 'Duncansville'],
        operatingHours: { start: '06:00', end: '18:00', days: [1, 2, 3, 4, 5] },
        capabilities: ['BLS', 'ALS'],
        pricingStructure: { baseRate: 150, perMile: 2.50 },
        isActive: true,
        status: 'ACTIVE'
      }
    }),
    emsDB.eMSAgency.upsert({
      where: { name: 'Bedford Ambulance Service' },
      update: {},
      create: {
        name: 'Bedford Ambulance Service',
        contactName: 'Sarah Johnson',
        phone: '(814) 555-0202',
        email: 'info@bedfordambulance.com',
        address: '456 Oak Ave',
        city: 'Bedford',
        state: 'PA',
        zipCode: '15522',
        serviceArea: ['Bedford', 'Everett', 'Manns Choice'],
        operatingHours: { start: '00:00', end: '23:59', days: [0, 1, 2, 3, 4, 5, 6] },
        capabilities: ['BLS', 'ALS', 'CCT'],
        pricingStructure: { baseRate: 175, perMile: 3.00 },
        isActive: true,
        status: 'ACTIVE'
      }
    }),
    emsDB.eMSAgency.upsert({
      where: { name: 'Philadelphia Medical Transport' },
      update: {},
      create: {
        name: 'Philadelphia Medical Transport',
        contactName: 'Mike Davis',
        phone: '(215) 555-0303',
        email: 'dispatch@philamedtransport.com',
        address: '789 Broad St',
        city: 'Philadelphia',
        state: 'PA',
        zipCode: '19102',
        serviceArea: ['Philadelphia', 'Camden', 'Wilmington'],
        operatingHours: { start: '06:00', end: '22:00', days: [1, 2, 3, 4, 5, 6] },
        capabilities: ['BLS', 'ALS', 'CCT'],
        pricingStructure: { baseRate: 200, perMile: 3.50 },
        isActive: true,
        status: 'ACTIVE'
      }
    })
  ]);
  console.log('✅ EMS agencies created:', agencies.length);

  // Create sample units for each agency
  for (const agency of agencies) {
    await Promise.all([
      emsDB.unit.create({
        data: {
          agencyId: agency.id,
          unitNumber: 'A-1',
          type: 'AMBULANCE',
          capabilities: agency.capabilities,
          currentStatus: 'AVAILABLE',
          currentLocation: { lat: 40.5187, lng: -78.3947 },
          isActive: true
        }
      }),
      emsDB.unit.create({
        data: {
          agencyId: agency.id,
          unitNumber: 'A-2',
          type: 'AMBULANCE',
          capabilities: agency.capabilities,
          currentStatus: 'AVAILABLE',
          currentLocation: { lat: 40.5187, lng: -78.3947 },
          isActive: true
        }
      })
    ]);
  }
  console.log('✅ EMS units created');

  // Create sample facilities
  const facilities = await Promise.all([
    hospitalDB.facility.create({
      data: {
        name: 'Altoona Regional Emergency Department',
        type: 'HOSPITAL',
        address: '620 Howard Ave',
        city: 'Altoona',
        state: 'PA',
        zipCode: '16601',
        phone: '(814) 889-2011',
        email: 'ed@altoonaregional.org',
        coordinates: { lat: 40.5187, lng: -78.3947 },
        isActive: true
      }
    }),
    hospitalDB.facility.create({
      data: {
        name: 'UPMC Bedford Emergency Department',
        type: 'HOSPITAL',
        address: '10455 Lincoln Hwy',
        city: 'Everett',
        state: 'PA',
        zipCode: '15537',
        phone: '(814) 623-6100',
        email: 'ed@upmcbedford.org',
        coordinates: { lat: 40.0115, lng: -78.3736 },
        isActive: true
      }
    }),
    hospitalDB.facility.create({
      data: {
        name: 'Jefferson Emergency Department',
        type: 'HOSPITAL',
        address: '111 S 11th St',
        city: 'Philadelphia',
        state: 'PA',
        zipCode: '19107',
        phone: '(215) 955-6000',
        email: 'ed@jefferson.edu',
        coordinates: { lat: 39.9440, lng: -75.1600 },
        isActive: true
      }
    }),
    hospitalDB.facility.create({
      data: {
        name: 'Altoona Urgent Care',
        type: 'URGENT_CARE',
        address: '1000 7th Ave',
        city: 'Altoona',
        state: 'PA',
        zipCode: '16602',
        phone: '(814) 555-0404',
        email: 'info@altoonaurgent.com',
        coordinates: { lat: 40.5200, lng: -78.4000 },
        isActive: true
      }
    })
  ]);
  console.log('✅ Facilities created:', facilities.length);

  // Create sample hospital users
  const hospitalUsers = await Promise.all([
    hospitalDB.hospitalUser.create({
      data: {
        email: 'nurse1@altoonaregional.org',
        password: await bcrypt.hash('nurse123', 12),
        name: 'Alice Johnson',
        hospitalName: 'Altoona Regional Health System',
        isActive: true
      }
    }),
    hospitalDB.hospitalUser.create({
      data: {
        email: 'nurse2@upmcbedford.org',
        password: await bcrypt.hash('nurse123', 12),
        name: 'Bob Smith',
        hospitalName: 'UPMC Bedford',
        isActive: true
      }
    })
  ]);
  console.log('✅ Hospital users created:', hospitalUsers.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@tcc.com / admin123');
  console.log('Nurse 1: nurse1@altoonaregional.org / nurse123');
  console.log('Nurse 2: nurse2@upmcbedford.org / nurse123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await centerDB.$disconnect();
    await emsDB.$disconnect();
    await hospitalDB.$disconnect();
  });
