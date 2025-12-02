CREATE DATABASE IF NOT EXISTS carrito_compras;
USE carrito_compras;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    stock INT DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (name, description, price, image, stock, category) VALUES
('iPhone 14 Pro', 'El último smartphone de Apple con Dynamic Island', 1299.99, 'iphone14.jpg', 50, 'Smartphones'),
('Samsung Galaxy S23', 'Potente Android con cámara de 200MP', 999.99, 'galaxy-s23.jpg', 45, 'Smartphones'),
('MacBook Pro 16"', 'Laptop profesional con chip M2 Pro', 2499.99, 'macbook-pro.jpg', 30, 'Laptops'),
('Dell XPS 13', 'Laptop ultradelgada con pantalla InfinityEdge', 1199.99, 'dell-xps13.jpg', 35, 'Laptops'),
('iPad Air', 'Tablet versátil con chip M1', 749.99, 'ipad-air.jpg', 60, 'Tablets'),
('Samsung Tab S8', 'Tablet Android premium con S Pen incluido', 849.99, 'tab-s8.jpg', 40, 'Tablets'),
('AirPods Pro', 'Audífonos inalámbricos con cancelación activa de ruido', 249.99, 'airpods-pro.jpg', 100, 'Audio'),
('Sony WH-1000XM5', 'Audífonos over-ear con mejor cancelación de ruido', 399.99, 'sony-xm5.jpg', 75, 'Audio'),
('Apple Watch Series 8', 'Smartwatch con monitor de temperatura corporal', 429.99, 'apple-watch.jpg', 80, 'Wearables'),
('Samsung Galaxy Watch 5', 'Smartwatch con monitor de sueño avanzado', 279.99, 'galaxy-watch.jpg', 65, 'Wearables'),
('Nintendo Switch OLED', 'Consola híbrida con pantalla OLED mejorada', 349.99, 'switch-oled.jpg', 25, 'Gaming'),
('PlayStation 5', 'Consola de última generación con SSD ultrarrápido', 499.99, 'ps5.jpg', 20, 'Gaming'),
('Xbox Series X', 'La consola más potente de Microsoft', 499.99, 'xbox-series-x.jpg', 22, 'Gaming'),
('Monitor Dell 27" 4K', 'Monitor UHD para trabajo y entretenimiento', 399.99, 'dell-monitor.jpg', 40, 'Monitores'),
('LG OLED 55"', 'TV OLED con calidad de imagen excepcional', 1299.99, 'lg-oled.jpg', 15, 'Televisores'),
('Samsung QLED 65"', 'TV QLED con Quantum HDR', 1499.99, 'samsung-qled.jpg', 12, 'Televisores'),
('Google Nest Hub', 'Pantalla inteligente con Google Assistant', 99.99, 'nest-hub.jpg', 90, 'Smart Home'),
('Amazon Echo Dot', 'Altavoz inteligente con Alexa', 49.99, 'echo-dot.jpg', 120, 'Smart Home'),
('Logitech MX Master 3', 'Ratón ergonómico para productividad', 99.99, 'mx-master.jpg', 70, 'Accesorios'),
('Teclado Mecánico Keychron', 'Teclado mecánico inalámbrico', 89.99, 'keychron.jpg', 55, 'Accesorios');
