// backend/scripts/create-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Creating admin account...\n');

    const email = 'admin@sportshop.com';
    const password = 'Admin123!';
    const name = 'Super Admin';

    // Check if admin exists
    const existing = await prisma.admin.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('⚠️  Admin already exists!');
      console.log('📧 Email:', existing.email);
      console.log('👤 Name:', existing.name);
      console.log('🎭 Role:', existing.role);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'SUPER_ADMIN',
        permissions: ['ALL'],
        isActive: true,
      },
    });

    console.log('✅ Admin created successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Role:', admin.role);
    console.log('\n⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();