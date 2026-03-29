const { PrismaClient } = require('@prisma/client');

async function testConnection() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('Testing connection...');

    const prisma = new PrismaClient();

    try {
        await prisma.$connect();
        console.log('✅ Connection successful!');
        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();
