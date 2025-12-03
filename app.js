const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(session);

const app = express();

// Configuración
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de MySQL para Railway
const dbConfig = {
    host: process.env.MYSQLHOST || 'mysql.railway.internal',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'bJcXFuPSNYaCCdhJfWZGJbylPeqTttvN',
    database: process.env.MYSQLDATABASE || 'railway',
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool({
    ...dbConfig,
    ssl: process.env.NODE_ENV === 'production' ? { 
        rejectUnauthorized: false 
    } : undefined
});

// Configurar store de sesiones para MySQL
const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 minutos
    expiration: 86400000, // 24 horas
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, pool);

// Sesiones para Railway con MySQL
app.use(session({
    key: 'techstore_session',
    secret: process.env.SESSION_SECRET || 'railway_mysql_dev_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

// Middleware para inyectar pool
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Middleware para usuario en sesión
app.use(async (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.cartCount = 0;
    
    if (req.session.user) {
        try {
            const [rows] = await pool.execute(
                'SELECT SUM(quantity) as total FROM cart WHERE user_id = ?',
                [req.session.user.id]
            );
            res.locals.cartCount = rows[0]?.total || 0;
        } catch (error) {
            console.error('Error obteniendo contador del carrito:', error.message);
            res.locals.cartCount = 0;
        }
    }
    
    next();
});

// Importar rutas
const authRoutes = require('./routes/auth')(pool, bcrypt);
const productRoutes = require('./routes/products')(pool);
const cartRoutes = require('./routes/cart')(pool);
const orderRoutes = require('./routes/orders')(pool);

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'TechStore - Inicio',
        cartCount: res.locals.cartCount
    });
});

// Health check para Railway con MySQL
app.get('/health', async (req, res) => {
    try {
        // Verificar conexión a MySQL
        const [result] = await pool.execute('SELECT 1 as status');
        
        res.json({ 
            status: 'healthy',
            environment: process.env.NODE_ENV || 'development',
            database: 'MySQL',
            database_status: result[0].status === 1 ? 'connected' : 'error',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage()
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ 
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Metrics para Railway
app.get('/metrics', (req, res) => {
    const metrics = {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
            host: process.env.MYSQLHOST || 'localhost',
            database: process.env.MYSQLDATABASE || 'techstore'
        }
    };
    res.json(metrics);
});

// Ruta para verificar variables de entorno (solo desarrollo)
if (process.env.NODE_ENV !== 'production') {
    app.get('/env', (req, res) => {
        res.json({
            mysql_host: process.env.MYSQLHOST,
            mysql_user: process.env.MYSQLUSER,
            mysql_database: process.env.MYSQLDATABASE,
            mysql_port: process.env.MYSQLPORT,
            node_env: process.env.NODE_ENV
        });
    });
}

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('[Railway MySQL Error]', err.stack);
    
    // Log detallado para MySQL errors
    if (err.code && err.code.startsWith('ER_')) {
        console.error('MySQL Error Details:', {
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            sqlMessage: err.sqlMessage
        });
    }
    
    res.status(500).render('error', {
        title: 'Error - TechStore',
        message: 'Algo salió mal. Por favor, intenta nuevamente.'
    });
});

// Ruta 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Página No Encontrada'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TechStore ejecutándose en Railway con MySQL`);
    console.log(`📍 Puerto: ${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Base de datos: ${process.env.MYSQLDATABASE || 'techstore'}`);
    console.log(`🔗 URL: ${process.env.RAILWAY_STATIC_URL || 'http://localhost:' + PORT}`);
    
    // Mostrar info de conexión (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
        console.log('📊 Configuración MySQL:');
        console.log(`   Host: ${process.env.MYSQLHOST || 'localhost'}`);
        console.log(`   Database: ${process.env.MYSQLDATABASE || 'techstore'}`);
    }
});