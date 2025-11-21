// backend/scripts/reset-admin-password.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔄 Resetting admin password...\n');

    const email = 'admin@sportshop.com';
    const newPassword = 'Admin123!';

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log('❌ Admin not found!');
      console.log('Run: npx ts-node scripts/create-admin.ts');
      return;
    }

    console.log('👤 Found admin:');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);
    console.log('');

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log('🔐 New password hash:', passwordHash);
    console.log('');

    // Update password
    await prisma.admin.update({
      where: { email },
      data: { passwordHash },
    });

    console.log('✅ Password reset successfully!\n');
    console.log('📋 New Login Credentials:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);
    console.log('\n⚠️  Test login now!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();