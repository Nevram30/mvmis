import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Check if users already exist
  const existingUsers = await prisma.user.count();
  
  if (existingUsers >= 6) {
    console.log('✅ Users already exist');
    return;
  }

  // Delete existing users to start fresh
  await prisma.user.deleteMany();

  // Hash the password (same for all users for demo purposes)
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create 6 users with different roles
  const users = [
    {
      name: 'System Administrator',
      email: 'admin@mvmis.com',
      role: UserRole.ADMIN,
    },
    {
      name: 'Carlos Mendoza',
      email: 'manager@mvmis.com',
      role: UserRole.MANAGER,
    },
    {
      name: 'Maria Santos',
      email: 'secretary@mvmis.com',
      role: UserRole.SECRETARY,
    },
    {
      name: 'Juan Dela Cruz',
      email: 'mechanic1@mvmis.com',
      role: UserRole.MECHANIC,
    },
    {
      name: 'Pedro Garcia',
      email: 'mechanic2@mvmis.com',
      role: UserRole.MECHANIC,
    },
    {
      name: 'Roberto Reyes',
      email: 'proprietor@mvmis.com',
      role: UserRole.PROPRIETOR,
    },
  ];

  console.log('Creating users...');
  
  for (const userData of users) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        emailVerified: new Date(),
      }
    });

    console.log(`✅ Created ${userData.role}: ${user.email}`);
  }

  console.log('');
  console.log('🔐 Login credentials for all users:');
  console.log('   Password: password123');
  console.log('');
  console.log('📧 User accounts:');
  users.forEach(user => {
    console.log(`   ${user.role}: ${user.email} (${user.name})`);
  });
  console.log('');
  console.log('⚠️  Please change the default passwords after first login!');

  // Create sample customers
  console.log('Creating sample customers...');
  const sampleCustomers = [
    {
      customerName: 'ABC Transport Corp',
      address: '123 Main Street, Manila, Philippines',
      telNo: '(02) 123-4567',
      mobileNo: '+63 917 123 4567',
      tin: '123-456-789-000',
    },
    {
      customerName: 'XYZ Logistics Inc',
      address: '456 Business Ave, Quezon City, Philippines',
      telNo: '(02) 987-6543',
      mobileNo: '+63 918 987 6543',
      tin: '987-654-321-000',
    },
    {
      customerName: 'Metro Delivery Services',
      address: '789 Commerce St, Makati City, Philippines',
      mobileNo: '+63 919 555 0123',
      tin: '555-123-456-000',
    },
  ];

  for (const customerData of sampleCustomers) {
    const customer = await prisma.customer.create({
      data: customerData,
    });
    console.log(`✅ Created customer: ${customer.customerName}`);
  }

  // Create sample contractors
  console.log('Creating sample contractors...');
  const sampleContractors = [
    {
      contractorName: 'Elite Auto Repair',
      address: '321 Workshop Lane, Pasig City, Philippines',
      telNo: '(02) 555-1234',
      mobileNo: '+63 920 555 1234',
      tin: '111-222-333-000',
      assignment: 'OUTSIDE_LABOR' as const,
    },
    {
      contractorName: 'Pro Mechanics Shop',
      address: '654 Service Road, Mandaluyong City, Philippines',
      telNo: '(02) 555-5678',
      mobileNo: '+63 921 555 5678',
      tin: '444-555-666-000',
      assignment: 'INHOUSE' as const,
    },
    {
      contractorName: 'Quick Fix Auto Center',
      address: '987 Repair Street, San Juan City, Philippines',
      mobileNo: '+63 922 555 9876',
      tin: '777-888-999-000',
      assignment: 'OUTSIDE_LABOR' as const,
    },
  ];

  for (const contractorData of sampleContractors) {
    const contractor = await prisma.contractor.create({
      data: contractorData,
    });
    console.log(`✅ Created contractor: ${contractor.contractorName}`);
  }

  console.log('');
  console.log('📊 Sample data created:');
  console.log(`   ${sampleCustomers.length} customers`);
  console.log(`   ${sampleContractors.length} contractors`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
