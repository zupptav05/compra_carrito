module.exports = (pool) => {
    const router = require('express').Router();

    // Agregar al carrito
    router.post('/add', async (req, res) => {
        if (!req.session.user) {
            return res.json({ success: false, message: 'Debe iniciar sesión' });
        }

        const { productId, quantity = 1 } = req.body;
        const userId = req.session.user.id;

        try {
            // Verificar stock
            const productResult = await pool.query(
                'SELECT stock FROM products WHERE id = $1',
                [productId]
            );

            if (productResult.rows.length === 0) {
                return res.json({ success: false, message: 'Producto no encontrado' });
            }

            const stock = productResult.rows[0].stock;
            
            // Verificar si ya existe en el carrito
            const existingResult = await pool.query(
                'SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2',
                [userId, productId]
            );

            let newQuantity = parseInt(quantity);
            
            if (existingResult.rows.length > 0) {
                newQuantity += existingResult.rows[0].quantity;
                
                if (newQuantity > stock) {
                    return res.json({ 
                        success: false, 
                        message: `Stock insuficiente. Máximo: ${stock}` 
                    });
                }
                
                // Actualizar cantidad
                await pool.query(
                    'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
                    [newQuantity, userId, productId]
                );
            } else {
                // Insertar nuevo
                await pool.query(
                    'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
                    [userId, productId, quantity]
                );
            }

            // Obtener nuevo contador
            const countResult = await pool.query(
                'SELECT SUM(quantity) as total FROM cart WHERE user_id = $1',
                [userId]
            );

            res.json({ 
                success: true, 
                message: 'Producto agregado al carrito',
                cartCount: parseInt(countResult.rows[0]?.total) || 0
            });

        } catch (error) {
            console.error('[Railway Cart Error]', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error del servidor' 
            });
        }
    });

    return router;
};