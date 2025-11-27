// backend/scripts/migrate-sqlite-to-mongodb-v2.ts
// Migration script: SQLite → MongoDB with explicit URLs

import { PrismaClient } from '../node_modules/.prisma/client-sqlite';
import { PrismaClient as PrismaClientMongo } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// SQLite connection (old database) - explicit URL
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:../prisma/dev.db',  // Path từ scripts/ folder
    },
  },
});

// MongoDB connection (new database) - from env
const mongoClient = new PrismaClientMongo({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function migrate() {
  try {
    console.log('🚀 Starting migration from SQLite to MongoDB...\n');
    console.log('📁 SQLite: ./prisma/dev.db');
    console.log('☁️  MongoDB:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'), '\n');

    // ============= 1. MIGRATE USERS =============
    console.log('👥 Migrating users...');
    const users = await sqliteClient.user.findMany();
    console.log(`   Found ${users.length} users`);

    const userIdMap = new Map<string, string>();

    for (const user of users) {
      const newUser = await mongoClient.user.create({
        data: {
          email: user.email,
          passwordHash: user.passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
      userIdMap.set(user.id, newUser.id);
    }
    console.log('   ✅ Users migrated\n');

    // ============= 2. MIGRATE ADMINS =============
    console.log('👨‍💼 Migrating admins...');
    const admins = await sqliteClient.admin.findMany();
    console.log(`   Found ${admins.length} admins`);

    for (const admin of admins) {
      // Parse permissions from JSON string to array
      let permissionsArray: string[] = [];
      try {
        if (admin.permissions && typeof admin.permissions === 'string') {
          permissionsArray = JSON.parse(admin.permissions);
        } else if (Array.isArray(admin.permissions)) {
          permissionsArray = admin.permissions;
        }
      } catch (e) {
        console.warn(`   ⚠️  Failed to parse permissions for admin ${admin.email}:`, e);
        permissionsArray = [];
      }

      await mongoClient.admin.create({
        data: {
          email: admin.email,
          passwordHash: admin.passwordHash,
          name: admin.name,
          role: admin.role,
          permissions: permissionsArray,
          isActive: admin.isActive,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
        },
      });
    }
    console.log('   ✅ Admins migrated\n');

    // ============= 3. MIGRATE CATEGORIES =============
    console.log('📂 Migrating categories...');
    const categories = await sqliteClient.category.findMany();
    console.log(`   Found ${categories.length} categories`);

    const categoryIdMap = new Map<string, string>();

    for (const category of categories) {
      const newCategory = await mongoClient.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          icon: category.icon,
          parentId: category.parentId,
          order: category.order,
          isActive: category.isActive,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
      });
      categoryIdMap.set(category.id, newCategory.id);
    }
    console.log('   ✅ Categories migrated\n');

    // ============= 4. MIGRATE BRANDS =============
    console.log('🏷️  Migrating brands...');
    const brands = await sqliteClient.brand.findMany();
    console.log(`   Found ${brands.length} brands`);

    const brandIdMap = new Map<string, string>();

    for (const brand of brands) {
      const newBrand = await mongoClient.brand.create({
        data: {
          name: brand.name,
          slug: brand.slug,
          logo: brand.logo,
          description: brand.description,
          isActive: brand.isActive,
          createdAt: brand.createdAt,
          updatedAt: brand.updatedAt,
        },
      });
      brandIdMap.set(brand.id, newBrand.id);
    }
    console.log('   ✅ Brands migrated\n');

    // ============= 5. MIGRATE PRODUCTS =============
    console.log('📦 Migrating products...');
    const products = await sqliteClient.product.findMany({
      include: {
        images: true,
        variants: true,
      },
    });
    console.log(`   Found ${products.length} products`);

    const productIdMap = new Map<string, string>();

    for (const product of products) {
      const newProduct = await mongoClient.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          sku: product.sku,
          stock: product.stock,
          categoryId: categoryIdMap.get(product.categoryId) || product.categoryId,
          brandId: brandIdMap.get(product.brandId) || product.brandId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          viewCount: product.viewCount,
          soldCount: product.soldCount,
          rating: product.rating,
          reviewCount: product.reviewCount,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          images: {
            create: product.images.map((img) => ({
              url: img.url,
              order: img.order,
              createdAt: img.createdAt,
            })),
          },
          variants: {
            create: product.variants.map((variant) => ({
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
              sku: variant.sku,
              createdAt: variant.createdAt,
            })),
          },
        },
      });
      productIdMap.set(product.id, newProduct.id);
    }
    console.log('   ✅ Products migrated\n');

    // ============= 6. MIGRATE ADDRESSES =============
    console.log('📍 Migrating addresses...');
    const addresses = await sqliteClient.address.findMany();
    console.log(`   Found ${addresses.length} addresses`);

    for (const address of addresses) {
      await mongoClient.address.create({
        data: {
          userId: userIdMap.get(address.userId) || address.userId,
          label: address.label,
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          ward: address.ward,
          district: address.district,
          city: address.city,
          zipCode: address.zipCode,
          isDefault: address.isDefault,
          createdAt: address.createdAt,
          updatedAt: address.updatedAt,
        },
      });
    }
    console.log('   ✅ Addresses migrated\n');

    // ============= 7. MIGRATE ORDERS =============
    console.log('🛒 Migrating orders...');
    const orders = await sqliteClient.order.findMany({
      include: {
        items: true,
      },
    });
    console.log(`   Found ${orders.length} orders`);

    for (const order of orders) {
      // Parse shippingAddress from JSON string to object
      let shippingAddressObj: any = {};
      try {
        if (order.shippingAddress && typeof order.shippingAddress === 'string') {
          shippingAddressObj = JSON.parse(order.shippingAddress);
        } else if (order.shippingAddress && typeof order.shippingAddress === 'object') {
          shippingAddressObj = order.shippingAddress;
        }
      } catch (e) {
        console.warn(`   ⚠️  Failed to parse shippingAddress for order ${order.orderNumber}:`, e);
        shippingAddressObj = { raw: order.shippingAddress };
      }

      await mongoClient.order.create({
        data: {
          orderNumber: order.orderNumber,
          userId: userIdMap.get(order.userId) || order.userId,
          total: order.total,
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          discount: order.discount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          shippingMethod: order.shippingMethod,
          trackingNumber: order.trackingNumber,
          shippingAddress: shippingAddressObj,
          notes: order.notes,
          cancelReason: order.cancelReason,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: {
            create: order.items.map((item) => ({
              productId: productIdMap.get(item.productId) || item.productId,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              price: item.price,
              createdAt: item.createdAt,
            })),
          },
        },
      });
    }
    console.log('   ✅ Orders migrated\n');

    // ============= 8. MIGRATE REVIEWS =============
    console.log('⭐ Migrating reviews...');
    const reviews = await sqliteClient.review.findMany({
      include: {
        helpfulVotes: true,
      },
    });
    console.log(`   Found ${reviews.length} reviews`);

    for (const review of reviews) {
      // Parse images from JSON string to array
      let imagesArray: string[] = [];
      try {
        if (review.images && typeof review.images === 'string') {
          imagesArray = JSON.parse(review.images);
        } else if (Array.isArray(review.images)) {
          imagesArray = review.images;
        }
      } catch (e) {
        console.warn(`   ⚠️  Failed to parse images for review ${review.id}:`, e);
        imagesArray = [];
      }

      const newReview = await mongoClient.review.create({
        data: {
          productId: productIdMap.get(review.productId) || review.productId,
          userId: userIdMap.get(review.userId) || review.userId,
          orderId: review.orderId,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          images: imagesArray,
          isVerifiedPurchase: review.isVerifiedPurchase,
          isApproved: review.isApproved,
          adminReply: review.adminReply,
          adminReplyAt: review.adminReplyAt,
          helpfulCount: review.helpfulCount,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        },
      });

      // Migrate helpful votes
      for (const vote of review.helpfulVotes) {
        await mongoClient.reviewHelpfulVote.create({
          data: {
            reviewId: newReview.id,
            userId: userIdMap.get(vote.userId) || vote.userId,
            createdAt: vote.createdAt,
          },
        });
      }
    }
    console.log('   ✅ Reviews migrated\n');

    // ============= 9. MIGRATE CART ITEMS =============
    console.log('🛍️  Migrating cart items...');
    const cartItems = await sqliteClient.cartItem.findMany();
    console.log(`   Found ${cartItems.length} cart items`);

    for (const item of cartItems) {
      await mongoClient.cartItem.create({
        data: {
          userId: userIdMap.get(item.userId) || item.userId,
          productId: productIdMap.get(item.productId) || item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      });
    }
    console.log('   ✅ Cart items migrated\n');

    // ============= 10. MIGRATE WISHLISTS =============
    console.log('❤️  Migrating wishlists...');
    const wishlists = await sqliteClient.wishlist.findMany();
    console.log(`   Found ${wishlists.length} wishlists`);

    for (const wishlist of wishlists) {
      await mongoClient.wishlist.create({
        data: {
          userId: userIdMap.get(wishlist.userId) || wishlist.userId,
          productId: productIdMap.get(wishlist.productId) || wishlist.productId,
          createdAt: wishlist.createdAt,
          updatedAt: wishlist.updatedAt,
        },
      });
    }
    console.log('   ✅ Wishlists migrated\n');

    // ============= 11. MIGRATE COUPONS =============
    console.log('🎟️  Migrating coupons...');
    const coupons = await sqliteClient.coupon.findMany();
    console.log(`   Found ${coupons.length} coupons`);

    for (const coupon of coupons) {
      await mongoClient.coupon.create({
        data: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minPurchase: coupon.minPurchase,
          maxDiscount: coupon.maxDiscount,
          usageLimit: coupon.usageLimit,
          usedCount: coupon.usedCount,
          startDate: coupon.startDate,
          endDate: coupon.endDate,
          isActive: coupon.isActive,
          createdAt: coupon.createdAt,
          updatedAt: coupon.updatedAt,
        },
      });
    }
    console.log('   ✅ Coupons migrated\n');

    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Admins: ${admins.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Brands: ${brands.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Addresses: ${addresses.length}`);
    console.log(`   Orders: ${orders.length}`);
    console.log(`   Reviews: ${reviews.length}`);
    console.log(`   Cart Items: ${cartItems.length}`);
    console.log(`   Wishlists: ${wishlists.length}`);
    console.log(`   Coupons: ${coupons.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await mongoClient.$disconnect();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ Done! You can now use MongoDB.');
    console.log('💡 Update your .env to use MongoDB and restart the server.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });