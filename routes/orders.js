module.exports = (db) => {
    const router = require('express').Router();

    // Historial de compras
    router.get('/history', (req, res) => {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        const userId = req.session.user.id;
        
        const query = `
            SELECT o.*, 
                   GROUP_CONCAT(CONCAT(od.quantity, 'x ', p.name) SEPARATOR ', ') as products
            FROM orders o
            LEFT JOIN order_details od ON o.id = od.order_id
            LEFT JOIN products p ON od.product_id = p.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        
        db.query(query, [userId], (err, results) => {
            if (err) throw err;
            
            res.render('profile', {
                title: 'Historial de Compras',
                orders: results
            });
        });
    });

    // Realizar compra
    router.post('/checkout', (req, res) => {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        const userId = req.session.user.id;

        // Obtener items del carrito
        const cartQuery = `
            SELECT c.*, p.name, p.price
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `;

        db.query(cartQuery, [userId], (err, cartItems) => {
            if (err) throw err;

            if (cartItems.length === 0) {
                return res.json({ success: false, message: 'Carrito vacío' });
            }

            // Calcular total
            const total = cartItems.reduce((sum, item) => 
                sum + (item.quantity * parseFloat(item.price)), 0
            );

            // Crear orden
            db.query(
                'INSERT INTO orders (user_id, total) VALUES (?, ?)',
                [userId, total],
                (err, result) => {
                    if (err) throw err;

                    const orderId = result.insertId;

                    // Agregar detalles de la orden
                    const orderDetails = cartItems.map(item => [
                        orderId,
                        item.product_id,
                        item.quantity,
                        item.price
                    ]);

                    db.query(
                        'INSERT INTO order_details (order_id, product_id, quantity, price) VALUES ?',
                        [orderDetails],
                        (err) => {
                            if (err) throw err;

                            // Vaciar carrito
                            db.query(
                                'DELETE FROM cart WHERE user_id = ?',
                                [userId],
                                (err) => {
                                    if (err) throw err;

                                    res.json({ 
                                        success: true, 
                                        orderId: orderId,
                                        message: 'Compra realizada exitosamente' 
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    });

    // Detalles de orden
    router.get('/:id', (req, res) => {
        const orderId = req.params.id;
        
        const query = `
            SELECT o.*, od.*, p.name, p.image
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            JOIN products p ON od.product_id = p.id
            WHERE o.id = ?
        `;
        
        db.query(query, [orderId], (err, results) => {
            if (err) throw err;
            
            if (results.length === 0) {
                return res.redirect('/orders/history');
            }
            
            res.render('order-confirmation', {
                title: 'Confirmación de Orden',
                order: results[0],
                orderDetails: results
            });
        });
    });

    return router;
};