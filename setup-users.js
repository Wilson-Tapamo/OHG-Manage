const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupUsers() {
    console.log('🔧 Setting up users in database...\n');

    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'optimum_juridis'
        });

        console.log('✅ Connected to database\n');

        // Generate password hash
        const passwordHash = await bcrypt.hash('password123', 10);
        console.log('🔐 Generated password hash for "password123"\n');

        // Delete existing users if any
        await connection.execute('DELETE FROM User WHERE email IN (?, ?)', ['director@test.com', 'consultant@test.com']);

        // Insert Director
        await connection.execute(
            `INSERT INTO User (id, email, name, password, role, phone, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            ['director-001', 'director@test.com', 'Jean Dupont', passwordHash, 'DIRECTOR', '+33 6 12 34 56 78']
        );
        console.log('✅ Director user created: director@test.com');

        // Insert Consultant
        await connection.execute(
            `INSERT INTO User (id, email, name, password, role, phone, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            ['consultant-001', 'consultant@test.com', 'Marie Martin', passwordHash, 'CONSULTANT', '+33 6 98 76 54 32']
        );
        console.log('✅ Consultant user created: consultant@test.com');

        // Verify users
        const [users] = await connection.execute('SELECT email, name, role FROM User');
        console.log('\n📋 Users in database:');
        users.forEach(u => console.log(`   - ${u.email} (${u.role})`));

        await connection.end();

        console.log('\n🎉 Setup complete! You can now login with:');
        console.log('   Email: director@test.com');
        console.log('   Password: password123');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

setupUsers();
