-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-11-2025 a las 04:56:51
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `carrito_compras`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total`, `status`, `created_at`) VALUES
(1, 2, 4699.97, 'pending', '2025-11-29 01:20:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_details`
--

CREATE TABLE `order_details` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `order_details`
--

INSERT INTO `order_details` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 2, 1, 999.99),
(2, 1, 3, 1, 2499.99),
(3, 1, 4, 1, 1199.99);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `category` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `image`, `stock`, `category`, `created_at`) VALUES
(1, 'iPhone 14 Pro', 'El último smartphone de Apple con Dynamic Island', 1299.99, 'iphone14.jpg', 50, 'Smartphones', '2025-11-29 00:21:25'),
(2, 'Samsung Galaxy S23', 'Potente Android con cámara de 200MP', 999.99, 'galaxy-s23.jpg', 45, 'Smartphones', '2025-11-29 00:21:25'),
(3, 'MacBook Pro 16\"', 'Laptop profesional con chip M2 Pro', 2499.99, 'macbook-pro.jpg', 30, 'Laptops', '2025-11-29 00:21:25'),
(4, 'Dell XPS 13', 'Laptop ultradelgada con pantalla InfinityEdge', 1199.99, 'dell-xps13.jpg', 35, 'Laptops', '2025-11-29 00:21:25'),
(5, 'iPad Air', 'Tablet versátil con chip M1', 749.99, 'ipad-air.jpg', 60, 'Tablets', '2025-11-29 00:21:25'),
(6, 'Samsung Tab S8', 'Tablet Android premium con S Pen incluido', 849.99, 'tab-s8.jpg', 40, 'Tablets', '2025-11-29 00:21:25'),
(7, 'AirPods Pro', 'Audífonos inalámbricos con cancelación activa de ruido', 249.99, 'airpods-pro.jpg', 100, 'Audio', '2025-11-29 00:21:25'),
(8, 'Sony WH-1000XM5', 'Audífonos over-ear con mejor cancelación de ruido', 399.99, 'sony-xm5.jpg', 75, 'Audio', '2025-11-29 00:21:25'),
(9, 'Apple Watch Series 8', 'Smartwatch con monitor de temperatura corporal', 429.99, 'apple-watch.jpg', 80, 'Wearables', '2025-11-29 00:21:25'),
(10, 'Samsung Galaxy Watch 5', 'Smartwatch con monitor de sueño avanzado', 279.99, 'galaxy-watch.jpg', 65, 'Wearables', '2025-11-29 00:21:25'),
(11, 'Nintendo Switch OLED', 'Consola híbrida con pantalla OLED mejorada', 349.99, 'switch-oled.jpg', 25, 'Gaming', '2025-11-29 00:21:25'),
(12, 'PlayStation 5', 'Consola de última generación con SSD ultrarrápido', 499.99, 'ps5.jpg', 20, 'Gaming', '2025-11-29 00:21:25'),
(13, 'Xbox Series X', 'La consola más potente de Microsoft', 499.99, 'xbox-series-x.jpg', 22, 'Gaming', '2025-11-29 00:21:25'),
(14, 'Monitor Dell 27\" 4K', 'Monitor UHD para trabajo y entretenimiento', 399.99, 'dell-monitor.jpg', 40, 'Monitores', '2025-11-29 00:21:25'),
(15, 'LG OLED 55\"', 'TV OLED con calidad de imagen excepcional', 1299.99, 'lg-oled.jpg', 15, 'Televisores', '2025-11-29 00:21:25'),
(16, 'Samsung QLED 65\"', 'TV QLED con Quantum HDR', 1499.99, 'samsung-qled.jpg', 12, 'Televisores', '2025-11-29 00:21:25'),
(17, 'Google Nest Hub', 'Pantalla inteligente con Google Assistant', 99.99, 'nest-hub.jpg', 90, 'Smart Home', '2025-11-29 00:21:25'),
(18, 'Amazon Echo Dot', 'Altavoz inteligente con Alexa', 49.99, 'echo-dot.jpg', 120, 'Smart Home', '2025-11-29 00:21:25'),
(19, 'Logitech MX Master 3', 'Ratón ergonómico para productividad', 99.99, 'mx-master.jpg', 70, 'Accesorios', '2025-11-29 00:21:25'),
(20, 'Teclado Mecánico Keychron', 'Teclado mecánico inalámbrico', 89.99, 'keychron.jpg', 55, 'Accesorios', '2025-11-29 00:21:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'zuppa', 'zupponsio@hotmail.com', 'admin123', '2025-11-29 00:26:09'),
(2, 'gustav', 'gzv2003@gmail.com', '$2b$10$kOMW.kRvEXKas1p9vxb/Muxv8b17koq68EaFeFRcKb5xWJH8/43Ie', '2025-11-29 00:27:18');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Filtros para la tabla `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
