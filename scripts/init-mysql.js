const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeMySQL() {
    const config = {
        host: process.env.MYSQLHOST || 'localhost',
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD || '',
        port: process.env.MYSQLPORT || 3306,
        multipleStatements: true
    };

    try {
        console.log('🔌 Conectando a MySQL en Railway...');
        
        // Conectar sin especificar base de datos primero
        const connection = await mysql.createConnection(config);
        
        // Leer schema SQL
        const schemaPath = path.join(__dirname, '../database/mysql_schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📝 Ejecutando schema SQL...');
        await connection.query(schemaSQL);
        
        console.log('✅ Base de datos MySQL inicializada exitosamente');
        await connection.end();
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error inicializando MySQL:', error);
        process.exit(1);
    }
}

initializeMySQL();
