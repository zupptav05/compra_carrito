const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();

// Configuración
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sesiones para producción
app.use(session({
    secret: process.env.SESSION_SECRET || 'mi_secreto_super_seguro_produccion',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Cambiar a true si usas HTTPS
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// Conexión a MySQL de InfinityFree
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'sql202.infinityfree.com',
    user: process.env.DB_USER || 'if0_38651235',
    password: process.env.DB_PASSWORD || '82vCNrtgb2N2Yq2',
    database: process.env.DB_NAME || 'if0_38651235_carrito_compras',
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        // No lanzar error para que la app siga funcionando
        return;
    }
    console.log('Conectado a MySQL en InfinityFree');
});

// Middleware para usuario en sesión y contador del carrito
app.use(async (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.cartCount = 0;
    
    // Si hay usuario logueado y la BD está conectada, obtener contador del carrito
    if (req.session.user && db) {
        try {
            const [results] = await db.promise().query(
                'SELECT SUM(quantity) as total FROM cart WHERE user_id = ?',
                [req.session.user.id]
            );
            res.locals.cartCount = results[0].total || 0;
        } catch (error) {
            console.error('Error obteniendo contador del carrito:', error);
            res.locals.cartCount = 0;
        }
    }
    
    next();
});

// Rutas
app.use('/auth', require('./routes/auth')(db, bcrypt));
app.use('/products', require('./routes/products')(db));
app.use('/cart', require('./routes/cart')(db));
app.use('/orders', require('./routes/orders')(db));

// Ruta principal
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Inicio',
        cartCount: res.locals.cartCount
    });
});

// Manejo de errores para producción
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        message: 'Algo salió mal en el servidor'
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
    console.log(`Servidor corriendo en puerto ${PORT}`);
});