module.exports = (db) => {
    const router = require('express').Router();

    // Lista de productos
    router.get('/', (req, res) => {
        db.query('SELECT * FROM products', (err, results) => {
            if (err) throw err;
            res.render('products', { 
                title: 'Productos', 
                products: results,
                user: req.session.user 
            });
        });
    });

    return router;
};