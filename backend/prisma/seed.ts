import { PrismaClient, Role, Country } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Nick Fury',
        email: 'nick.fury@avengers.com',
        password: hashedPassword,
        role: Role.ADMIN,
        country: null, // ADMIN is global
      },
    }),
    prisma.user.create({
      data: {
        name: 'Captain Marvel',
        email: 'captain.marvel@avengers.com',
        password: hashedPassword,
        role: Role.MANAGER,
        country: Country.INDIA,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Captain America',
        email: 'captain.america@avengers.com',
        password: hashedPassword,
        role: Role.MANAGER,
        country: Country.AMERICA,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Thanos',
        email: 'thanos@avengers.com',
        password: hashedPassword,
        role: Role.MEMBER,
        country: Country.INDIA,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Thor',
        email: 'thor@avengers.com',
        password: hashedPassword,
        role: Role.MEMBER,
        country: Country.INDIA,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Travis',
        email: 'travis@avengers.com',
        password: hashedPassword,
        role: Role.MEMBER,
        country: Country.AMERICA,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Seed Restaurants - India
  const indianRestaurants = await Promise.all([
    prisma.restaurant.create({
      data: {
        name: 'Taj Mahal Kitchen',
        address: '12 MG Road, Mumbai, India',
        cuisine: 'Indian',
        country: Country.INDIA,
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        menuItems: {
          create: [
            { name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 350, imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398' },
            { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 280, imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8' },
            { name: 'Biryani', description: 'Fragrant basmati rice with aromatic spices', price: 320, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8' },
            { name: 'Naan Bread', description: 'Freshly baked tandoori bread', price: 60, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641' },
            { name: 'Gulab Jamun', description: 'Sweet milk dumplings in sugar syrup', price: 150, imageUrl: 'https://images.unsplash.com/photo-1666190079485-a29e9fb1c3a4' },
          ],
        },
      },
    }),
    prisma.restaurant.create({
      data: {
        name: 'Spice Garden',
        address: '45 Brigade Road, Bangalore, India',
        cuisine: 'South Indian',
        country: Country.INDIA,
        imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9',
        menuItems: {
          create: [
            { name: 'Masala Dosa', description: 'Crispy crepe with spiced potato filling', price: 180, imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976' },
            { name: 'Idli Sambar', description: 'Steamed rice cakes with lentil soup', price: 120, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc' },
            { name: 'Chettinad Chicken', description: 'Spicy chicken from Tamil Nadu', price: 380, imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde6c99db7f6' },
            { name: 'Filter Coffee', description: 'Traditional South Indian coffee', price: 80, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735' },
          ],
        },
      },
    }),
  ]);

  // Seed Restaurants - America
  const americanRestaurants = await Promise.all([
    prisma.restaurant.create({
      data: {
        name: 'Liberty Burgers',
        address: '200 Broadway, New York, USA',
        cuisine: 'American',
        country: Country.AMERICA,
        imageUrl: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17',
        menuItems: {
          create: [
            { name: 'Classic Cheeseburger', description: 'Angus beef patty with cheddar cheese', price: 12.99, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
            { name: 'BBQ Ribs', description: 'Slow-smoked pork ribs with BBQ sauce', price: 24.99, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
            { name: 'Caesar Salad', description: 'Romaine lettuce with caesar dressing', price: 10.99, imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1' },
            { name: 'Mac & Cheese', description: 'Creamy three-cheese macaroni', price: 9.99, imageUrl: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686' },
            { name: 'Apple Pie', description: 'Homemade apple pie with vanilla ice cream', price: 8.99, imageUrl: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9' },
          ],
        },
      },
    }),
    prisma.restaurant.create({
      data: {
        name: 'West Coast Grill',
        address: '500 Sunset Blvd, Los Angeles, USA',
        cuisine: 'Californian',
        country: Country.AMERICA,
        imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
        menuItems: {
          create: [
            { name: 'Fish Tacos', description: 'Grilled mahi-mahi with mango salsa', price: 14.99, imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b' },
            { name: 'Avocado Toast', description: 'Sourdough with smashed avocado', price: 11.99, imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d' },
            { name: 'Acai Bowl', description: 'Blended acai with granola and fruits', price: 13.99, imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733' },
            { name: 'Grilled Salmon', description: 'Wild-caught salmon with vegetables', price: 22.99, imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288' },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${indianRestaurants.length + americanRestaurants.length} restaurants with menu items`);

  // Seed Payment Methods
  const adminUser = users[0]; // Nick Fury
  await prisma.paymentMethod.create({
    data: {
      userId: adminUser.id,
      type: 'CREDIT_CARD',
      details: JSON.stringify({ last4: '4242', brand: 'Visa', expiry: '12/28' }),
      isDefault: true,
    },
  });

  for (const user of users.slice(1)) {
    await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type: 'CREDIT_CARD',
        details: JSON.stringify({ last4: '1234', brand: 'Mastercard', expiry: '06/27' }),
        isDefault: true,
      },
    });
  }

  console.log('✅ Created payment methods');
  console.log('');
  console.log('📋 Login Credentials (all passwords: password123):');
  console.log('─────────────────────────────────────────────────');
  console.log('ADMIN:   nick.fury@avengers.com');
  console.log('MANAGER: captain.marvel@avengers.com (INDIA)');
  console.log('MANAGER: captain.america@avengers.com (AMERICA)');
  console.log('MEMBER:  thanos@avengers.com (INDIA)');
  console.log('MEMBER:  thor@avengers.com (INDIA)');
  console.log('MEMBER:  travis@avengers.com (AMERICA)');
  console.log('');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
