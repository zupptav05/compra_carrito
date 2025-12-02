module.exports = (db, bcrypt) => {
    const router = require('express').Router();

    // Registro
    router.get('/register', (req, res) => {
        res.render('register', { 
            title: 'Registro', 
            error: null,
            cartCount: res.locals.cartCount
        });
    });

    router.post('/register', async (req, res) => {
        const { name, email, password, confirmPassword } = req.body;
        
        // Validaciones básicas
        if (password !== confirmPassword) {
            return res.render('register', { 
                title: 'Registro', 
                error: 'Las contraseñas no coinciden',
                name,
                email,
                cartCount: res.locals.cartCount
            });
        }

        if (password.length < 6) {
            return res.render('register', { 
                title: 'Registro', 
                error: 'La contraseña debe tener al menos 6 caracteres',
                name,
                email,
                cartCount: res.locals.cartCount
            });
        }
        
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await db.promise().query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword]
            );
            
            req.session.user = {
                id: result.insertId,
                name,
                email
            };
            
            res.redirect('/products');
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.render('register', { 
                    title: 'Registro', 
                    error: 'El email ya está registrado',
                    name,
                    email,
                    cartCount: res.locals.cartCount
                });
            }
            console.error('Error en registro:', error);
            res.render('register', { 
                title: 'Registro', 
                error: 'Error en el registro',
                name,
                email,
                cartCount: res.locals.cartCount
            });
        }
    });

    // Login
    router.get('/login', (req, res) => {
        res.render('login', { 
            title: 'Iniciar Sesión', 
            error: null,
            cartCount: res.locals.cartCount
        });
    });

    router.post('/login', async (req, res) => {
        const { email, password } = req.body;
        
        try {
            const [results] = await db.promise().query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            
            if (results.length === 0) {
                return res.render('login', { 
                    title: 'Iniciar Sesión', 
                    error: 'Credenciales incorrectas',
                    email,
                    cartCount: res.locals.cartCount
                });
            }
            
            const user = results[0];
            const match = await bcrypt.compare(password, user.password);
            
            if (match) {
                req.session.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };
                res.redirect('/products');
            } else {
                res.render('login', { 
                    title: 'Iniciar Sesión', 
                    error: 'Credenciales incorrectas',
                    email,
                    cartCount: res.locals.cartCount
                });
            }
        } catch (error) {
            console.error('Error en login:', error);
            res.render('login', { 
                title: 'Iniciar Sesión', 
                error: 'Error en el inicio de sesión',
                email,
                cartCount: res.locals.cartCount
            });
        }
    });

    // Logout
    router.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/');
    });

    return router;
};