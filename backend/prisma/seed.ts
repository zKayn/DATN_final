import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@sportshop.com' },
    update: {},
    create: {
      email: 'admin@sportshop.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
      permissions: JSON.stringify(['all']), // String instead of array
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Test User
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@sportshop.com' },
    update: {},
    create: {
      email: 'user@sportshop.com',
      passwordHash: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+84 123 456 789',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Test user created:', user.email);

  // Create Categories
  const categories = [
    { name: 'Football', slug: 'football', icon: '⚽', description: 'Football equipment and apparel' },
    { name: 'Basketball', slug: 'basketball', icon: '🏀', description: 'Basketball gear and shoes' },
    { name: 'Running', slug: 'running', icon: '🏃', description: 'Running shoes and accessories' },
    { name: 'Tennis', slug: 'tennis', icon: '🎾', description: 'Tennis rackets and equipment' },
    { name: 'Swimming', slug: 'swimming', icon: '🏊', description: 'Swimming gear and accessories' },
    { name: 'Gym', slug: 'gym', icon: '🏋️', description: 'Gym equipment and fitness gear' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created');

  // Create Brands
  const brands = [
    {
      name: 'Nike',
      slug: 'nike',
      logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png',
      description: 'Just Do It',
    },
    {
      name: 'Adidas',
      slug: 'adidas',
      logo: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png',
      description: 'Impossible is Nothing',
    },
    {
      name: 'Puma',
      slug: 'puma',
      logo: 'https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png',
      description: 'Forever Faster',
    },
    {
      name: 'Under Armour',
      slug: 'under-armour',
      logo: 'https://logos-world.net/wp-content/uploads/2020/04/Under-Armour-Logo.png',
      description: 'I Will',
    },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }
  console.log('✅ Brands created');

  // Get category and brand IDs
  const runningCategory = await prisma.category.findUnique({ where: { slug: 'running' } });
  const nikeBrand = await prisma.brand.findUnique({ where: { slug: 'nike' } });

  if (runningCategory && nikeBrand) {
    // Create Sample Products
    const products = [
      {
        name: 'Nike Air Zoom Pegasus 39',
        slug: 'nike-air-zoom-pegasus-39',
        description: 'The Nike Air Zoom Pegasus 39 features Nike React foam for a smooth, responsive ride. The optimized upper design provides breathability and support.',
        price: 120,
        originalPrice: 140,
        sku: 'NIKE-AZP39-001',
        stock: 50,
        categoryId: runningCategory.id,
        brandId: nikeBrand.id,
        isFeatured: true,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', order: 0 },
            { url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800', order: 1 },
          ],
        },
        variants: {
          create: [
            { size: '8', color: 'Black', stock: 10, sku: 'NIKE-AZP39-001-8-BLK' },
            { size: '9', color: 'Black', stock: 15, sku: 'NIKE-AZP39-001-9-BLK' },
            { size: '10', color: 'Black', stock: 15, sku: 'NIKE-AZP39-001-10-BLK' },
            { size: '8', color: 'White', stock: 10, sku: 'NIKE-AZP39-001-8-WHT' },
          ],
        },
      },
      {
        name: 'Nike React Infinity Run',
        slug: 'nike-react-infinity-run',
        description: 'Designed to help reduce injury and keep you on the run, the Nike React Infinity Run Flyknit gives you trusted support and cushioning.',
        price: 160,
        originalPrice: 180,
        sku: 'NIKE-RIR-002',
        stock: 40,
        categoryId: runningCategory.id,
        brandId: nikeBrand.id,
        isFeatured: true,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800', order: 0 },
            { url: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800', order: 1 },
          ],
        },
        variants: {
          create: [
            { size: '8', color: 'Blue', stock: 10, sku: 'NIKE-RIR-002-8-BLU' },
            { size: '9', color: 'Blue', stock: 15, sku: 'NIKE-RIR-002-9-BLU' },
            { size: '10', color: 'Blue', stock: 15, sku: 'NIKE-RIR-002-10-BLU' },
          ],
        },
      },
    ];

    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      });
    }
    console.log('✅ Sample products created');
  }

  console.log('🎉 Database seeding completed!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@sportshop.com / admin123');
  console.log('User: user@sportshop.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });