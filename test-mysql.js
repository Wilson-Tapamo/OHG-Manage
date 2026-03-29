const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Testing direct MySQL/MariaDB connection...');

    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'optimum_juridis'
        });

        console.log('✅ Connection successful!');

        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('Query result:', rows);

        await connection.end();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Error code:', error.code);
    }
}

testConnection();
