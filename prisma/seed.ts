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
