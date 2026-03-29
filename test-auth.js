const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testAuth() {
    console.log('🔍 Testing authentication flow...\n');

    // Test bcrypt
    const testPassword = 'password123';
    const hash = await bcrypt.hash(testPassword, 10);
    console.log('1. Generated hash:', hash);

    const isValid = await bcrypt.compare(testPassword, hash);
    console.log('2. Bcrypt compare result:', isValid);

    // Connect to database
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'optimum_juridis'
        });

        console.log('\n3. Connected to database');

        // Get user from database
        const [users] = await connection.execute(
            'SELECT id, email, password, role FROM User WHERE email = ?',
            ['director@test.com']
        );

        if (users.length === 0) {
            console.log('❌ User not found in database!');
            await connection.end();
            return;
        }

        const user = users[0];
        console.log('4. User found:', user.email);
        console.log('5. Stored hash:', user.password);
        console.log('6. Hash length:', user.password.length);

        // Test password comparison with stored hash
        const passwordMatch = await bcrypt.compare(testPassword, user.password);
        console.log('7. Password match result:', passwordMatch);

        if (!passwordMatch) {
            console.log('\n❌ Password does NOT match!');
            console.log('   Updating password with new hash...\n');

            // Update with new hash
            const newHash = await bcrypt.hash(testPassword, 10);
            await connection.execute(
                'UPDATE User SET password = ? WHERE email = ?',
                [newHash, 'director@test.com']
            );
            await connection.execute(
                'UPDATE User SET password = ? WHERE email = ?',
                [newHash, 'consultant@test.com']
            );

            console.log('✅ Passwords updated!');

            // Verify the update
            const [updatedUsers] = await connection.execute(
                'SELECT email, password FROM User WHERE email = ?',
                ['director@test.com']
            );
            const verifyMatch = await bcrypt.compare(testPassword, updatedUsers[0].password);
            console.log('8. Verification after update:', verifyMatch);
        } else {
            console.log('\n✅ Password matches correctly!');
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Database error:', error.message);
    }
}

testAuth();
