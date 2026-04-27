-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 15, 2026 at 10:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ishtacrafts_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `custom_id` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `type` enum('percentage','flat') NOT NULL DEFAULT 'percentage',
  `min_order` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_uses` int(11) DEFAULT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `valid_until` datetime(3) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `custom_id`, `code`, `description`, `discount`, `type`, `min_order`, `max_uses`, `used_count`, `valid_until`, `active`, `created_at`, `updated_at`) VALUES
(1, 'cup-1775635219765', 'GET', 'asd', 10.00, 'flat', 1.00, 100, 0, '2026-04-02 00:00:00.000', 1, '2026-04-08 08:00:19.781', '2026-04-08 08:00:19.781'),
(2, 'cup-1775637665491', 'SAVE20', 'asd', 20.00, 'flat', 0.00, 1, 1, '2026-04-24 00:00:00.000', 1, '2026-04-08 08:41:05.508', '2026-04-09 07:10:44.179'),
(3, 'cup-1775637955659', 'SAVE1', 'reduce 1 ruppe', 1.00, 'flat', 1.00, 2, 0, '2026-04-17 00:00:00.000', 1, '2026-04-08 08:45:55.671', '2026-04-08 08:45:55.671'),
(4, 'cup-1775646552607', 'LIMIT1', 'test coupon', 100.00, 'flat', 0.00, 1, 0, NULL, 1, '2026-04-08 11:09:12.644', '2026-04-08 11:09:12.644'),
(5, 'cup-1775647277436', 'TEST_LIMIT_1', 'Verification Coupon', 100.00, 'flat', 0.00, 1, 0, NULL, 1, '2026-04-08 11:21:17.493', '2026-04-08 11:21:17.493'),
(6, 'cup-1775647716349', 'LIMIT_EXCEEDED_TEST', 'Test coupon with 0 uses limit', 50.00, 'flat', 0.00, NULL, 0, NULL, 1, '2026-04-08 11:28:36.370', '2026-04-08 11:28:36.370'),
(7, 'cup-1775720837469', 'R', 'dfgsdfg', 10.00, 'percentage', 1.00, 10, 4, '2026-04-23 00:00:00.000', 1, '2026-04-09 07:47:17.480', '2026-04-14 01:37:37.125');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `firebase_uid` varchar(128) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('customer','admin') NOT NULL DEFAULT 'customer',
  `orders` int(11) NOT NULL DEFAULT 0,
  `total_spent` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','inactive','banned') NOT NULL DEFAULT 'active',
  `cart` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`cart`)),
  `wishlist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`wishlist`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `firebase_uid`, `name`, `email`, `phone`, `role`, `orders`, `total_spent`, `status`, `cart`, `wishlist`, `created_at`, `updated_at`) VALUES
(1, '5mveDFVafchJKZ9nYfChSnCSBYx2', 'ks', 'kushagra@gmail.com', NULL, 'customer', 0, 0.00, 'active', '[]', '[]', '2026-04-04 02:35:46.009', '2026-04-04 02:42:35.123'),
(2, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 'Kushagra Sharma', '19kushagra0@gmail.com', NULL, 'customer', 35, 354.00, 'active', '[{\"_id\":\"69cc36253cfecbf3f28d3be3\",\"id\":\"gi-001\",\"slug\":\"silk-scarf-banarasi-gift-box\",\"title\":\"Banarasi Silk Scarf — Gift Box\",\"description\":\"Luxurious hand-woven Banarasi silk scarf with zari border work.\",\"price\":1,\"category\":\"gift-items\",\"images\":[\"/images/pexels-photo-36455711.webp\"],\"stock\":21,\"artisan\":\"Looms of Benaras, Varanasi\",\"tags\":[\"silk\",\"banarasi\",\"scarf\",\"GI-tag\",\"gift-box\"],\"featured\":true,\"rating\":4.9,\"reviews\":215,\"weight\":\"180g\",\"dimensions\":\"200 × 70 cm\",\"quantity\":\"1 piece\",\"size\":\"79 x 27 inches\",\"material\":\"Aluminium\",\"color\":\"Royal Crimson with Gold Zari\",\"updatedAt\":\"2026-04-09T07:48:19.211Z\",\"qty\":1},{\"_id\":\"69cc36253cfecbf3f28d3bdd\",\"id\":\"tt-005\",\"slug\":\"channapatna-chess-set\",\"title\":\"Channapatna Lacquerware Chess Set\",\"description\":\"Iconic Channapatna lacquerware chess set in candy-striped ivory and ebony tones.\",\"price\":1,\"category\":\"table-top-mount\",\"images\":[\"/images/pexels-photo-12520327.webp\"],\"video\":\"/videos/oceans.mp4\",\"stock\":10,\"artisan\":\"Craft Collective, Channapatna\",\"tags\":[\"channapatna\",\"lacquerware\",\"chess\",\"GI-tag\",\"lathe\"],\"featured\":true,\"rating\":4.9,\"reviews\":52,\"weight\":\"1.2kg\",\"dimensions\":\"30 × 30 cm board\",\"quantity\":\"32 pieces + board\",\"size\":\"12 x 12 inches (board)\",\"material\":\"Brass\",\"color\":\"Ivory & Ebony\",\"updatedAt\":\"2026-04-09T07:48:19.421Z\",\"qty\":1},{\"_id\":\"69cc36253cfecbf3f28d3bd9\",\"id\":\"tt-007\",\"slug\":\"buddha-meditation-collection\",\"title\":\"Buddha Meditation Collection\",\"description\":\"Premium metal Buddha sculptures and wall art. Bring peace and serenity to your space with our exclusive collection. Each piece is hand-finished with a rich bronze patina.\",\"price\":1,\"category\":\"table-top-mount\",\"images\":[\"/images/pexels-photo-14694207.webp\"],\"video\":\"/videos/oceans.mp4\",\"stock\":9,\"artisan\":\"Vishwa Crafts, Varanasi\",\"tags\":[\"buddha\",\"meditation\",\"metal-art\",\"bronze\",\"spiritual\",\"brass-idols\"],\"featured\":true,\"rating\":5,\"reviews\":215,\"weight\":\"1.5kg\",\"dimensions\":\"30 × 20 × 40 cm\",\"quantity\":\"1 piece\",\"size\":\"16 x 10 x 8 inches\",\"material\":\"Bronze\",\"color\":\"Deep Bronze Patina\",\"updatedAt\":\"2026-04-13T08:30:21.989Z\",\"qty\":1},{\"_id\":\"69cc36253cfecbf3f28d3bd7\",\"id\":\"wh-009\",\"slug\":\"peacock-metal-wall-art\",\"title\":\"Peacock Metal Wall Art\",\"description\":\"Stunning peacock metal wall art — India\'s national bird rendered in breathtaking aluminium with hand-painted enamel feather details. A true showstopper.\",\"price\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/pexels-photo-12896785.webp\"],\"stock\":9,\"artisan\":\"Local Artisan\",\"tags\":[\"peacock\",\"metal\",\"wall-art\",\"aluminium\",\"metal-handicrafts-india\"],\"featured\":true,\"rating\":5,\"reviews\":212,\"weight\":\"1kg\",\"dimensions\":\"30 x 30 cm\",\"quantity\":\"1 piece\",\"size\":\"24 x 18 inches\",\"material\":\"Aluminium\",\"color\":\"Teal & Gold Enamel\",\"updatedAt\":\"2026-04-12T02:43:49.862Z\",\"qty\":1}]', '[{\"_id\":\"69d31be25667a6b4c9687bdc\",\"slug\":\"assssssssssssssssssssssssssssss\",\"title\":\"assssssssssssssssssssssssssssss\",\"description\":\"\",\"price\":11,\"salePrice\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/offer-f6cd7197.webp\"],\"stock\":11,\"artisan\":\"\",\"tags\":[\"wall-hangings\"],\"featured\":false,\"rating\":4.5,\"reviews\":0,\"quantity\":\"1 piece\",\"size\":\"\",\"material\":\"Brass\",\"color\":\"\",\"type\":\"product\",\"createdAt\":\"2026-04-06T02:35:14.379Z\",\"updatedAt\":\"2026-04-06T02:35:14.379Z\",\"__v\":0},{\"_id\":\"69cc36253cfecbf3f28d3bd2\",\"id\":\"wh-004\",\"slug\":\"lakshmi-brass-wall-art\",\"title\":\"Lakshmi Brass Wall Art\",\"description\":\"Premium Lakshmi brass wall art, intricately crafted to invoke the goddess of wealth and prosperity. A sacred addition to puja rooms and living spaces alike.\",\"price\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/pexels-photo-33810565.webp\"],\"stock\":19,\"artisan\":\"Local Artisan\",\"tags\":[\"lakshmi\",\"brass\",\"wall-art\",\"metal-handicrafts-india\",\"brass-idols\"],\"featured\":true,\"rating\":4.9,\"reviews\":189,\"weight\":\"1kg\",\"dimensions\":\"30 x 30 cm\",\"quantity\":\"1 piece\",\"size\":\"14 x 10 inches\",\"material\":\"Brass\",\"color\":\"Antique Gold\",\"updatedAt\":\"2026-04-06T21:38:14.173Z\"},{\"_id\":\"69cc36253cfecbf3f28d3bd9\",\"id\":\"tt-007\",\"slug\":\"buddha-meditation-collection\",\"title\":\"Buddha Meditation Collection\",\"description\":\"Premium metal Buddha sculptures and wall art. Bring peace and serenity to your space with our exclusive collection. Each piece is hand-finished with a rich bronze patina.\",\"price\":1,\"category\":\"table-top-mount\",\"images\":[\"/images/pexels-photo-14694207.webp\"],\"video\":\"/videos/oceans.mp4\",\"stock\":4,\"artisan\":\"Vishwa Crafts, Varanasi\",\"tags\":[\"buddha\",\"meditation\",\"metal-art\",\"bronze\",\"spiritual\",\"brass-idols\"],\"featured\":true,\"rating\":5,\"reviews\":215,\"weight\":\"1.5kg\",\"dimensions\":\"30 × 20 × 40 cm\",\"quantity\":\"1 piece\",\"size\":\"16 x 10 x 8 inches\",\"material\":\"Bronze\",\"color\":\"Deep Bronze Patina\",\"updatedAt\":\"2026-04-09T09:12:00.687Z\"}]', '2026-04-04 02:42:54.784', '2026-04-14 01:16:07.397'),
(3, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 'rahul thapliyal', 'rahul.thapliyal902@gmail.com', NULL, 'customer', 6, 37.00, 'active', '[{\"_id\":\"69cc36253cfecbf3f28d3bd9\",\"id\":\"tt-007\",\"slug\":\"buddha-meditation-collection\",\"title\":\"Buddha Meditation Collection\",\"description\":\"Premium metal Buddha sculptures and wall art. Bring peace and serenity to your space with our exclusive collection. Each piece is hand-finished with a rich bronze patina.\",\"price\":1,\"category\":\"table-top-mount\",\"images\":[\"/images/pexels-photo-14694207.webp\"],\"video\":\"/videos/oceans.mp4\",\"stock\":15,\"artisan\":\"Vishwa Crafts, Varanasi\",\"tags\":[\"buddha\",\"meditation\",\"metal-art\",\"bronze\",\"spiritual\",\"brass-idols\"],\"featured\":true,\"rating\":5,\"reviews\":215,\"weight\":\"1.5kg\",\"dimensions\":\"30 × 20 × 40 cm\",\"quantity\":\"1 piece\",\"size\":\"16 x 10 x 8 inches\",\"material\":\"Bronze\",\"color\":\"Deep Bronze Patina\",\"updatedAt\":\"2026-03-31T21:56:24.125Z\",\"qty\":1},{\"_id\":\"69d31be25667a6b4c9687bdc\",\"slug\":\"assssssssssssssssssssssssssssss\",\"title\":\"assssssssssssssssssssssssssssss\",\"description\":\"\",\"price\":11,\"salePrice\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/offer-f6cd7197.webp\"],\"stock\":11,\"artisan\":\"\",\"tags\":[\"wall-hangings\"],\"featured\":false,\"rating\":4.5,\"reviews\":0,\"quantity\":\"1 piece\",\"size\":\"\",\"material\":\"Brass\",\"color\":\"\",\"type\":\"product\",\"createdAt\":\"2026-04-06T02:35:14.379Z\",\"updatedAt\":\"2026-04-06T02:35:14.379Z\",\"__v\":0,\"qty\":4},{\"_id\":\"69cc3836dd1f4f1884afbe6d\",\"id\":\"p-1774991414632\",\"slug\":\"asdasd\",\"title\":\"asdasd\",\"description\":\"sdasd\",\"price\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/offer-f6cd7197.webp\"],\"stock\":38,\"artisan\":\"sdfsd\",\"tags\":[\"wall-hangings\"],\"featured\":false,\"rating\":4.5,\"reviews\":0,\"quantity\":\"1 piece\",\"size\":\"asdasd\",\"material\":\"Brass\",\"color\":\"asda\",\"createdAt\":\"2026-03-31T21:10:14.648Z\",\"updatedAt\":\"2026-04-04T00:02:17.482Z\",\"__v\":0,\"type\":\"product\",\"qty\":1},{\"_id\":\"69cc36253cfecbf3f28d3bd3\",\"id\":\"wh-005\",\"slug\":\"om-symbol-metal-decor\",\"title\":\"Om Symbol Metal Decor\",\"description\":\"Spiritual Om symbol metal decor in premium aluminium. A modern minimalist take on an ancient sacred symbol — perfect for meditation spaces and contemporary interiors.\",\"price\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/pexels-photo-32112529.webp\"],\"stock\":17,\"artisan\":\"Local Artisan\",\"tags\":[\"om\",\"spiritual\",\"decor\",\"aluminium\",\"metal-handicrafts-india\"],\"featured\":false,\"rating\":4.7,\"reviews\":142,\"weight\":\"1kg\",\"dimensions\":\"30 x 30 cm\",\"quantity\":\"1 piece\",\"size\":\"10 x 10 inches\",\"material\":\"Aluminium\",\"color\":\"Brushed Silver\",\"updatedAt\":\"2026-03-31T22:01:59.799Z\",\"qty\":1},{\"_id\":\"69cc36253cfecbf3f28d3bd0\",\"id\":\"wh-002\",\"slug\":\"buddha-meditation-wall-art\",\"title\":\"Buddha Meditation Wall Art\",\"description\":\"Beautiful hand-crafted Buddha wall art in premium bronze finish. Each piece is hand-finished with a rich patina that deepens with age.\",\"price\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/pexels-photo-14694207.webp\"],\"stock\":19,\"artisan\":\"Local Artisan\",\"tags\":[\"buddha\",\"meditation\",\"wall-art\",\"bronze\",\"metal-handicrafts-india\"],\"featured\":true,\"rating\":4.8,\"reviews\":124,\"weight\":\"1kg\",\"dimensions\":\"30 x 30 cm\",\"quantity\":\"1 piece\",\"size\":\"12 x 12 inches\",\"material\":\"Bronze\",\"color\":\"Rich Bronze Patina\",\"updatedAt\":\"2026-04-06T21:38:14.396Z\",\"qty\":1},{\"_id\":\"69cc36253cfecbf3f28d3bd5\",\"id\":\"wh-007\",\"slug\":\"krishna-brass-figurine\",\"title\":\"Krishna Brass Figurine\",\"description\":\"Handcrafted Krishna brass figurine for wall display. Depicted in the iconic flute-playing pose, this piece radiates divine joy and artistic excellence.\",\"price\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/pexels-photo-31477845.webp\"],\"stock\":23,\"artisan\":\"Local Artisan\",\"tags\":[\"krishna\",\"brass\",\"figurine\",\"brass-idols\",\"custom-sculptures-india\"],\"featured\":true,\"rating\":4.8,\"reviews\":167,\"weight\":\"1kg\",\"dimensions\":\"30 x 30 cm\",\"quantity\":\"1 piece\",\"size\":\"16 x 8 inches\",\"material\":\"Brass\",\"color\":\"Warm Gold\",\"updatedAt\":\"2026-04-06T21:38:13.951Z\",\"qty\":1}]', '[{\"_id\":\"69cc36253cfecbf3f28d3bd2\",\"id\":\"wh-004\",\"slug\":\"lakshmi-brass-wall-art\",\"title\":\"Lakshmi Brass Wall Art\",\"description\":\"Premium Lakshmi brass wall art, intricately crafted to invoke the goddess of wealth and prosperity. A sacred addition to puja rooms and living spaces alike.\",\"price\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/pexels-photo-33810565.webp\"],\"stock\":19,\"artisan\":\"Local Artisan\",\"tags\":[\"lakshmi\",\"brass\",\"wall-art\",\"metal-handicrafts-india\",\"brass-idols\"],\"featured\":true,\"rating\":4.9,\"reviews\":189,\"weight\":\"1kg\",\"dimensions\":\"30 x 30 cm\",\"quantity\":\"1 piece\",\"size\":\"14 x 10 inches\",\"material\":\"Brass\",\"color\":\"Antique Gold\",\"updatedAt\":\"2026-04-06T21:38:14.173Z\"},{\"_id\":\"69cc36253cfecbf3f28d3bd9\",\"id\":\"tt-007\",\"slug\":\"buddha-meditation-collection\",\"title\":\"Buddha Meditation Collection\",\"description\":\"Premium metal Buddha sculptures and wall art. Bring peace and serenity to your space with our exclusive collection. Each piece is hand-finished with a rich bronze patina.\",\"price\":1,\"category\":\"table-top-mount\",\"images\":[\"/images/pexels-photo-14694207.webp\"],\"video\":\"/videos/oceans.mp4\",\"stock\":4,\"artisan\":\"Vishwa Crafts, Varanasi\",\"tags\":[\"buddha\",\"meditation\",\"metal-art\",\"bronze\",\"spiritual\",\"brass-idols\"],\"featured\":true,\"rating\":5,\"reviews\":215,\"weight\":\"1.5kg\",\"dimensions\":\"30 × 20 × 40 cm\",\"quantity\":\"1 piece\",\"size\":\"16 x 10 x 8 inches\",\"material\":\"Bronze\",\"color\":\"Deep Bronze Patina\",\"updatedAt\":\"2026-04-09T09:12:00.687Z\"}]', '2026-04-04 03:51:28.960', '2026-04-14 02:02:38.448'),
(4, 'uruAsX7FTRWVTu6H8go7NoKdICg1', 'Admin Test', 'admin@test.com', NULL, 'customer', 0, 0.00, 'active', '[]', '[]', '2026-04-06 01:26:42.568', '2026-04-06 01:28:52.126'),
(5, 'qdQ1WffyeNgOB2ht8dqFKzxL4Ly2', 'sads', NULL, '+917428089885', 'customer', 1, 45.00, 'active', '[]', '[]', '2026-04-06 04:13:25.759', '2026-04-12 01:57:26.248'),
(6, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 'Kushagra Sharma', 'kushagrasharma55326@gmail.com', NULL, 'customer', 11, 931.00, 'active', '[{\"_id\":\"69cc36253cfecbf3f28d3bd7\",\"id\":\"wh-009\",\"slug\":\"peacock-metal-wall-art\",\"title\":\"Peacock Metal Wall Art\",\"description\":\"Stunning peacock metal wall art — India\'s national bird rendered in breathtaking aluminium with hand-painted enamel feather details. A true showstopper.\",\"price\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/pexels-photo-12896785.webp\"],\"stock\":13,\"artisan\":\"Local Artisan\",\"tags\":[\"peacock\",\"metal\",\"wall-art\",\"aluminium\",\"metal-handicrafts-india\"],\"featured\":true,\"rating\":5,\"reviews\":212,\"weight\":\"1kg\",\"dimensions\":\"30 x 30 cm\",\"quantity\":\"1 piece\",\"size\":\"24 x 18 inches\",\"material\":\"Aluminium\",\"color\":\"Teal & Gold Enamel\",\"updatedAt\":\"2026-04-09T07:48:19.633Z\",\"qty\":1},{\"_id\":\"69cc36253cfecbf3f28d3be3\",\"id\":\"gi-001\",\"slug\":\"silk-scarf-banarasi-gift-box\",\"title\":\"Banarasi Silk Scarf — Gift Box\",\"description\":\"Luxurious hand-woven Banarasi silk scarf with zari border work.\",\"price\":1,\"category\":\"gift-items\",\"images\":[\"/images/pexels-photo-36455711.webp\"],\"stock\":21,\"artisan\":\"Looms of Benaras, Varanasi\",\"tags\":[\"silk\",\"banarasi\",\"scarf\",\"GI-tag\",\"gift-box\"],\"featured\":true,\"rating\":4.9,\"reviews\":215,\"weight\":\"180g\",\"dimensions\":\"200 × 70 cm\",\"quantity\":\"1 piece\",\"size\":\"79 x 27 inches\",\"material\":\"Aluminium\",\"color\":\"Royal Crimson with Gold Zari\",\"updatedAt\":\"2026-04-09T07:48:19.211Z\",\"qty\":1},{\"_id\":\"69cc36253cfecbf3f28d3bdd\",\"id\":\"tt-005\",\"slug\":\"channapatna-chess-set\",\"title\":\"Channapatna Lacquerware Chess Set\",\"description\":\"Iconic Channapatna lacquerware chess set in candy-striped ivory and ebony tones.\",\"price\":1,\"category\":\"table-top-mount\",\"images\":[\"/images/pexels-photo-12520327.webp\"],\"video\":\"/videos/oceans.mp4\",\"stock\":10,\"artisan\":\"Craft Collective, Channapatna\",\"tags\":[\"channapatna\",\"lacquerware\",\"chess\",\"GI-tag\",\"lathe\"],\"featured\":true,\"rating\":4.9,\"reviews\":52,\"weight\":\"1.2kg\",\"dimensions\":\"30 × 30 cm board\",\"quantity\":\"32 pieces + board\",\"size\":\"12 x 12 inches (board)\",\"material\":\"Brass\",\"color\":\"Ivory & Ebony\",\"updatedAt\":\"2026-04-09T07:48:19.421Z\",\"qty\":1}]', '[]', '2026-04-07 17:38:46.745', '2026-04-15 05:36:08.018'),
(7, 'iWmwROvKoQYVEA8DHPy9urWAwuE3', 'Anonymous User', 'kushagraa@gmail.com', NULL, 'customer', 0, 0.00, 'active', '[]', '[]', '2026-04-07 17:40:17.984', '2026-04-07 17:40:17.984'),
(8, 'YRjg4LrfoUYE5EnH7Y9U78RMOUG2', 'test', '0testmail19@gmail.com', NULL, 'customer', 1, 5.00, 'active', '[]', '[{\"_id\":\"69d31be25667a6b4c9687bdc\",\"slug\":\"assssssssssssssssssssssssssssss\",\"title\":\"assssssssssssssssssssssssssssss\",\"description\":\"\",\"price\":11,\"salePrice\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/offer-f6cd7197.webp\"],\"stock\":11,\"artisan\":\"\",\"tags\":[\"wall-hangings\"],\"featured\":false,\"rating\":4.5,\"reviews\":0,\"quantity\":\"1 piece\",\"size\":\"\",\"material\":\"Brass\",\"color\":\"\",\"type\":\"product\",\"createdAt\":\"2026-04-06T02:35:14.379Z\",\"updatedAt\":\"2026-04-06T02:35:14.379Z\",\"__v\":0},{\"_id\":\"69cc36253cfecbf3f28d3bd2\",\"id\":\"wh-004\",\"slug\":\"lakshmi-brass-wall-art\",\"title\":\"Lakshmi Brass Wall Art\",\"description\":\"Premium Lakshmi brass wall art, intricately crafted to invoke the goddess of wealth and prosperity. A sacred addition to puja rooms and living spaces alike.\",\"price\":1,\"category\":\"wall-hangings\",\"images\":[\"/images/pexels-photo-33810565.webp\"],\"stock\":19,\"artisan\":\"Local Artisan\",\"tags\":[\"lakshmi\",\"brass\",\"wall-art\",\"metal-handicrafts-india\",\"brass-idols\"],\"featured\":true,\"rating\":4.9,\"reviews\":189,\"weight\":\"1kg\",\"dimensions\":\"30 x 30 cm\",\"quantity\":\"1 piece\",\"size\":\"14 x 10 inches\",\"material\":\"Brass\",\"color\":\"Antique Gold\",\"updatedAt\":\"2026-04-06T21:38:14.173Z\"},{\"_id\":\"69cc36253cfecbf3f28d3bd9\",\"id\":\"tt-007\",\"slug\":\"buddha-meditation-collection\",\"title\":\"Buddha Meditation Collection\",\"description\":\"Premium metal Buddha sculptures and wall art. Bring peace and serenity to your space with our exclusive collection. Each piece is hand-finished with a rich bronze patina.\",\"price\":1,\"category\":\"table-top-mount\",\"images\":[\"/images/pexels-photo-14694207.webp\"],\"video\":\"/videos/oceans.mp4\",\"stock\":4,\"artisan\":\"Vishwa Crafts, Varanasi\",\"tags\":[\"buddha\",\"meditation\",\"metal-art\",\"bronze\",\"spiritual\",\"brass-idols\"],\"featured\":true,\"rating\":5,\"reviews\":215,\"weight\":\"1.5kg\",\"dimensions\":\"30 × 20 × 40 cm\",\"quantity\":\"1 piece\",\"size\":\"16 x 10 x 8 inches\",\"material\":\"Bronze\",\"color\":\"Deep Bronze Patina\",\"updatedAt\":\"2026-04-09T09:12:00.687Z\"},{\"_id\":\"69cc36253cfecbf3f28d3be3\",\"id\":\"gi-001\",\"slug\":\"silk-scarf-banarasi-gift-box\",\"title\":\"Banarasi Silk Scarf — Gift Box\",\"description\":\"Luxurious hand-woven Banarasi silk scarf with zari border work.\",\"price\":1,\"category\":\"gift-items\",\"images\":[\"/images/pexels-photo-36455711.webp\"],\"stock\":14,\"artisan\":\"Looms of Benaras, Varanasi\",\"tags\":[\"silk\",\"banarasi\",\"scarf\",\"GI-tag\",\"gift-box\"],\"featured\":true,\"rating\":4.9,\"reviews\":215,\"weight\":\"180g\",\"dimensions\":\"200 × 70 cm\",\"quantity\":\"1 piece\",\"size\":\"79 x 27 inches\",\"material\":\"Aluminium\",\"color\":\"Royal Crimson with Gold Zari\",\"updatedAt\":\"2026-04-13T09:32:26.496Z\"},{\"_id\":\"69cc36253cfecbf3f28d3bdd\",\"id\":\"tt-005\",\"slug\":\"channapatna-chess-set\",\"title\":\"Channapatna Lacquerware Chess Set\",\"description\":\"Iconic Channapatna lacquerware chess set in candy-striped ivory and ebony tones.\",\"price\":1,\"category\":\"table-top-mount\",\"images\":[\"/images/pexels-photo-12520327.webp\"],\"video\":\"/videos/oceans.mp4\",\"stock\":15,\"artisan\":\"Craft Collective, Channapatna\",\"tags\":[\"channapatna\",\"lacquerware\",\"chess\",\"GI-tag\",\"lathe\"],\"featured\":true,\"rating\":4.9,\"reviews\":52,\"weight\":\"1.2kg\",\"dimensions\":\"30 × 30 cm board\",\"quantity\":\"32 pieces + board\",\"size\":\"12 x 12 inches (board)\",\"material\":\"Brass\",\"color\":\"Ivory & Ebony\",\"updatedAt\":\"2026-04-13T09:32:26.706Z\"}]', '2026-04-13 13:12:00.955', '2026-04-15 07:32:13.923');

-- --------------------------------------------------------

--
-- Table structure for table `customer_addresses`
--

CREATE TABLE `customer_addresses` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `tag` enum('home','work','other') NOT NULL DEFAULT 'home',
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `street` varchar(500) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_addresses`
--

INSERT INTO `customer_addresses` (`id`, `customer_id`, `tag`, `name`, `phone`, `street`, `city`, `state`, `pincode`, `is_default`) VALUES
(1, 2, 'home', 'fgdfg', '453', 'gsfsgfs', 'nd', NULL, '42365', 0),
(2, 2, 'home', 'Kushagra Sharma', '7428089885', 'B-302, inderputi', 'New Delhi', NULL, '110012', 0),
(3, 2, 'home', 'Kushagra Sharma', '7428089885', 'B-302, inderputi', 'New Delhi', NULL, '110012', 0),
(4, 3, 'home', 'ra', '345345', 'ggdgdg', 'tere', NULL, '998797', 0),
(5, 8, 'home', 'Kushagra Sharma', '1234567899', 'delhi', 'asdasd', NULL, '165165', 0);

-- --------------------------------------------------------

--
-- Table structure for table `hero_slides`
--

CREATE TABLE `hero_slides` (
  `id` int(11) NOT NULL,
  `custom_id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `badge` varchar(100) DEFAULT NULL,
  `video` varchar(500) DEFAULT NULL,
  `poster` varchar(500) DEFAULT NULL,
  `product_slug` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hero_slides`
--

INSERT INTO `hero_slides` (`id`, `custom_id`, `title`, `subtitle`, `description`, `badge`, `video`, `poster`, `product_slug`, `active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, '1', 'Buddha Meditation <span>Collection</span>', 'Limited Time Offer', 'Premium metal Buddha sculptures and wall art. Bring peace and serenity to your space.', 'EXCLUSIVE DEAL', '/videos/bcaf2de3e0-1775177090959-hero-video-7357497.mp4', '/images/pexels-photo-14694207.webp', 'pattachitra-art-diary-set', 1, 0, '2026-03-31 23:41:16.603', '2026-03-31 23:41:16.603'),
(2, '2', 'Divine Ganesh <span>Wall Art</spanTEST SLIDE>', 'Artisan Crafted', 'Watch our master craftsmen create intricate metal art using traditional techniques.', 'Handcrafted Excellence', '/videos/a373f9183f-hero-video-4391282.mp4', '/images/pexels-photo-21383559.webp', 'divine-ganesh-metal-wall-art', 1, 1, '2026-03-31 23:41:16.603', '2026-03-31 23:41:16.603'),
(3, '1775118739805', 'New Slider Headline', 'Premium Handicrafts', 'Discover our latest handcrafted items.', 'New Collection', '/videos/1775181028920-hero-video-35222173.mp4', '/images/38edf1df76-pexels-photo-31452296.webp', 'buddha-meditation-wall-art', 1, 2, '2026-04-02 08:34:31.894', '2026-04-02 08:34:31.894');

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `id` int(11) NOT NULL,
  `custom_id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `type` enum('percentage','flat','shipping') NOT NULL DEFAULT 'percentage',
  `category` varchar(100) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `bg_color` varchar(20) NOT NULL DEFAULT '#7A1F1F',
  `text_color` varchar(20) NOT NULL DEFAULT '#FFFFFF',
  `valid_until` datetime(3) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `offers`
--

INSERT INTO `offers` (`id`, `custom_id`, `title`, `description`, `discount`, `type`, `category`, `icon`, `image`, `bg_color`, `text_color`, `valid_until`, `active`, `featured`, `created_at`, `updated_at`) VALUES
(1, 'off-1774993908853', 'Monsoon Craft Mela', 'Celebrate the season with 20% off on all Wall Hangings', 20.00, 'percentage', 'wall-hangings', NULL, '/images/offer-e9f38099.webp', '#7A1F1F', '#FFF8F0', '2026-04-16 00:00:00.000', 1, 0, '2026-03-31 21:51:48.864', '2026-03-31 21:51:48.864'),
(2, 'off-1774993949597', 'Artisan Appreciation Week', 'Buy 2 Gift Items and get ₹500 off instantly', 500.00, 'flat', 'gift-items', NULL, '/images/offer-e9f38099.webp', '#7A1F1F', '#FFF8F0', '2026-06-18 00:00:00.000', 1, 0, '2026-03-31 21:52:29.607', '2026-03-31 21:52:29.607'),
(3, 'off-1774993980244', 'Free Shipping Weekend', 'Free shipping on all orders above ₹999', 0.00, 'shipping', 'wall-hangings', NULL, '/images/offer-e9f38099.webp', '#7A1F1F', '#FFF8F0', '2026-04-29 00:00:00.000', 1, 0, '2026-03-31 21:53:00.254', '2026-03-31 21:53:00.254'),
(4, 'off-1774994029587', 'New Year New Décor', '15% off on all Table Top Mounts', 15.00, 'percentage', 'table-top-mount', NULL, '/images/offer-e9f38099.webp', '#7A1F1F', '#FFF8F0', '2026-04-29 00:00:00.000', 1, 0, '2026-03-31 21:53:49.598', '2026-04-06 21:30:41.316'),
(5, 'off-1775639412146', 'asafsdfasdf', 'dsfasdf', 4.00, 'percentage', NULL, NULL, '/images/offer-e9f38099.webp', '#7A1F1F', '#FFF8F0', '2026-04-23 00:00:00.000', 1, 0, '2026-04-08 09:10:12.157', '2026-04-08 09:10:12.157');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_id` varchar(128) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `wholesale_token` varchar(50) DEFAULT NULL,
  `payment_status` enum('Pending','Paid','Failed') NOT NULL DEFAULT 'Pending',
  `payment_order_id` varchar(100) DEFAULT NULL,
  `payment_payment_id` varchar(100) DEFAULT NULL,
  `payment_signature` varchar(255) DEFAULT NULL,
  `logistics_status` enum('Placed','Packed','Dispatched','In_Transit','Delivered','Cancelled') NOT NULL DEFAULT 'Placed',
  `logistics_awb_code` varchar(50) DEFAULT NULL,
  `logistics_shipment_id` varchar(50) DEFAULT NULL,
  `placed_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `packed_at` datetime(3) DEFAULT NULL,
  `dispatched_at` datetime(3) DEFAULT NULL,
  `in_transit_at` datetime(3) DEFAULT NULL,
  `delivered_at` datetime(3) DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `coupon_discount` decimal(10,2) DEFAULT NULL,
  `shipping_name` varchar(100) NOT NULL,
  `shipping_phone` varchar(15) NOT NULL,
  `shipping_address` varchar(500) NOT NULL,
  `shipping_city` varchar(100) NOT NULL,
  `shipping_pincode` varchar(10) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `total_amount`, `shipping_fee`, `wholesale_token`, `payment_status`, `payment_order_id`, `payment_payment_id`, `payment_signature`, `logistics_status`, `logistics_awb_code`, `logistics_shipment_id`, `placed_at`, `packed_at`, `dispatched_at`, `in_transit_at`, `delivered_at`, `coupon_code`, `coupon_discount`, `shipping_name`, `shipping_phone`, `shipping_address`, `shipping_city`, `shipping_pincode`, `created_at`, `updated_at`) VALUES
(1, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 0.00, 0.00, NULL, 'Pending', 'order_SZIsSQYZqVltYq', NULL, NULL, 'Placed', NULL, NULL, '2026-04-04 05:40:06.796', NULL, NULL, NULL, NULL, NULL, NULL, 'gdfhh', 'gh', 'ghs', 'hg', 'ghs', '2026-04-04 05:40:06.803', '2026-04-04 05:40:06.803'),
(2, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 0.00, 0.00, NULL, 'Pending', 'order_SZIu59GItQVo2i', NULL, NULL, 'Placed', NULL, NULL, '2026-04-04 05:41:39.038', NULL, NULL, NULL, NULL, NULL, NULL, 'Rahul Thapliyal', 'rt', 'rtqt', 'qtw', 'tqwrt', '2026-04-04 05:41:39.039', '2026-04-04 05:41:39.039'),
(3, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 0.00, 0.00, NULL, 'Pending', 'order_SZJBpGrYv2IPZG', NULL, NULL, 'Placed', NULL, NULL, '2026-04-04 05:58:29.588', NULL, NULL, NULL, NULL, NULL, NULL, 'h', '888', 'nlkb', ' m,', '665554', '2026-04-04 05:58:29.593', '2026-04-04 05:58:29.593'),
(4, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 0.00, 0.00, NULL, 'Pending', 'order_SZJaEDgRFiD5FF', NULL, NULL, 'Placed', NULL, NULL, '2026-04-04 06:21:32.978', NULL, NULL, NULL, NULL, NULL, NULL, 'nvnvn', ' m ', 'bbmnb', 'b,b', '87', '2026-04-04 06:21:32.984', '2026-04-04 06:21:32.984'),
(5, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Pending', 'order_SZJmGCe7B7mvCI', NULL, NULL, 'Placed', NULL, NULL, '2026-04-04 06:32:59.133', NULL, NULL, NULL, NULL, NULL, NULL, 'h', 'b', 'ki', 'tfry', '75', '2026-04-04 06:32:59.137', '2026-04-04 06:32:59.137'),
(6, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Pending', 'order_SZKH8UGCRaHQ0y', NULL, NULL, 'Placed', NULL, NULL, '2026-04-04 07:02:00.639', NULL, NULL, NULL, NULL, NULL, NULL, 'sdas', 'asd', 'asda', 'sdasd', 'asd', '2026-04-04 07:02:00.643', '2026-04-04 07:02:00.643'),
(7, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Pending', 'order_SZKWl6PzkvhwH6', NULL, NULL, 'Placed', NULL, NULL, '2026-04-04 07:17:00.168', NULL, NULL, NULL, NULL, NULL, NULL, 'asd', 'asda', 'sdas', 'dasd', 'asd', '2026-04-04 07:17:00.171', '2026-04-04 07:17:00.171'),
(8, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SZRy8TOgCkSZZJ', 'pay_SZRyLHm6SoKhHV', '86f3d5785e47fc660fde7de13ae4d7a05e71d8257b51083bbcfa654ee2946a1d', 'Dispatched', 'MOCK-AWB-571368', 'MOCK-SID-864480', '2026-04-04 14:33:46.493', '2026-04-04 14:34:50.751', '2026-04-04 14:50:31.333', NULL, NULL, NULL, NULL, 'er', 'e', 'ere', 're', 'er', '2026-04-04 14:33:46.497', '2026-04-04 14:50:31.335'),
(9, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SZS529jMtcOJQf', 'pay_SZS5AwxGdLMbyz', '1ae90eab29946ee4d7912966006dd1352a1d3d14065a8945bb7be6af8bd46090', 'Dispatched', 'MOCK-AWB-630585', 'MOCK-SID-705551', '2026-04-04 14:40:18.295', '2026-04-04 14:49:43.974', '2026-04-04 14:49:43.986', NULL, NULL, NULL, NULL, 'Rahul Thapliyal', '8826278272', 'fad', 'new delhi', '110067', '2026-04-04 14:40:18.296', '2026-04-04 14:49:43.990'),
(10, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SZSAr2fhk6Xjh1', 'pay_SZSB3Ukyr0eeGH', '4b28d9123e86daab73a0d9bb4fb1ba3b9070569ba87fd0a90c2a5700eb8760b5', 'Dispatched', 'MOCK_AWB_11817', 'MOCK_SHIP_58289', '2026-04-04 14:45:48.918', '2026-04-04 14:46:41.218', '2026-04-04 14:46:41.810', NULL, NULL, NULL, NULL, 'Rahul Thapliyal', '8826278272', '731 saraswatipuram', 'New Delhi', '110067', '2026-04-04 14:45:48.922', '2026-04-04 14:46:41.812'),
(11, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SZSG8myoIT7LSx', 'pay_SZSGLjGDtgm6e6', 'd5204dc5bdffdce35951d14cea53adbffab6dfdaafbb6bda95b1228e08226241', 'Dispatched', 'MOCK-AWB-410093', 'MOCK-SID-689362', '2026-04-04 14:50:49.207', '2026-04-04 15:09:17.392', '2026-04-04 15:09:17.791', NULL, NULL, NULL, NULL, 'Rahul Thapliyal', '543', '45', 'rsg', '5554554', '2026-04-04 14:50:49.208', '2026-04-04 15:09:17.793'),
(12, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SZenQf5Kjsskn2', 'pay_SZenf0HBgkgP9f', 'eabfde42f3f38597f1f5263b30230d917423ef585fc2073913dd2594f7be2621', 'Dispatched', 'MOCK-AWB-284024', 'MOCK-SID-530691', '2026-04-05 03:06:39.349', '2026-04-05 03:07:33.150', '2026-04-05 03:07:39.320', NULL, NULL, NULL, NULL, 'Kushagra Sharma', 'asd', 'asda', 'sdasda', 'dasdasd', '2026-04-05 03:06:39.352', '2026-04-05 03:07:39.321'),
(13, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 0.00, 0.00, NULL, 'Paid', 'order_SZm0yORidqGHsa', 'pay_SZm1Kv4TKQW1sX', 'df3484da39343f129c5d70c5a5eb276178283cf018dcd0808a319ee81585bdb7', 'Dispatched', 'MOCK-AWB-695414', 'MOCK-SID-636353', '2026-04-05 10:10:17.685', '2026-04-05 10:11:28.072', '2026-04-05 10:11:34.401', NULL, NULL, NULL, NULL, 'Rahul Thapliyal', '8826227', 'yetrrte', 'new delhi', '110067', '2026-04-05 10:10:17.692', '2026-04-05 10:11:34.405'),
(14, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 0.00, 0.00, NULL, 'Paid', 'order_SZm5kKBJabE080', 'pay_SZm5qU4W6m5GF3', '7d1e01e986238fe08cc8a920815cf98264ac2be96ca5c594d45ec34b321f2c15', 'Cancelled', NULL, NULL, '2026-04-05 10:14:48.765', NULL, NULL, NULL, NULL, NULL, NULL, 'Rahul Thapliyal', '435345', 'dsgsdg', 'fg', '110067', '2026-04-05 10:14:48.767', '2026-04-05 10:15:33.238'),
(15, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 0.00, 0.00, NULL, 'Paid', 'order_SZnPERiCMbJeJ4', 'pay_SZnPRkf5R22NcI', '9a2c214e89a7c6a12081035025d879a39b27f3e0cfe1888d038cdb1c23b38213', 'Dispatched', 'MOCK-AWB-102618', 'MOCK-SID-887983', '2026-04-05 11:31:57.188', '2026-04-05 11:33:52.159', '2026-04-05 11:34:15.485', NULL, NULL, NULL, NULL, 'dfsf', '4343', ' xcv', 'vvv', '4322', '2026-04-05 11:31:57.189', '2026-04-05 11:34:15.487'),
(16, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SZrIQrWf9klHXF', 'pay_SZrIzYKGau3JOF', 'e3571f949cbf5b09c19eb7d20c7ea5ddc0104c713f97c8ff4904dfb7ad1867f5', 'Dispatched', 'MOCK-AWB-878938', 'MOCK-SID-506945', '2026-04-05 15:20:06.813', '2026-04-05 15:27:38.125', '2026-04-05 15:27:59.573', NULL, NULL, NULL, NULL, 'efAE', '123032', 'QWERQWER', 'QWERQWER', '011235', '2026-04-05 15:20:06.816', '2026-04-05 15:27:59.575'),
(17, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SZrRbWXuRXCux5', 'pay_SZrRnJvuLZLwto', '61d5c84362a7516edc2f82e80bd9cb33970a9058ae16aa4f229e2c629c588e69', 'Dispatched', 'MOCK-AWB-353815', 'MOCK-SID-789175', '2026-04-05 15:29:00.672', '2026-04-05 15:30:02.839', '2026-04-05 15:30:07.613', NULL, NULL, NULL, NULL, 'Rahul Thapliyal', '8826278272', 'gfgfds', 'gfdgf', '110067', '2026-04-05 15:29:00.676', '2026-04-05 15:30:07.614'),
(18, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 0.00, 0.00, NULL, 'Paid', 'order_SZrdz7Qa8SyNJf', 'pay_SZreTSCwYSPZSI', 'f21dd518ed084b6d865717f2ad31f7a9243aa05ce1ec6906c8385c30016232e0', 'Placed', NULL, NULL, '2026-04-05 15:40:43.810', NULL, NULL, NULL, NULL, NULL, NULL, 'Rahul Thapliyal', '5435', 'fdss', 'dff', '3453', '2026-04-05 15:40:43.818', '2026-04-05 15:41:18.626'),
(19, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 0.00, 0.00, NULL, 'Paid', 'order_SZy53c2Jltxm4h', 'pay_SZy5K1g3Or15z6', 'aa70d2df1f0d73e49809b34d372222e456b5059a361cf8e67173205d879c4007', 'Dispatched', 'MOCK-AWB-309789', 'MOCK-SID-654673', '2026-04-05 21:58:31.314', '2026-04-05 22:00:54.111', '2026-04-05 22:00:58.539', NULL, NULL, NULL, NULL, 'Rahul', '646466464', 'Shhwh', 'Hsha', '2727', '2026-04-05 21:58:31.318', '2026-04-05 22:00:58.542'),
(20, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SaMGQZeJZjNHCJ', 'pay_SaMGhBU8P6kA9R', '82aaac5d6efab5ecd0746c3440f7eb10cda27edfa3d06e5b66830ed58c9499c5', 'Placed', NULL, NULL, '2026-04-06 21:37:42.205', NULL, NULL, NULL, NULL, NULL, NULL, 'qewr', '1231321321', 'werqwer', 'wqerqwer', '012313', '2026-04-06 21:37:42.210', '2026-04-06 21:38:13.503'),
(21, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SatbpTZmK4EvdI', 'pay_Satbzi7Qr8Nprr', '76b1972d9c4d7f6dbb71f9997104a410cdbc578555b80b35ded56e0e7af10e63', 'Placed', NULL, NULL, '2026-04-08 06:14:48.804', NULL, NULL, NULL, NULL, NULL, NULL, 'erwe', '1021321', 'werwe', 'rwer', '032132', '2026-04-08 06:14:48.807', '2026-04-08 06:15:18.095'),
(22, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SawGgIiQLhOHOT', 'pay_SawH4V2odJaM1Q', 'd7252c9ff823ce93dc7ae1a6666afd40cd5cf0afc065ca73b6354fcd1c3d0e00', 'Packed', NULL, NULL, '2026-04-08 08:50:52.966', '2026-04-08 08:52:20.263', NULL, NULL, NULL, NULL, NULL, 'asd', '54651651', 'dfasdf', 'asdfasd', '165165', '2026-04-08 08:50:52.967', '2026-04-08 08:52:20.264'),
(23, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SawJ8X9ZNnmN12', 'pay_SawJFNC7dadqBH', 'ac6dc371008e080f8119f984dd4e1330ac541164c0cebd056b90cf01ee1ddfb7', 'Placed', NULL, NULL, '2026-04-08 08:53:12.137', NULL, NULL, NULL, NULL, NULL, NULL, 'asdfasdf', '2313213', 'asdfasdfa', 'sdfasdf', '131313', '2026-04-08 08:53:12.138', '2026-04-08 08:53:36.238'),
(24, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 0.00, 0.00, NULL, 'Paid', 'order_SawXobx0pII0z5', 'pay_SawXunrUlgfcoH', 'e8607b9108eded7b552e604dcbc09af75e74caea8efb461f6af5d5e8d115c2f4', 'Dispatched', 'MOCK-AWB-832833', 'MOCK-SID-722326', '2026-04-08 09:07:05.904', '2026-04-08 09:08:50.119', '2026-04-08 09:08:51.496', NULL, NULL, NULL, NULL, 'qweqwe', '5646546546', 'asdfasdf', 'asdfasdf', '265165', '2026-04-08 09:07:05.905', '2026-04-08 09:08:51.499'),
(25, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 1.00, 0.00, NULL, 'Paid', 'order_Sawew6SC9GYJn1', 'pay_Sawf3Hb06ARJam', '8ba29e08c2c3e6c670f7bec601c3745a04864776d1e511984369077695c70992', 'Dispatched', 'MOCK-AWB-183561', 'MOCK-SID-398309', '2026-04-08 09:13:50.382', '2026-04-08 09:16:38.784', '2026-04-08 09:16:41.619', NULL, NULL, 'SAVE20', 20.00, 'asdfsad', '3165135', 'asdfasdf', 'sadfasd', '216165', '2026-04-08 09:13:50.387', '2026-04-08 09:16:41.621'),
(26, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 1.00, 0.00, NULL, 'Paid', 'order_SawkeR2YBdgc6Y', 'pay_Sawkl0QotxUM68', '786fa7d4dc95373069526daa4f258425905a101b4704344e11c192009249e197', 'Dispatched', 'MOCK-AWB-579739', 'MOCK-SID-201212', '2026-04-08 09:19:15.030', '2026-04-08 09:19:50.321', '2026-04-08 09:19:51.444', NULL, NULL, 'SAVE20', 20.00, 'asdAFDadsf', '513513', '51313153', 'asdasd', '655161', '2026-04-08 09:19:15.032', '2026-04-08 09:19:51.447'),
(27, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 3.00, 0.00, NULL, 'Pending', 'order_SazGGNCd2VM88v', NULL, NULL, 'Placed', NULL, NULL, '2026-04-08 11:46:33.818', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '165165161', 'sdcADVSDV', 'cxvXVCXCV', '424553', '2026-04-08 11:46:33.819', '2026-04-08 11:46:33.819'),
(28, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 3.00, 0.00, NULL, 'Paid', 'order_SazGWGzT6Zbpyw', 'pay_SazGsinrPpoydW', '874cd56231b12ddf8d44d74a872e7083e0e4f55ccbc6b0908d6be8a70cd69c84', 'Placed', NULL, NULL, '2026-04-08 11:46:48.364', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '165165161', 'sdcADVSDV', 'cxvXVCXCV', '424553', '2026-04-08 11:46:48.365', '2026-04-08 11:47:30.577'),
(29, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 4.80, 0.00, NULL, 'Paid', 'order_SazO61zbuUeGsi', 'pay_SazOGcyZC276G5', 'f339c17bfe17ceb4a81509a65b724378bf9df2f74ae802942131f7205c278c3e', 'Placed', NULL, NULL, '2026-04-08 11:53:58.743', NULL, NULL, NULL, NULL, 'RAHUL', 1.20, 'fasdfasdfasd', '5465464565', 'cvXCVXCV', 'zcZXcvvZX', '546546', '2026-04-08 11:53:58.746', '2026-04-08 11:54:30.232'),
(30, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 4.80, 0.00, NULL, 'Paid', 'order_SazuV5jYqQB3qg', 'pay_SazuiidjXNXFaM', 'ffc6882c78b29cfae23f07148509fa9a6ca49af3944521d413ff3cf7afd4ed25', 'Placed', NULL, NULL, '2026-04-08 12:24:39.374', NULL, NULL, NULL, NULL, 'RAHUL', 1.20, 'dfasdf', '5465464654', 'dsafgasdgasd', 'gasdgasdga', '424', '2026-04-08 12:24:39.379', '2026-04-08 12:25:14.324'),
(31, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 3.00, 0.00, NULL, 'Paid', 'order_Sb9bfvJFT7Sicn', 'pay_Sb9c5LHmpEH0SM', 'e7ec4d8d669e83f67ae7016ad697f30c3ed3a82fbef9ae180fac91e39bac81a1', 'Dispatched', 'MOCK-AWB-485457', 'MOCK-SID-537706', '2026-04-08 21:54:00.550', '2026-04-08 21:54:56.510', '2026-04-08 21:56:30.735', NULL, NULL, NULL, NULL, 'Rahul Thapliyal', '4535354535', 'fdsfsdf', 'gsfgsfs', '114332', '2026-04-08 21:54:00.555', '2026-04-08 21:56:30.737'),
(32, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 5.00, 0.00, NULL, 'Paid', 'order_SbBoPhS8d1tidU', 'pay_SbBocHR9N7PK6x', '1ce302bd23dd077a35416ab869f2580ca692dc8cb9beff49b343cd3dd6972156', 'Dispatched', 'MOCK-AWB-473628', 'MOCK-SID-808691', '2026-04-09 00:03:27.265', '2026-04-09 07:43:02.354', '2026-04-09 07:43:02.851', NULL, NULL, NULL, NULL, 'fgdfg', '453', 'gsfsgfs', 'nd', '42365', '2026-04-09 00:03:27.271', '2026-04-09 07:43:02.853'),
(33, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 1.00, 0.00, NULL, 'Paid', 'order_SbJ5KklsA0047k', 'pay_SbJ5gBgSIhy32u', '403f92a97dba451405dda90ddd26da67e2d65cfaaf257c9da95a27946c4cc74d', 'Dispatched', 'MOCK-AWB-732657', 'MOCK-SID-608154', '2026-04-09 07:10:21.016', '2026-04-09 07:38:37.540', '2026-04-09 07:42:21.481', NULL, NULL, 'SAVE20', 20.00, 'Kushagra Sharma', '7422808988', 'hgfhchgc', 'hgffhgvjh', '321353', '2026-04-09 07:10:21.021', '2026-04-09 07:42:21.485'),
(34, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 3.00, 0.00, NULL, 'Pending', 'order_SbJcLPd1kVMFQF', NULL, NULL, 'Placed', NULL, NULL, '2026-04-09 07:41:20.334', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '7428089885', 'B-302, inderputi', 'New Delhi', '110012', '2026-04-09 07:41:20.339', '2026-04-09 07:41:20.339'),
(35, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 5.60, 0.00, NULL, 'Paid', 'order_SbJclND03BgmHv', 'pay_SbJd0u8tExO7tb', 'c0b515eec348d87d04489b9292ea9ff3da220158541615e6a4d0eb136fe77638', 'Dispatched', 'MOCK-AWB-667228', 'MOCK-SID-733641', '2026-04-09 07:41:44.078', '2026-04-09 07:42:29.378', '2026-04-09 07:42:42.315', NULL, NULL, 'RAHUL', 1.40, 'Kushagra Sharma', '7428089885', 'B-302, inderputi', 'New Delhi', '110012', '2026-04-09 07:41:44.079', '2026-04-09 07:42:42.318'),
(36, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 3.60, 0.00, NULL, 'Paid', 'order_SbJjExpgo4T5SV', 'pay_SbJjOBzG3SuOXM', 'd25f4eb7d5ad4fb9140fb22c6877097201f53540064fc037051e98aac82f036c', 'Placed', NULL, NULL, '2026-04-09 07:47:51.999', NULL, NULL, NULL, NULL, 'R', 0.40, 'Kushagra Sharma', '4654654654', 'werq', 'eqwr', '464688', '2026-04-09 07:47:52.001', '2026-04-09 07:48:18.577'),
(37, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 5.40, 0.00, NULL, 'Paid', 'order_SbL9Mq1McrgZ0O', 'pay_SbL9heq6bf55vj', '5b698ad12416b4e48d88460bcbddc7b1c00cf43fa6f2da264f73ba510d596619', 'Placed', NULL, NULL, '2026-04-09 09:11:17.800', NULL, NULL, NULL, NULL, 'R', 0.60, 'Kushagra Sharma', '7428089885', 'B-302, inderputi', 'New Delhi', '110012', '2026-04-09 09:11:17.805', '2026-04-09 09:11:59.859'),
(38, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 9.00, 0.00, NULL, 'Pending', 'order_Sc5H6MVaQdp5g2', NULL, NULL, 'Placed', NULL, NULL, '2026-04-11 06:18:46.860', NULL, NULL, NULL, NULL, NULL, NULL, 'ra', '345345', 'ggdgdg', 'tere', '998797', '2026-04-11 06:18:46.874', '2026-04-11 06:18:46.874'),
(39, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 3.00, 0.00, NULL, 'Paid', 'order_ScNm4zW5X7BM29', 'pay_ScNmFXrsxZu7Y1', 'b28d090bd89da0b58bded0a8b66fa9d7fe917cec71806b196ad7b7e9a9d88972', 'Placed', NULL, NULL, '2026-04-12 00:24:18.967', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '7428089885', 'B-302, inderputi', 'New Delhi', '110012', '2026-04-12 00:24:18.968', '2026-04-12 00:24:52.420'),
(40, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 110.00, 0.00, NULL, 'Paid', 'order_ScO7N4x96kfvgM', 'pay_ScO7T4PGCNTBwy', '83b05b6e186c36219a56637d036c887aade14a05e151ceee5b38b4950ce30c78', 'Placed', NULL, NULL, '2026-04-12 00:44:28.379', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '546468', 'adsd', 'asdasd', '584684', '2026-04-12 00:44:28.384', '2026-04-12 00:44:56.802'),
(41, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 52.00, 0.00, NULL, 'Paid', 'order_ScOIE7sCaMMQ72', 'pay_ScOIKT5Y3xhJ0W', '06590ee372dd81175ad24ab42a5e8a44b9b749e100a6d613d01a67fdcedc11ad', 'Placed', NULL, NULL, '2026-04-12 00:54:44.983', NULL, NULL, NULL, NULL, NULL, NULL, 'sadasd', '5646546546', 'sdasdasdasdas', 'asdasdasd', '441564', '2026-04-12 00:54:44.984', '2026-04-12 00:55:14.003'),
(42, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 44.00, 0.00, NULL, 'Paid', 'order_ScOnCkIJJuqR8M', 'pay_ScOnuIfGBfbykD', '57b5b5749255b3cc68e35109a9f06ba7a807eec5d4fa4ed668085b6d0b5dd48d', 'Placed', NULL, NULL, '2026-04-12 01:24:04.570', NULL, NULL, NULL, NULL, NULL, NULL, 'asda', '5456165165', 'asd', 'asd', '165165', '2026-04-12 01:24:04.572', '2026-04-12 01:25:07.889'),
(43, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 3.00, 0.00, NULL, 'Paid', 'order_ScOtBdFSZVffwd', 'pay_ScOtHgIvIbvWfi', '99f908d1c3d092af0a22df0393b5464092ac9e32ab2e680ef7bb2002b850ae1c', 'Placed', NULL, NULL, '2026-04-12 01:29:44.351', NULL, NULL, NULL, NULL, NULL, NULL, 'asdasd', '2626262626', 'aasd', 'asd', '363636', '2026-04-12 01:29:44.352', '2026-04-12 01:30:12.747'),
(44, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 13.00, 0.00, NULL, 'Paid', 'order_ScOw5uqKIfSVAu', 'pay_ScOwCFwxHUv1I9', 'a366fe81b9da3abeb88a8b501d18da1aceb52266a5a2af4ba11c24476c36aaed', 'Placed', NULL, NULL, '2026-04-12 01:32:29.515', NULL, NULL, NULL, NULL, NULL, NULL, 'asd', '2595969696', 'asd', 'asd', '959666', '2026-04-12 01:32:29.517', '2026-04-12 01:32:53.767'),
(45, 'qdQ1WffyeNgOB2ht8dqFKzxL4Ly2', 45.00, 0.00, NULL, 'Paid', 'order_ScPHZmqufgSj4U', 'pay_ScPHtG0MBzgdAw', '6b6406efff32bb8ba35ff99a5ca21271d87667ba7bfe54bac51279ffde1fc239', 'Placed', NULL, NULL, '2026-04-12 01:52:49.755', NULL, NULL, NULL, NULL, NULL, NULL, 'asd', '5465465446', 'asd', 'asd', '551313', '2026-04-12 01:52:49.757', '2026-04-12 01:53:30.799'),
(46, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 23.00, 0.00, NULL, 'Paid', 'order_ScPUAqdLQF8lCL', 'pay_ScPUP4S8TmxpIr', 'a6a406fc697dae6fba447fe8bd555bc12cc46a6929ed7b9f3f28ab373d0f3df4', 'Placed', NULL, NULL, '2026-04-12 02:04:45.294', NULL, NULL, NULL, NULL, NULL, NULL, 'asd', '4645654645', 'asd', 'asd', '15162', '2026-04-12 02:04:45.297', '2026-04-12 02:05:21.765'),
(47, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 23.00, 0.00, NULL, 'Paid', 'order_ScPh8d024Q9Wol', 'pay_ScPhFMOuCdHHCc', 'ea90013b60983f5f1ad12cd2481431c5b8c668a09206aeccbc2ac859d6f3a759', 'Dispatched', 'MOCK-AWB-476856', 'MOCK-SID-411401', '2026-04-12 02:17:01.687', '2026-04-12 02:24:05.324', '2026-04-12 02:24:18.352', NULL, NULL, NULL, NULL, 'asd', '44242442', '\n24\n5d', 'asdasd', '546564', '2026-04-12 02:17:01.688', '2026-04-12 02:24:18.361'),
(48, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 1.80, 0.00, NULL, 'Pending', 'order_ScPr0aoYFCAwZa', NULL, NULL, 'Placed', NULL, NULL, '2026-04-12 02:26:22.339', NULL, NULL, NULL, NULL, 'R', 0.20, 'AS', '6551644316', 'SADAS', 'DASD', '651651', '2026-04-12 02:26:22.341', '2026-04-12 02:26:22.341'),
(49, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 1.80, 0.00, NULL, 'Pending', 'order_ScPrCNoa8OLeJk', NULL, NULL, 'Placed', NULL, NULL, '2026-04-12 02:26:33.135', NULL, NULL, NULL, NULL, 'R', 0.20, 'AS', '6551644316', 'SADAS', 'DASD', '651651', '2026-04-12 02:26:33.138', '2026-04-12 02:26:33.138'),
(50, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 1.80, 0.00, NULL, 'Pending', 'order_ScPrrYV9yPfgU9', NULL, NULL, 'Placed', NULL, NULL, '2026-04-12 02:27:10.857', NULL, NULL, NULL, NULL, 'R', 0.20, 'AS', '6551644316', 'SADAS', 'DASD', '651651', '2026-04-12 02:27:10.858', '2026-04-12 02:27:10.858'),
(51, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 2.00, 0.00, NULL, 'Pending', 'order_ScPs4RnjbkZ0xC', NULL, NULL, 'Placed', NULL, NULL, '2026-04-12 02:27:22.775', NULL, NULL, NULL, NULL, NULL, NULL, 'ASD', '5465416135', 'ASD', 'ASD', '135131', '2026-04-12 02:27:22.776', '2026-04-12 02:27:22.776'),
(52, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 1.80, 0.00, NULL, 'Pending', 'order_ScPsVAc5ynhb4H', NULL, NULL, 'Placed', NULL, NULL, '2026-04-12 02:27:47.151', NULL, NULL, NULL, NULL, 'R', 0.20, 'SDASD', '5135135135', 'ASD', 'ASDA', '516513', '2026-04-12 02:27:47.153', '2026-04-12 02:27:47.153'),
(53, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 2.00, 0.00, NULL, 'Pending', 'order_ScPuRnjWDy9y17', NULL, NULL, 'Placed', NULL, NULL, '2026-04-12 02:29:37.666', NULL, NULL, NULL, NULL, NULL, NULL, 'sasd', '6113513513', 'asd', 'asd', '451651', '2026-04-12 02:29:37.667', '2026-04-12 02:29:37.667'),
(54, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 3.00, 0.00, NULL, 'Pending', 'order_ScPw4rmzMlEO4e', NULL, NULL, 'Placed', NULL, NULL, '2026-04-12 02:31:10.263', NULL, NULL, NULL, NULL, NULL, NULL, 'asd', '5516513131', 'asd', 'asd', '151131', '2026-04-12 02:31:10.268', '2026-04-12 02:31:10.268'),
(55, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 3.00, 0.00, NULL, 'Pending', 'order_ScPwfaZEojH6Lb', NULL, NULL, 'Placed', NULL, NULL, '2026-04-12 02:31:43.917', NULL, NULL, NULL, NULL, NULL, NULL, 'asd', '6151513513', 'asd', 'asd', '453343', '2026-04-12 02:31:43.919', '2026-04-12 02:31:43.919'),
(56, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 4.00, 0.00, NULL, 'Paid', 'order_ScPy5GyY9mIYSd', 'pay_ScPyF95SHtCp59', '266656ff678ac814bf3f454ce413ead452e01c50c90aeeee82c9f1e54bc679ce', 'Placed', NULL, NULL, '2026-04-12 02:33:20.653', NULL, NULL, NULL, NULL, NULL, NULL, 'asd', '5656546465', 'asd', 'asd', '651565', '2026-04-12 02:33:20.657', '2026-04-12 02:33:31.795'),
(57, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 3.00, 0.00, NULL, 'Paid', 'order_ScQ2D6mNq1gHyY', 'pay_ScQ2KXkZ1rhMYV', '68cddde13092750e85619ea386b7902f7eef06aff1cfc7a7825fd4cca9580b1e', 'Placed', NULL, NULL, '2026-04-12 02:37:15.019', NULL, NULL, NULL, NULL, NULL, NULL, 'asd', '5654654654', 'asd', 'asd', '565656', '2026-04-12 02:37:15.020', '2026-04-12 02:37:23.814'),
(58, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 3.00, 0.00, NULL, 'Pending', 'order_ScQ8pREECIeZvO', NULL, NULL, 'Placed', NULL, NULL, '2026-04-12 02:43:30.937', NULL, NULL, NULL, NULL, NULL, NULL, 'asd', '1561615615', 'asd', 'asd', '561651', '2026-04-12 02:43:30.939', '2026-04-12 02:43:30.939'),
(59, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 2.70, 0.00, NULL, 'Paid', 'order_ScQ91TjHkGuiRX', 'pay_ScQ97GRRbTvCfx', '936961f05809916cb94f6d4b300150520b1d6318fc8e9eef4c0ff19803cb4c35', 'Placed', NULL, NULL, '2026-04-12 02:43:41.961', NULL, NULL, NULL, NULL, 'R', 0.30, 'asd', '1561615615', 'asd', 'asd', '561651', '2026-04-12 02:43:41.962', '2026-04-12 02:43:49.405'),
(60, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 37.00, 0.00, '1b68f9de', 'Paid', 'order_ScQQIJ9Bzn3xFx', 'pay_ScQQPzblrGfKMd', '3703008b1f77e87aeedc38483cca85a0a91cb5ea4cb994dbeeb4621d68a1ef18', 'Placed', NULL, NULL, '2026-04-12 02:59:46.642', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '7428089885', 'asd', 'asd', '110012', '2026-04-12 02:59:46.643', '2026-04-12 03:00:12.318'),
(61, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 23.00, 0.00, 'ba6f8f7a', 'Paid', 'order_ScQYkAVnCbpzHK', 'pay_ScQYyNAnr4ucwO', '95f9016e846888bf64407f5c90ae6217f6bd0fe0cdba14bccff65e53a5480f35', 'Dispatched', 'MOCK-AWB-638824', 'MOCK-SID-360875', '2026-04-12 03:07:46.562', '2026-04-12 10:21:21.225', '2026-04-12 10:21:24.768', NULL, NULL, NULL, NULL, 'asd', '5165465465', 'asd', 'asd', '646654', '2026-04-12 03:07:46.564', '2026-04-12 10:21:24.772'),
(62, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 3.00, 0.00, NULL, 'Pending', 'order_ScV029b4BeBrPs', NULL, NULL, 'Cancelled', NULL, NULL, '2026-04-12 07:28:22.584', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '7428089885', 'B-302, inderputi', 'New Delhi', '110012', '2026-04-12 07:28:22.589', '2026-04-12 22:24:02.923'),
(63, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 104.00, 0.00, 'a8c0f1f9', 'Paid', 'order_ScVJfy90PQAVLx', 'pay_ScVJoWMFTfmk8R', '43202d902f35b1b447dea59110fe30e3e2db2464aa7c8ea07a4bf2c0c9af0ac3', 'Dispatched', 'MOCK-AWB-918930', 'MOCK-SID-738022', '2026-04-12 07:46:57.064', '2026-04-12 07:49:26.746', '2026-04-12 07:49:49.582', NULL, NULL, NULL, NULL, 'Kushagra', '7428089885', 'asd', 'asd', '011358', '2026-04-12 07:46:57.066', '2026-04-12 07:49:49.585'),
(64, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 117.00, 0.00, '2833e564', 'Paid', 'order_ScVb1WDK7Oe18O', 'pay_ScVbHfPMYD10G6', 'baa6cf5a2475dfb9ed72659cab1b5a940838f0514845008459d98bc9ea0ef04b', 'Packed', NULL, NULL, '2026-04-12 08:03:22.442', '2026-04-13 05:15:34.483', NULL, NULL, NULL, NULL, NULL, 'asd', '5165165135', 'asd', 'asd', '26522', '2026-04-12 08:03:22.443', '2026-04-13 05:15:34.488'),
(65, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 536.00, 0.00, 'b700e182', 'Paid', 'order_ScVkkj0TJ4xCwi', 'pay_ScVkqkAqH6UREm', 'a20c891079cb9e5c0b8a0e47dd16921933dff903ac47f4045b6b2a6066a61fb4', 'Dispatched', 'MOCK-AWB-191256', 'MOCK-SID-282175', '2026-04-12 08:12:35.071', '2026-04-12 22:32:07.361', '2026-04-12 22:32:08.056', NULL, NULL, NULL, NULL, 'asd', '551613131', 'asd', 'asd', '135135', '2026-04-12 08:12:35.074', '2026-04-12 22:32:08.059'),
(66, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 31.00, 0.00, '796c58cc', 'Paid', 'order_ScVoDGGfxsQ8y4', 'pay_ScVoOY62gNPORI', '2b36446d6937559ec2d7f17a8a28e619f89955fb15468c6d84ecc8e6e61762a3', 'Dispatched', 'MOCK-AWB-521546', 'MOCK-SID-793031', '2026-04-12 08:15:51.609', '2026-04-12 22:23:39.912', '2026-04-12 22:23:42.882', NULL, NULL, NULL, NULL, 'asd', '5616516513', 'asd', 'asd', '116513', '2026-04-12 08:15:51.611', '2026-04-12 22:23:42.885'),
(67, 'ojAt29zi7CNK6HnkT1FMmQrrqg93', 9.00, 0.00, NULL, 'Paid', 'order_SckPeXiKbX2r3Y', 'pay_SckPummIDwF1XY', '0fa3d1c8c923b22381a3ed113f54639e999e99912a7e5c9a1207b364e5d7d21e', 'Dispatched', 'MOCK-AWB-273694', 'MOCK-SID-271622', '2026-04-12 22:33:18.759', '2026-04-12 22:34:06.359', '2026-04-12 22:34:38.112', NULL, NULL, NULL, NULL, 'ra', '345345', 'ggdgdg', 'delhi', '998797', '2026-04-12 22:33:18.764', '2026-04-12 22:34:38.117'),
(68, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 4.50, 0.00, NULL, 'Paid', 'order_ScrDX3MU7jPUf2', 'pay_ScrDmkgjW17qa5', 'ac1bb2927dcf37719082e1b86831b76df9dfee3e24a1da560c61cfae659b1c02', 'Dispatched', 'MOCK-AWB-764988', 'MOCK-SID-200447', '2026-04-13 05:12:41.709', '2026-04-13 05:13:47.734', '2026-04-13 05:13:48.803', NULL, NULL, 'R', 0.50, 'as', '1656546546', 'asd', 'asd', '254564', '2026-04-13 05:12:41.713', '2026-04-13 05:13:48.806'),
(69, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 4.00, 0.00, NULL, 'Paid', 'order_SctnqzIGD1nC8x', 'pay_Scto1XKcffPlm2', '66ab82e5b7fbbc22dd41439c7f0cc09e689f40edff78999c32bdb28038da46aa', 'Dispatched', 'MOCK-AWB-468180', 'MOCK-SID-889871', '2026-04-13 07:44:28.003', '2026-04-13 07:45:35.213', '2026-04-13 07:45:38.269', NULL, NULL, NULL, NULL, 'Kushagra Sharma', '7428089885', 'B-302, inderputi', 'New Delhi', '110012', '2026-04-13 07:44:28.007', '2026-04-13 07:45:38.271'),
(70, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 3.00, 0.00, NULL, 'Paid', 'order_ScuZt1wuuTgNM9', 'pay_ScuaHlIenCk1sV', 'c989c5213b0a933e9e73650b08e2a292455300f5d490c665751bbdd82c954edb', 'Dispatched', 'MOCK-AWB-405580', 'MOCK-SID-361059', '2026-04-13 08:29:56.284', '2026-04-13 08:30:59.202', '2026-04-13 08:31:03.747', NULL, NULL, NULL, NULL, 'Kushagra Sharma', '7428089885', 'B-302, inderputi', 'New Delhi', '110012', '2026-04-13 08:29:56.289', '2026-04-13 08:31:03.749'),
(71, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 4.00, 0.00, NULL, 'Pending', 'order_ScunftYXtmrovg', NULL, NULL, 'Placed', NULL, NULL, '2026-04-13 08:42:59.448', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '7428089885', 'B-302, inderputi', 'New Delhi', '110012', '2026-04-13 08:42:59.452', '2026-04-13 08:42:59.452'),
(72, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 5.00, 0.00, NULL, 'Paid', 'order_ScvdYdF7ALgymp', 'pay_Scvdm5ne2s79od', 'e7043dd1e599c20b30610ce24e76eca1aa6de74f377b9ca52678c56b03e7ad95', 'Dispatched', 'MOCK-AWB-672747', 'MOCK-SID-659955', '2026-04-13 09:31:49.158', '2026-04-13 09:34:02.126', '2026-04-13 09:34:02.135', NULL, NULL, NULL, NULL, 'Kushagra Sharma', '7428089885', 'B-302, inderputi', 'New Delhi', '110012', '2026-04-13 09:31:49.162', '2026-04-13 09:34:02.139'),
(73, 'bUHpKpLWirhnionjWLNCNwNaMeE2', 20.00, 0.00, '09a17475', 'Paid', 'order_ScwSFjLNwsvbON', 'pay_ScwSOWtQvpVVme', '480ec5356a13e769e0505892f5c66792c01229e0e87fb4c234612593cdedf8e7', 'Dispatched', 'MOCK-AWB-766146', 'MOCK-SID-255168', '2026-04-13 10:19:48.700', '2026-04-13 13:05:21.034', '2026-04-13 13:05:21.800', NULL, NULL, NULL, NULL, 'asd', '3513513513', 'asd', 'asd', '131312', '2026-04-13 10:19:48.702', '2026-04-13 13:05:21.803'),
(74, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 50.00, 0.00, 'e27c34fc', 'Paid', 'order_Sd2lRUPMT2APjr', 'pay_Sd2lkXkLwWoeyk', '6994bef10a4b3684e5d219cdada2a6ad3dce6a00f3500e6e4ed3b71dc9b713f0', 'Dispatched', 'MOCK-AWB-622372', 'MOCK-SID-971968', '2026-04-13 16:30:25.573', '2026-04-13 16:31:51.125', '2026-04-13 16:31:52.954', NULL, NULL, NULL, NULL, 'asd', '4565354354', '543435435', 'asd', '546464', '2026-04-13 16:30:25.578', '2026-04-13 16:31:52.956'),
(75, 'YRjg4LrfoUYE5EnH7Y9U78RMOUG2', 9.00, 1.00, NULL, 'Pending', 'order_SdPoBupx8NLK2a', NULL, NULL, 'Placed', NULL, NULL, '2026-04-14 15:02:58.846', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '5161616516', 'asdasd', 'asd', '165165', '2026-04-14 15:02:58.852', '2026-04-14 15:02:58.852'),
(76, 'YRjg4LrfoUYE5EnH7Y9U78RMOUG2', 9.00, 1.00, NULL, 'Pending', 'order_SdPp73ilpi8ORa', NULL, NULL, 'Placed', NULL, NULL, '2026-04-14 15:03:51.181', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '5161616516', 'asdasd', 'asd', '165165', '2026-04-14 15:03:51.182', '2026-04-14 15:03:51.182'),
(77, 'YRjg4LrfoUYE5EnH7Y9U78RMOUG2', 5.00, 1.00, NULL, 'Paid', 'order_SdPqmuYyc3EpYj', 'pay_SdPr3EKFOQk2ZW', 'd2baaaabdb6b8c946cc2e1b05065f2a9454906840d5c8ef76913e967b63bdacd', 'Placed', NULL, NULL, '2026-04-14 15:05:26.324', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '1234567899', 'delhi', 'asdasd', '165165', '2026-04-14 15:05:26.326', '2026-04-14 15:05:49.677'),
(78, 'YRjg4LrfoUYE5EnH7Y9U78RMOUG2', 10.00, 1.00, NULL, 'Pending', 'order_SdZiKAeyaXAvRh', NULL, NULL, 'Placed', NULL, NULL, '2026-04-15 00:44:02.838', NULL, NULL, NULL, NULL, NULL, NULL, 'asd', '4165313513', 'sdasd', 'sadf', '252652', '2026-04-15 00:44:02.838', '2026-04-15 00:44:02.838'),
(79, 'YRjg4LrfoUYE5EnH7Y9U78RMOUG2', 9.00, 2.00, NULL, 'Pending', 'order_SdaptsUP3mkyfo', NULL, NULL, 'Placed', NULL, NULL, '2026-04-15 01:49:54.871', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '1234567899', 'delhi', 'asdasd', '165165', '2026-04-15 01:49:54.871', '2026-04-15 01:49:54.871'),
(80, 'YRjg4LrfoUYE5EnH7Y9U78RMOUG2', 9.00, 2.00, NULL, 'Pending', 'order_SdarNhzAAw7Cb5', NULL, NULL, 'Placed', NULL, NULL, '2026-04-15 01:51:18.969', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '1234567899', 'delhi', 'asdasd', '165165', '2026-04-15 01:51:18.969', '2026-04-15 01:51:18.969'),
(81, 'YRjg4LrfoUYE5EnH7Y9U78RMOUG2', 5.60, 2.00, NULL, 'Pending', 'order_SdeRDz726x1gto', NULL, NULL, 'Placed', NULL, NULL, '2026-04-15 05:21:20.088', NULL, NULL, NULL, NULL, 'R', 0.40, 'Kushagra Sharma', '1234567899', 'delhi', 'asdasd', '165165', '2026-04-15 05:21:20.088', '2026-04-15 05:21:20.088'),
(82, 'GHNWIpv9ZiTOJRjsJlhdHHqq9ix1', 44.00, 0.00, '4e604c79', 'Pending', 'order_SdeTsywPZ1Wvbf', NULL, NULL, 'Placed', NULL, NULL, '2026-04-15 05:23:51.212', NULL, NULL, NULL, NULL, NULL, NULL, 'adfsa', '4646516546', 'dasda', 'sdasd', '164165', '2026-04-15 05:23:51.212', '2026-04-15 05:23:51.212'),
(83, 'YRjg4LrfoUYE5EnH7Y9U78RMOUG2', 6.00, 2.00, NULL, 'Pending', 'order_SdgcxofufG9ML4', NULL, NULL, 'Placed', NULL, NULL, '2026-04-15 07:29:50.292', NULL, NULL, NULL, NULL, NULL, NULL, 'Kushagra Sharma', '1234567899', 'delhi', 'asdasd', '165165', '2026-04-15 07:29:50.292', '2026-04-15 07:29:50.292');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_product_id` varchar(100) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `qty` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `customization` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`customization`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `item_product_id`, `slug`, `title`, `qty`, `price`, `image`, `customization`) VALUES
(1, 1, 'wh-009', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, NULL, 'null'),
(2, 2, 'tt-007', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, NULL, 'null'),
(3, 3, 'tt-007', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, NULL, 'null'),
(4, 4, 'tt-003', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 1, 1.00, NULL, 'null'),
(5, 5, 'tt-007', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, NULL, 'null'),
(6, 6, 'wc-003', 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 1, 1.00, NULL, 'null'),
(7, 7, 'wc-003', 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 1, 1.00, NULL, 'null'),
(8, 8, 'p-1774991414632', 'asdasd', 'asdasd', 1, 1.00, NULL, 'null'),
(9, 9, 'wh-009', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, NULL, 'null'),
(10, 10, 'wh-009', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 2, 1.00, NULL, 'null'),
(11, 11, 'wh-004', 'lakshmi-brass-wall-art', 'Lakshmi Brass Wall Art', 1, 1.00, NULL, 'null'),
(12, 12, 'wc-003', 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 1, 1.00, NULL, 'null'),
(13, 13, 'wh-009', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 3, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(14, 13, 'tt-007', 'buddha-meditation-collection', 'Buddha Meditation Collection', 3, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(15, 13, 'gi-001', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(16, 13, 'tt-005', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(17, 14, 'tt-007', 'buddha-meditation-collection', 'Buddha Meditation Collection', 3, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(18, 14, 'tt-004', 'kondapalli-toy-set', 'Kondapalli Toy Set — Village Scene', 4, 1.00, '/images/pexels-photo-352901.webp', 'null'),
(19, 15, 'wh-009', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 10, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(20, 16, 'cc-001', 'custom-god-idols', 'Custom God Idols', 1, 1.00, '/images/pexels-photo-31452296.webp', 'null'),
(21, 17, 'wh-005', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 2, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(22, 18, 'wh-009', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(23, 19, 'wh-009', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 2, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(24, 20, '69cc36253cfecbf3f28d3bd5', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(25, 20, '69cc36253cfecbf3f28d3bd2', 'lakshmi-brass-wall-art', 'Lakshmi Brass Wall Art', 1, 1.00, '/images/pexels-photo-33810565.webp', 'null'),
(26, 20, '69cc36253cfecbf3f28d3bd0', 'buddha-meditation-wall-art', 'Buddha Meditation Wall Art', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(27, 21, '69cc36253cfecbf3f28d3be1', 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 1, 1.00, '/images/pexels-photo-30921929.webp', 'null'),
(28, 22, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 2, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(29, 23, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(30, 23, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(31, 23, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(32, 24, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(33, 24, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(34, 24, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(35, 25, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(36, 25, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(37, 25, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(38, 26, '69cc36253cfecbf3f28d3bd0', 'buddha-meditation-wall-art', 'Buddha Meditation Wall Art', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(39, 26, '69cc36253cfecbf3f28d3bd3', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 1, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(40, 26, '69cc36253cfecbf3f28d3bd5', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(41, 27, '69cc36253cfecbf3f28d3bd5', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(42, 27, '69cc36253cfecbf3f28d3bd2', 'lakshmi-brass-wall-art', 'Lakshmi Brass Wall Art', 1, 1.00, '/images/pexels-photo-33810565.webp', 'null'),
(43, 27, '69cc36253cfecbf3f28d3bd3', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 1, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(44, 28, '69cc36253cfecbf3f28d3bd5', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(45, 28, '69cc36253cfecbf3f28d3bd2', 'lakshmi-brass-wall-art', 'Lakshmi Brass Wall Art', 1, 1.00, '/images/pexels-photo-33810565.webp', 'null'),
(46, 28, '69cc36253cfecbf3f28d3bd3', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 1, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(47, 29, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(48, 29, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(49, 29, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(50, 29, '69cc36253cfecbf3f28d3bd8', 'brass-ganesha-idol-antique', 'Antique Brass Ganesha Idol', 1, 1.00, '/images/pexels-photo-31452296.webp', 'null'),
(51, 29, '69cc36253cfecbf3f28d3be1', 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 1, 1.00, '/images/pexels-photo-30921929.webp', 'null'),
(52, 29, '69cc36253cfecbf3f28d3bd2', 'lakshmi-brass-wall-art', 'Lakshmi Brass Wall Art', 1, 1.00, '/images/pexels-photo-33810565.webp', 'null'),
(53, 30, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(54, 30, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(55, 30, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(56, 30, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(57, 30, '69cc36253cfecbf3f28d3bd8', 'brass-ganesha-idol-antique', 'Antique Brass Ganesha Idol', 1, 1.00, '/images/pexels-photo-31452296.webp', 'null'),
(58, 30, '69cc36253cfecbf3f28d3be1', 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 1, 1.00, '/images/pexels-photo-30921929.webp', 'null'),
(59, 31, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 3, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(60, 32, '69cc36253cfecbf3f28d3bd0', 'buddha-meditation-wall-art', 'Buddha Meditation Wall Art', 5, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(61, 33, '69cc36253cfecbf3f28d3bd3', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 1, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(62, 33, '69cc36253cfecbf3f28d3bd5', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(63, 33, '69cc36253cfecbf3f28d3bd2', 'lakshmi-brass-wall-art', 'Lakshmi Brass Wall Art', 1, 1.00, '/images/pexels-photo-33810565.webp', 'null'),
(64, 34, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(65, 34, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(66, 34, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(67, 35, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 5, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(68, 35, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(69, 35, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(70, 36, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(71, 36, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(72, 36, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(73, 36, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(74, 37, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(75, 37, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(76, 37, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(77, 37, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(78, 37, '69cc36253cfecbf3f28d3bd0', 'buddha-meditation-wall-art', 'Buddha Meditation Wall Art', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(79, 37, '69cc36253cfecbf3f28d3bd2', 'lakshmi-brass-wall-art', 'Lakshmi Brass Wall Art', 1, 1.00, '/images/pexels-photo-33810565.webp', 'null'),
(80, 38, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(81, 38, '69d31be25667a6b4c9687bdc', 'assssssssssssssssssssssssssssss', 'assssssssssssssssssssssssssssss', 4, 1.00, '/images/offer-f6cd7197.webp', 'null'),
(82, 38, '69cc3836dd1f4f1884afbe6d', 'asdasd', 'asdasd', 1, 1.00, '/images/offer-f6cd7197.webp', 'null'),
(83, 38, '69cc36253cfecbf3f28d3bd3', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 1, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(84, 38, '69cc36253cfecbf3f28d3bd0', 'buddha-meditation-wall-art', 'Buddha Meditation Wall Art', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(85, 38, '69cc36253cfecbf3f28d3bd5', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(86, 39, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 2, 1.00, '/images/pexels-photo-10900769.webp', 'null'),
(87, 39, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 1, 1.00, '/images/pexels-photo-36769191.webp', 'null'),
(88, 40, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 4, 11.00, '/images/pexels-photo-10900769.webp', 'null'),
(89, 40, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 3, 22.00, '/images/pexels-photo-36769191.webp', 'null'),
(90, 41, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 2, 2.00, '/images/pexels-photo-10900769.webp', 'null'),
(91, 41, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 4, 12.00, '/images/pexels-photo-36769191.webp', 'null'),
(92, 42, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 2, 11.00, '/images/pexels-photo-10900769.webp', 'null'),
(93, 42, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 1, 22.00, '/images/pexels-photo-36769191.webp', 'null'),
(94, 43, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 1, 1.00, '/images/pexels-photo-10900769.webp', 'null'),
(95, 43, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 1, 2.00, '/images/pexels-photo-36769191.webp', 'null'),
(96, 44, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 1, 12.00, '/images/pexels-photo-10900769.webp', 'null'),
(97, 44, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 1, 1.00, '/images/pexels-photo-36769191.webp', 'null'),
(98, 45, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 1, 12.00, '/images/pexels-photo-10900769.webp', 'null'),
(99, 45, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 3, 11.00, '/images/pexels-photo-36769191.webp', 'null'),
(100, 46, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 1, 12.00, '/images/pexels-photo-10900769.webp', 'null'),
(101, 46, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 1, 11.00, '/images/pexels-photo-36769191.webp', 'null'),
(102, 47, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 1, 12.00, '/images/pexels-photo-10900769.webp', 'null'),
(103, 47, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 1, 11.00, '/images/pexels-photo-36769191.webp', 'null'),
(104, 48, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(105, 48, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(106, 49, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(107, 49, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(108, 50, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(109, 50, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(110, 51, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(111, 51, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(112, 52, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(113, 52, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(114, 53, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(115, 53, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(116, 54, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(117, 54, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(118, 54, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(119, 55, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(120, 55, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(121, 55, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(122, 56, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(123, 56, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(124, 56, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(125, 56, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(126, 57, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(127, 57, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(128, 57, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(129, 58, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(130, 58, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(131, 58, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(132, 59, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(133, 59, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(134, 59, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(135, 60, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 2, 12.00, '/images/pexels-photo-10900769.webp', 'null'),
(136, 60, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 1, 13.00, '/images/pexels-photo-36769191.webp', 'null'),
(137, 61, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 1, 12.00, '/images/pexels-photo-10900769.webp', 'null'),
(138, 61, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 1, 11.00, '/images/pexels-photo-36769191.webp', 'null'),
(139, 62, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(140, 62, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(141, 62, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(142, 63, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 2, 10.00, '/images/pexels-photo-10900769.webp', 'null'),
(143, 63, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 2, 15.00, '/images/pexels-photo-36769191.webp', 'null'),
(144, 63, '69cc36253cfecbf3f28d3be9', 'custom-god-idols', 'Custom God Idols', 3, 18.00, '/images/pexels-photo-31452296.webp', 'null'),
(145, 64, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 2, 15.00, '/images/pexels-photo-10900769.webp', 'null'),
(146, 64, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 3, 11.00, '/images/pexels-photo-36769191.webp', 'null'),
(147, 64, '69cc36253cfecbf3f28d3be9', 'custom-god-idols', 'Custom God Idols', 3, 18.00, '/images/pexels-photo-31452296.webp', 'null'),
(148, 65, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 2, 123.00, '/images/pexels-photo-10900769.webp', 'null'),
(149, 65, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 2, 145.00, '/images/pexels-photo-36769191.webp', 'null'),
(150, 66, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 2, 10.00, '/images/pexels-photo-10900769.webp', 'null'),
(151, 66, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 1, 11.00, '/images/pexels-photo-36769191.webp', 'null'),
(152, 67, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(153, 67, '69d31be25667a6b4c9687bdc', 'assssssssssssssssssssssssssssss', 'assssssssssssssssssssssssssssss', 4, 1.00, '/images/offer-f6cd7197.webp', 'null'),
(154, 67, '69cc3836dd1f4f1884afbe6d', 'asdasd', 'asdasd', 1, 1.00, '/images/offer-f6cd7197.webp', 'null'),
(155, 67, '69cc36253cfecbf3f28d3bd3', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 1, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(156, 67, '69cc36253cfecbf3f28d3bd0', 'buddha-meditation-wall-art', 'Buddha Meditation Wall Art', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(157, 67, '69cc36253cfecbf3f28d3bd5', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(158, 68, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(159, 68, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(160, 68, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(161, 68, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(162, 68, '69cc36253cfecbf3f28d3be9', 'custom-god-idols', 'Custom God Idols', 1, 1.00, '/images/pexels-photo-31452296.webp', 'null'),
(163, 69, '69cc36253cfecbf3f28d3be1', 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 4, 1.00, '/images/pexels-photo-30921929.webp', 'null'),
(164, 70, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(165, 70, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(166, 70, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(167, 71, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(168, 71, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(169, 71, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(170, 71, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(171, 72, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(172, 72, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(173, 72, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(174, 72, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(175, 73, '69cc36253cfecbf3f28d3bda', 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 1, 10.00, '/images/pexels-photo-10900769.webp', 'null'),
(176, 73, '69cc36253cfecbf3f28d3bdb', 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 1, 10.00, '/images/pexels-photo-36769191.webp', 'null'),
(177, 74, '69dcd77ca0a9bf8fdbd18aa1', 'qwert', 'qwert', 3, 10.00, '/images/offer-f6cd7197.webp', 'null'),
(178, 74, '69dcb19fafa4b6d4e8f27939', 'pot', 'pot', 2, 10.00, '/images/offer-f6cd7197.webp', 'null'),
(179, 75, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(180, 75, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(181, 75, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(182, 75, '69cc36253cfecbf3f28d3bd3', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 1, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(183, 75, '69cc36253cfecbf3f28d3be9', 'custom-god-idols', 'Custom God Idols', 1, 1.00, '/images/pexels-photo-31452296.webp', 'null'),
(184, 75, '69cc36253cfecbf3f28d3bd5', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(185, 75, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(186, 75, '69cc36253cfecbf3f28d3bcf', 'divine-ganesh-metal-wall-art', 'Divine Ganesh Metal Wall Art', 1, 1.00, '/images/pexels-photo-21383559.webp', 'null'),
(187, 76, '69cc36253cfecbf3f28d3bdd', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(188, 76, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(189, 76, '69cc36253cfecbf3f28d3bd7', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(190, 76, '69cc36253cfecbf3f28d3bd3', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 1, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(191, 76, '69cc36253cfecbf3f28d3be9', 'custom-god-idols', 'Custom God Idols', 1, 1.00, '/images/pexels-photo-31452296.webp', 'null'),
(192, 76, '69cc36253cfecbf3f28d3bd5', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(193, 76, '69cc36253cfecbf3f28d3be3', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(194, 76, '69cc36253cfecbf3f28d3bcf', 'divine-ganesh-metal-wall-art', 'Divine Ganesh Metal Wall Art', 1, 1.00, '/images/pexels-photo-21383559.webp', 'null'),
(195, 77, '69cc36253cfecbf3f28d3bd9', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(196, 77, '69cc36253cfecbf3f28d3bcf', 'divine-ganesh-metal-wall-art', 'Divine Ganesh Metal Wall Art', 1, 1.00, '/images/pexels-photo-21383559.webp', 'null'),
(197, 77, '69cc36253cfecbf3f28d3bd2', 'lakshmi-brass-wall-art', 'Lakshmi Brass Wall Art', 1, 1.00, '/images/pexels-photo-33810565.webp', 'null'),
(198, 77, '69cc36253cfecbf3f28d3be1', 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 1, 1.00, '/images/pexels-photo-30921929.webp', 'null'),
(199, 78, '12', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(200, 78, '26', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(201, 78, '18', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(202, 78, '11', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 1, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(203, 78, '15', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(204, 78, '10', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(205, 78, '9', 'toran-garland-combo-set', 'Toran & Table Runner Combo — Navratri', 1, 1.00, '/images/pexels-photo-8818671.webp', 'null'),
(206, 78, '16', 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 1, 1.00, '/images/pexels-photo-30921929.webp', 'null'),
(207, 78, '27', 'ikat-wall-and-cushion-set', 'Ikat Wall Hanging & Cushion Set', 1, 1.00, '/images/pexels-photo-28700566.webp', 'null'),
(208, 79, '12', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(209, 79, '26', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(210, 79, '18', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(211, 79, '11', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 1, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(212, 79, '3', 'custom-god-idols', 'Custom God Idols', 1, 1.00, '/images/pexels-photo-31452296.webp', 'null'),
(213, 79, '15', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(214, 79, '10', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(215, 80, '12', 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 1, 1.00, '/images/pexels-photo-12520327.webp', 'null'),
(216, 80, '26', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(217, 80, '18', 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 1, 1.00, '/images/pexels-photo-12896785.webp', 'null'),
(218, 80, '11', 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 1, 1.00, '/images/pexels-photo-32112529.webp', 'null'),
(219, 80, '3', 'custom-god-idols', 'Custom God Idols', 1, 1.00, '/images/pexels-photo-31452296.webp', 'null'),
(220, 80, '15', 'krishna-brass-figurine', 'Krishna Brass Figurine', 1, 1.00, '/images/pexels-photo-31477845.webp', 'null'),
(221, 80, '10', 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 1, 1.00, '/images/pexels-photo-36455711.webp', 'null'),
(222, 81, '26', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(223, 81, '20', 'divine-ganesh-metal-wall-art', 'Divine Ganesh Metal Wall Art', 1, 1.00, '/images/pexels-photo-21383559.webp', 'null'),
(224, 81, '17', 'lakshmi-brass-wall-art', 'Lakshmi Brass Wall Art', 1, 1.00, '/images/pexels-photo-33810565.webp', 'null'),
(225, 81, '16', 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 1, 1.00, '/images/pexels-photo-30921929.webp', 'null'),
(226, 82, '33', 'blue-pot', 'blue pot', 2, 17.00, '/images/offer-f6cd7197.webp', NULL),
(227, 82, '34', 'hot-pot', 'hot pot', 1, 10.00, '/images/offer-f6cd7197.webp', NULL),
(228, 83, '26', 'buddha-meditation-collection', 'Buddha Meditation Collection', 1, 1.00, '/images/pexels-photo-14694207.webp', 'null'),
(229, 83, '20', 'divine-ganesh-metal-wall-art', 'Divine Ganesh Metal Wall Art', 1, 1.00, '/images/pexels-photo-21383559.webp', 'null'),
(230, 83, '17', 'lakshmi-brass-wall-art', 'Lakshmi Brass Wall Art', 1, 1.00, '/images/pexels-photo-33810565.webp', 'null'),
(231, 83, '16', 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 1, 1.00, '/images/pexels-photo-30921929.webp', 'null');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `artisan` varchar(255) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `reviews` int(11) NOT NULL DEFAULT 0,
  `weight` decimal(10,2) NOT NULL DEFAULT 1.00,
  `length` decimal(10,2) NOT NULL DEFAULT 15.00,
  `breadth` decimal(10,2) NOT NULL DEFAULT 15.00,
  `height` decimal(10,2) NOT NULL DEFAULT 10.00,
  `quantity` varchar(100) DEFAULT NULL,
  `size` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `video` varchar(500) DEFAULT NULL,
  `cta_type` varchar(50) DEFAULT NULL,
  `cta_label` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `slug`, `title`, `description`, `price`, `sale_price`, `category`, `stock`, `artisan`, `featured`, `rating`, `reviews`, `weight`, `length`, `breadth`, `height`, `quantity`, `size`, `material`, `color`, `type`, `video`, `cta_type`, `cta_label`, `created_at`, `updated_at`) VALUES
(1, 'blue-pottery-vase--jaipur', 'Blue Pottery Vase — Jaipur', 'Iconic Jaipur Blue Pottery vase with floral motifs in cobalt blue and white. Made without clay.', 1.00, NULL, 'table-top-mount', 11, 'Gopal Balaji, Jaipur', 1, 4.70, 142, 1.00, 15.00, 15.00, 10.00, '1 piece', '3 x 3 x 7 inches', 'Aluminium', 'Cobalt Blue & White', 'product', '/videos/oceans.mp4', NULL, NULL, '2026-04-14 18:04:34.049', '2026-04-14 01:36:59.840'),
(2, 'wooden-elephant-sculpture', 'Carved Wooden Elephant Sculpture', 'Hand-carved rosewood elephant with intricate trunk-up posture.', 1.00, NULL, 'table-top-mount', 4, 'Venkatesh Carving Studio, Channapatna', 0, 4.80, 76, 1.00, 15.00, 15.00, 10.00, '1 piece', '8 x 4 x 7 inches', 'Bronze', 'Natural Rosewood', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.174', '2026-04-14 01:37:26.099'),
(3, 'custom-god-idols', 'Custom God Idols', 'Commission divine idols of your choice — any deity, any size, any finish.', 1.00, 0.00, 'custom-creations', 963, 'Master Craftsmen, Hyderabad', 1, 5.00, 0, 1.00, 15.00, 15.00, 10.00, 'Custom', 'Any size', 'Brass', 'Custom finish', 'service', NULL, 'form', 'Share Your Idea', '2026-04-14 18:04:34.197', '2026-04-14 01:45:28.821'),
(4, 'buddha-meditation-wall-art', 'Buddha Meditation Wall Art', 'Beautiful hand-crafted Buddha wall art in premium bronze finish. Each piece is hand-finished with a rich patina that deepens with age.', 1.00, NULL, 'wall-hangings', 11, 'Local Artisan', 1, 4.80, 124, 1.00, 15.00, 15.00, 10.00, '1 piece', '12 x 12 inches', 'Bronze', 'Rich Bronze Patina', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.208', '2026-04-14 01:36:59.640'),
(5, 'kondapalli-toy-set', 'Kondapalli Toy Set — Village Scene', 'Traditional Andhra wooden toys made from soft white wood and tamarind seeds.', 1.00, NULL, 'table-top-mount', 18, 'Lakshmi Artisans, Kondapalli', 0, 4.60, 34, 1.00, 15.00, 15.00, 10.00, 'Set of 8 pieces', '4 x 3 inches (each)', 'Aluminium', 'Multi-colour Painted', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.220', '2026-04-14 01:36:59.672'),
(6, 'handloom-tote-bag-ikat', 'Handloom Ikat Tote Bag', 'Sturdy handloom cotton tote bag with vibrant Pochampally Ikat pattern.', 1.00, NULL, 'gift-items', 80, 'Pochampally Weavers Cooperative, Telangana', 0, 4.50, 67, 1.00, 15.00, 15.00, 10.00, '1 piece', '14 x 16 inches', 'Aluminium', 'Vibrant Pochampally Multicolour', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.230', '2026-04-14 01:36:59.705'),
(7, 'hand-block-print-stationery', 'Hand Block Print Stationery Set', 'Set of 8 notecards and 2 journals with hand block-printed covers.', 1.00, NULL, 'gift-items', 45, 'Block Print Studio, Jaipur', 0, 4.70, 89, 1.00, 15.00, 15.00, 10.00, '8 notecards + 2 journals', 'A5 (8.3 x 5.8 inches)', 'Aluminium', 'Indigo & Madder on Natural', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.242', '2026-04-14 01:36:59.740'),
(8, 'aromatic-dhoop-incense-gift', 'Aromatic Dhoop Sticks — Ashtasugandhit Set', 'Premium handrolled dhoop incense made from 8 sacred aromatics.', 1.00, NULL, 'gift-items', 60, 'Sacred Agarbatti, Mysore', 0, 4.60, 112, 1.00, 15.00, 15.00, 10.00, '24 sticks', '9 x 1 inches (each stick)', 'Bronze', 'Natural Sandalwood', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.264', '2026-04-14 01:36:59.774'),
(9, 'toran-garland-combo-set', 'Toran & Table Runner Combo — Navratri', 'Festive combo of a hand-embroidered door toran and matching table runner.', 1.00, NULL, 'wall-table-combo', 15, 'Savitri Handicrafts, Surat', 1, 4.80, 94, 1.00, 15.00, 15.00, 10.00, '1 set (Toran + Runner)', 'Toran: 36 inches | Runner: 12 x 60 inches', 'Bronze', 'Saffron, Crimson & Green', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.275', '2026-04-14 01:36:59.807'),
(10, 'silk-scarf-banarasi-gift-box', 'Banarasi Silk Scarf — Gift Box', 'Luxurious hand-woven Banarasi silk scarf with zari border work.', 1.00, NULL, 'gift-items', 14, 'Looms of Benaras, Varanasi', 1, 4.90, 215, 1.00, 15.00, 15.00, 10.00, '1 piece', '79 x 27 inches', 'Aluminium', 'Royal Crimson with Gold Zari', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.285', '2026-04-14 01:36:59.573'),
(11, 'om-symbol-metal-decor', 'Om Symbol Metal Decor', 'Spiritual Om symbol metal decor in premium aluminium. A modern minimalist take on an ancient sacred symbol — perfect for meditation spaces and contemporary interiors.', 1.00, NULL, 'wall-hangings', 13, 'Local Artisan', 0, 4.70, 142, 1.00, 15.00, 15.00, 10.00, '1 piece', '10 x 10 inches', 'Aluminium', 'Brushed Silver', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.296', '2026-04-14 01:36:59.873'),
(12, 'channapatna-chess-set', 'Channapatna Lacquerware Chess Set', 'Iconic Channapatna lacquerware chess set in candy-striped ivory and ebony tones.', 1.00, NULL, 'table-top-mount', 15, 'Craft Collective, Channapatna', 1, 4.90, 52, 1.00, 15.00, 15.00, 10.00, '32 pieces + board', '12 x 12 inches (board)', 'Brass', 'Ivory & Ebony', NULL, '/videos/oceans.mp4', NULL, NULL, '2026-04-14 18:04:34.305', '2026-04-14 01:36:59.907'),
(13, 'brass-wall-clock-coaster-set', 'Brass Wall Clock & Coaster Set', 'Handcrafted dhokra-inspired brass wall clock with four matching coasters.', 1.00, NULL, 'wall-table-combo', 17, 'Metal Masters, Moradabad', 0, 4.60, 31, 1.00, 15.00, 15.00, 10.00, '1 Clock + 4 Coasters', 'Clock: 14 inch dia | Coasters: 4 inch dia', 'Brass', 'Polished Brass', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.318', '2026-04-14 01:36:59.939'),
(14, 'brass-ganesha-idol-antique', 'Antique Brass Ganesha Idol', 'Hand-cast brass Ganesha idol finished with antique patina. Crafted using the ancient lost-wax (Dhokra) casting method practised in Chhattisgarh for over 4,000 years.', 1.00, NULL, 'table-top-mount', 17, 'Ramesh Vishwakarma, Bastar', 1, 4.90, 198, 1.00, 15.00, 15.00, 10.00, '1 piece', '6 x 4 x 6 inches', 'Brass', 'Antique Gold Patina', NULL, '/videos/oceans.mp4', NULL, NULL, '2026-04-14 18:04:34.330', '2026-04-14 01:36:59.973'),
(15, 'krishna-brass-figurine', 'Krishna Brass Figurine', 'Handcrafted Krishna brass figurine for wall display. Depicted in the iconic flute-playing pose, this piece radiates divine joy and artistic excellence.', 1.00, NULL, 'wall-hangings', 19, 'Local Artisan', 1, 4.80, 167, 1.00, 15.00, 15.00, 10.00, '1 piece', '16 x 8 inches', 'Brass', 'Warm Gold', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.343', '2026-04-14 01:37:00.006'),
(16, 'pattachitra-art-diary-set', 'Pattachitra Art & Diary Gift Set', 'Framed Pattachitra painting paired with a handmade paper diary.', 1.00, NULL, 'wall-table-combo', 11, 'Apindra Swain, Raghurajpur', 0, 4.90, 43, 1.00, 15.00, 15.00, 10.00, '1 set (Painting + Diary)', 'Painting: 10 x 14 inches | Diary: A5', 'Aluminium', 'Traditional Pattachitra Palette', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.353', '2026-04-14 15:05:50.790'),
(17, 'lakshmi-brass-wall-art', 'Lakshmi Brass Wall Art', 'Premium Lakshmi brass wall art, intricately crafted to invoke the goddess of wealth and prosperity. A sacred addition to puja rooms and living spaces alike.', 1.00, NULL, 'wall-hangings', 14, 'Local Artisan', 1, 4.90, 189, 1.00, 15.00, 15.00, 10.00, '1 piece', '14 x 10 inches', 'Brass', 'Antique Gold', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.361', '2026-04-14 15:05:50.569'),
(18, 'peacock-metal-wall-art', 'Peacock Metal Wall Art', 'Stunning peacock metal wall art — India\'s national bird rendered in breathtaking aluminium with hand-painted enamel feather details. A true showstopper.', 1.00, NULL, 'wall-hangings', 26, 'Local Artisan', 1, 4.00, 1, 1.00, 15.00, 15.00, 10.00, '1 piece', '24 x 18 inches', 'Aluminium', 'Teal & Gold Enamel', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.367', '2026-04-14 11:41:47.979'),
(19, 'etched-copper-water-bottle', 'Etched Copper Water Bottle', 'Handcrafted copper water bottle with traditional floral etching.', 1.00, NULL, 'gift-items', 35, 'Copper Crafts, Rewari', 1, 4.80, 178, 1.00, 15.00, 15.00, 10.00, '2 piece', '10 x 3 inches', 'Brass', 'Natural Copper', 'product', NULL, NULL, NULL, '2026-04-14 18:04:34.376', '2026-04-14 12:37:09.915'),
(20, 'divine-ganesh-metal-wall-art', 'Divine Ganesh Metal Wall Art', 'Beautiful hand-crafted Ganesh metal wall art, cast using traditional lost-wax technique. The intricate detailing on Lord Ganesha\'s form is a testament to generations of mastery.', 1.00, NULL, 'wall-hangings', 16, 'Local Artisan', 1, 4.90, 203, 1.00, 15.00, 15.00, 10.00, '1 piece', '12 x 12 inches', 'Brass', 'Antique Gold', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.384', '2026-04-14 15:05:50.346'),
(21, 'personalized-sculptures', 'Personalized Sculptures', 'Transform a portrait, a family heirloom, or a personal vision into a sculpture.', 1.00, NULL, 'custom-creations', 996, 'Master Craftsmen, Hyderabad', 1, 5.00, 0, 1.00, 15.00, 15.00, 10.00, 'Custom', 'Any size', 'Bronze', 'Custom finish', 'service', NULL, 'form', 'Start Custom Design', '2026-04-14 18:04:34.392', '2026-03-31 22:02:19.384'),
(22, 'shiva-trishul-wall-art', 'Shiva Trishul Wall Art', 'Divine Shiva Trishul wall art, hand-forged in pure brass. The three prongs represent creation, preservation and destruction — a powerful spiritual statement piece.', 1.00, NULL, 'wall-hangings', 24, 'Local Artisan', 0, 4.60, 98, 1.00, 15.00, 15.00, 10.00, '1 piece', '18 x 6 inches', 'Brass', 'Dark Antique Brass', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.400', '2026-04-14 01:36:59.334'),
(23, 'metal-diya-lamp-wall-decor', 'Metal Diya Lamp Wall Decor', 'Traditional metal Diya lamp wall decor in hand-cast bronze. The warm glow it creates when lit transforms any room into a sanctuary of peace.', 1.00, NULL, 'wall-hangings', 23, 'Local Artisan', 0, 4.50, 134, 1.00, 15.00, 15.00, 10.00, '1 piece', '10 x 8 inches', 'Bronze', 'Warm Bronze', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.406', '2026-04-14 01:36:59.368'),
(24, 'dhokra-owl-figurine', 'Dhokra Cast Owl Figurine', 'Owl figurine cast using the ancient Dhokra technique.', 1.00, NULL, 'table-top-mount', 20, 'Sukumar Dhokra, Odisha', 0, 4.50, 28, 1.00, 15.00, 15.00, 10.00, '1 piece', '4 x 2.5 x 5 inches', 'Brass', 'Raw Tribal Gold', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.412', '2026-04-14 01:36:59.402'),
(25, 'brass-wall-hanging-decor', 'Brass Wall Hanging Decor', 'Classic brass wall hanging decor with traditional motifs. Hand-etched and polished to a warm golden finish, this piece adds timeless elegance to any wall.', 1.00, NULL, 'wall-hangings', 20, 'Local Artisan', 1, 4.70, 156, 1.00, 15.00, 15.00, 10.00, '1 piece', '12 x 12 inches', 'Brass', 'Polished Gold', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.421', '2026-04-14 01:36:59.436'),
(26, 'buddha-meditation-collection', 'Buddha Meditation Collection', 'Premium metal Buddha sculptures and wall art. Bring peace and serenity to your space with our exclusive collection. Each piece is hand-finished with a rich bronze patina.', 1.00, NULL, 'table-top-mount', 7, 'Vishwa Crafts, Varanasi', 1, 5.00, 215, 1.00, 15.00, 15.00, 10.00, '1 piece', '16 x 10 x 8 inches', 'Bronze', 'Deep Bronze Patina', NULL, '/videos/oceans.mp4', NULL, NULL, '2026-04-14 18:04:34.429', '2026-04-14 15:05:50.124'),
(27, 'ikat-wall-and-cushion-set', 'Ikat Wall Hanging & Cushion Set', 'Premium Odisha Ikat fabric wall hanging paired with two matching cushion covers.', 1.00, NULL, 'wall-table-combo', 21, 'Weavers of Sambalpuri, Odisha', 1, 4.70, 67, 1.00, 15.00, 15.00, 10.00, '1 set (Hanging + 2 Cushion Covers)', 'Hanging: 20 x 28 inches | Cushions: 18 x 18 inches', 'Brass', 'Multicolour Ikat Weave', NULL, NULL, NULL, NULL, '2026-04-14 18:04:34.439', '2026-04-14 01:36:59.504'),
(28, 'brass-masala-dabba--heritage-spice-box', 'Brass Masala Dabba — Heritage Spice Box', 'Seven-compartment traditional spice box crafted from food-grade brass.', 9.00, NULL, 'gift-items', 19, 'Heritage Brass, Moradabad', 1, 4.80, 163, 1.00, 15.00, 15.00, 10.00, '1 piece', '8.5 inches diameter', 'Brass', 'Bright Brass', 'product', NULL, NULL, NULL, '2026-04-14 18:04:34.447', '2026-04-14 18:24:22.051'),
(30, 'cup', 'cup', '', 150.00, 100.00, 'wall-hangings', 19, '', 0, 4.50, 0, 1.00, 15.00, 15.00, 10.00, '1 piece', '12', 'Brass', '', 'product', NULL, NULL, NULL, '2026-04-14 18:26:39.994', '2026-04-14 18:27:12.768'),
(31, 'pot', 'pot', '', 155.00, 88.00, 'wall-hangings', 19, '', 0, 4.50, 0, 1.00, 15.00, 15.00, 10.00, '1 piece', '12', 'Brass', '', 'product', NULL, NULL, NULL, '2026-04-14 18:27:45.575', '2026-04-14 18:27:45.575'),
(33, 'blue-pot', 'blue pot', '', 200.00, 100.00, 'wall-hangings', 20, '', 0, 4.50, 0, 1.00, 15.00, 15.00, 10.00, '1 piece', '12', 'Brass', '', 'product', NULL, NULL, NULL, '2026-04-14 22:45:49.007', '2026-04-14 22:45:49.007'),
(34, 'hot-pot', 'hot pot', '', 150.00, 100.00, 'wall-hangings', 15, '', 0, 4.50, 0, 1.00, 15.00, 15.00, 10.00, '1 piece', '12', 'Brass', '', 'product', NULL, NULL, NULL, '2026-04-14 22:46:26.076', '2026-04-14 22:46:26.076');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `url` varchar(500) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `url`, `position`) VALUES
(1, 1, '/images/pexels-photo-10900769.webp', 0),
(2, 2, '/images/pexels-photo-36769191.webp', 0),
(3, 3, '/images/pexels-photo-31452296.webp', 0),
(4, 4, '/images/pexels-photo-14694207.webp', 0),
(5, 5, '/images/pexels-photo-352901.webp', 0),
(6, 6, '/images/pexels-photo-4937320.webp', 0),
(7, 7, '/images/pexels-photo-34161635.webp', 0),
(8, 8, '/images/pexels-photo-20895320.webp', 0),
(9, 9, '/images/pexels-photo-8818671.webp', 0),
(10, 10, '/images/pexels-photo-36455711.webp', 0),
(11, 11, '/images/pexels-photo-32112529.webp', 0),
(12, 12, '/images/pexels-photo-12520327.webp', 0),
(13, 13, '/images/pexels-photo-34470630.webp', 0),
(14, 14, '/images/pexels-photo-31452296.webp', 0),
(15, 15, '/images/pexels-photo-31477845.webp', 0),
(16, 16, '/images/pexels-photo-30921929.webp', 0),
(17, 17, '/images/pexels-photo-33810565.webp', 0),
(18, 18, '/images/pexels-photo-12896785.webp', 0),
(19, 19, '/images/pexels-photo-7518777.webp', 0),
(20, 20, '/images/pexels-photo-21383559.webp', 0),
(21, 21, '/images/pexels-photo-33619692.webp', 0),
(22, 22, '/images/pexels-photo-35196748.webp', 0),
(23, 23, '/images/pexels-photo-6315702.webp', 0),
(24, 24, '/images/pexels-photo-33619692.webp', 0),
(25, 25, '/images/pexels-photo-32662216.webp', 0),
(26, 26, '/images/pexels-photo-14694207.webp', 0),
(27, 27, '/images/pexels-photo-28700566.webp', 0),
(31, 28, '/images/pexels-photo-32830296.webp', 0),
(33, 30, '/images/offer-f6cd7197.webp', 0),
(34, 31, '/images/offer-f6cd7197.webp', 0),
(35, 33, '/images/offer-f6cd7197.webp', 0),
(36, 34, '/images/offer-f6cd7197.webp', 0);

-- --------------------------------------------------------

--
-- Table structure for table `product_tags`
--

CREATE TABLE `product_tags` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `tag` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_tags`
--

INSERT INTO `product_tags` (`id`, `product_id`, `tag`) VALUES
(1, 1, 'table-top-mount'),
(2, 2, 'wood-carving'),
(3, 2, 'rosewood'),
(4, 2, 'elephant'),
(5, 2, 'beeswax'),
(6, 2, 'sculpture'),
(7, 2, 'custom-sculptures-india'),
(8, 3, 'custom'),
(9, 3, 'idols'),
(10, 3, 'brass'),
(11, 3, 'bronze'),
(12, 3, 'bespoke'),
(13, 3, 'metal-handicrafts-india'),
(14, 4, 'buddha'),
(15, 4, 'meditation'),
(16, 4, 'wall-art'),
(17, 4, 'bronze'),
(18, 4, 'metal-handicrafts-india'),
(19, 5, 'kondapalli'),
(20, 5, 'toys'),
(21, 5, 'andhra'),
(22, 5, 'vegetable-dyes'),
(23, 5, 'UNESCO'),
(24, 6, 'ikat'),
(25, 6, 'tote'),
(26, 6, 'handloom'),
(27, 6, 'pochampally'),
(28, 6, 'sustainable'),
(29, 7, 'block-print'),
(30, 7, 'stationery'),
(31, 7, 'indigo'),
(32, 7, 'recycled-paper'),
(33, 7, 'journal'),
(34, 8, 'incense'),
(35, 8, 'dhoop'),
(36, 8, 'sandalwood'),
(37, 8, 'aromatics'),
(38, 8, 'handrolled'),
(39, 9, 'toran'),
(40, 9, 'gota-patti'),
(41, 9, 'festive'),
(42, 9, 'navratri'),
(43, 9, 'combo'),
(44, 10, 'silk'),
(45, 10, 'banarasi'),
(46, 10, 'scarf'),
(47, 10, 'GI-tag'),
(48, 10, 'gift-box'),
(49, 11, 'om'),
(50, 11, 'spiritual'),
(51, 11, 'decor'),
(52, 11, 'aluminium'),
(53, 11, 'metal-handicrafts-india'),
(54, 12, 'channapatna'),
(55, 12, 'lacquerware'),
(56, 12, 'chess'),
(57, 12, 'GI-tag'),
(58, 12, 'lathe'),
(59, 13, 'brass'),
(60, 13, 'clock'),
(61, 13, 'coasters'),
(62, 13, 'etching'),
(63, 13, 'moradabad'),
(64, 13, 'metal-handicrafts-india'),
(65, 14, 'brass'),
(66, 14, 'ganesha'),
(67, 14, 'dhokra'),
(68, 14, 'lost-wax'),
(69, 14, 'antique'),
(70, 14, 'brass-idols'),
(71, 14, 'metal-handicrafts-india'),
(72, 15, 'krishna'),
(73, 15, 'brass'),
(74, 15, 'figurine'),
(75, 15, 'brass-idols'),
(76, 15, 'custom-sculptures-india'),
(77, 16, 'pattachitra'),
(78, 16, 'odisha'),
(79, 16, 'diary'),
(80, 16, 'gift-set'),
(81, 16, 'handmade-paper'),
(82, 17, 'lakshmi'),
(83, 17, 'brass'),
(84, 17, 'wall-art'),
(85, 17, 'metal-handicrafts-india'),
(86, 17, 'brass-idols'),
(87, 18, 'peacock'),
(88, 18, 'metal'),
(89, 18, 'wall-art'),
(90, 18, 'aluminium'),
(91, 18, 'metal-handicrafts-india'),
(92, 19, 'gift-items'),
(93, 20, 'wall-hangings'),
(94, 21, 'custom'),
(95, 21, 'sculpture'),
(96, 21, 'personalized'),
(97, 21, 'brass'),
(98, 21, 'bronze'),
(99, 21, 'custom-sculptures-india'),
(100, 22, 'shiva'),
(101, 22, 'trishul'),
(102, 22, 'wall-art'),
(103, 22, 'brass'),
(104, 22, 'metal-handicrafts-india'),
(105, 23, 'diya'),
(106, 23, 'lamp'),
(107, 23, 'decor'),
(108, 23, 'bronze'),
(109, 23, 'metal-handicrafts-india'),
(110, 24, 'dhokra'),
(111, 24, 'brass'),
(112, 24, 'owl'),
(113, 24, 'tribal'),
(114, 24, 'lost-wax'),
(115, 24, 'brass-idols'),
(116, 24, 'metal-handicrafts-india'),
(117, 25, 'brass'),
(118, 25, 'wall-hanging'),
(119, 25, 'decor'),
(120, 25, 'metal-handicrafts-india'),
(121, 26, 'buddha'),
(122, 26, 'meditation'),
(123, 26, 'metal-art'),
(124, 26, 'bronze'),
(125, 26, 'spiritual'),
(126, 26, 'brass-idols'),
(127, 27, 'ikat'),
(128, 27, 'odisha'),
(129, 27, 'resist-dye'),
(130, 27, 'cushion'),
(131, 27, 'combo'),
(144, 28, 'gift-items'),
(146, 30, 'wall-hangings'),
(147, 31, 'wall-hangings'),
(148, 33, 'wall-hangings'),
(149, 34, 'wall-hangings');

-- --------------------------------------------------------

--
-- Table structure for table `site_config`
--

CREATE TABLE `site_config` (
  `id` int(11) NOT NULL,
  `promo_banner_text` varchar(500) NOT NULL DEFAULT 'Special Offer: Get FLAT 40% OFF!',
  `promo_banner_active` tinyint(1) NOT NULL DEFAULT 1,
  `email` varchar(255) NOT NULL DEFAULT 'info@balajihandicrafts.in',
  `phone` varchar(20) NOT NULL DEFAULT '9198492515',
  `whatsapp` varchar(20) NOT NULL DEFAULT '984925153',
  `address` varchar(500) NOT NULL DEFAULT 'Charminar, Hyderabad',
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT 199.00,
  `free_shipping_threshold` decimal(10,2) NOT NULL DEFAULT 1000.00,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site_config`
--

INSERT INTO `site_config` (`id`, `promo_banner_text`, `promo_banner_active`, `email`, `phone`, `whatsapp`, `address`, `shipping_fee`, `free_shipping_threshold`, `created_at`, `updated_at`) VALUES
(1, 'FLAT 50% offf', 1, 'info@balajihandicrafts.in', '+917799329591', '984925153', 'Charminar, Hyderabad', 2.00, 700.00, '2026-04-02 03:32:26.455', '2026-04-15 01:41:43.416');

-- --------------------------------------------------------

--
-- Table structure for table `site_content`
--

CREATE TABLE `site_content` (
  `id` int(11) NOT NULL,
  `about` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`about`)),
  `contact` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`contact`)),
  `footer` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`footer`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site_content`
--

INSERT INTO `site_content` (`id`, `about`, `contact`, `footer`, `created_at`, `updated_at`) VALUES
(1, '{\"hero\":{\"overline\":\"Our Story\",\"title\":\"Bridging Artisans & Hearts Since 2018\",\"description\":\"Balaji Handicrafts was born from a simple belief: India’s finest crafts deserve a global stage, and India’s artisans deserve a fair life.\"},\"mission\":{\"overline\":\"Our Mission\",\"title\":\"Profit With Purpose\",\"text1\":\"India is home to over 7 million artisans, yet most earn less than ₹5,000 a month. We exist to change that narrative.\",\"text2\":\"Our model ensures that 60% of every sale goes directly to the maker. The remaining portion funds logistics, platform operations, and critical artisan training programs.\",\"text3\":\"We have partnered with 12 government-recognized GI (Geographical Indication) crafts and are committed to never listing machine-made replicas on our platform.\",\"image\":\"/images/a1.webp\",\"stats\":[{\"number\":\"500+\",\"label\":\"Artisan Partners\"},{\"number\":\"24\",\"label\":\"Craft Traditions\"},{\"number\":\"60%\",\"label\":\"Artist Revenue Share\"}]},\"artisans\":{\"overline\":\"The Makers\",\"title\":\"Meet Our Artisans\",\"description\":\"Every hand that crafts our products has a story worth knowing\",\"list\":[{\"name\":\"Meera Devii\",\"craft\":\"Macramé & Textile Art\",\"location\":\"Jaipur, Rajasthan\",\"avatar\":\"/images/a2.webp\",\"story\":\"Meera has been knotting macramé since she was 12, learning the craft from her grandmother who sold her work at local haats.\",\"yearsActive\":22},{\"name\":\"Ramesh Vishwakarma\",\"craft\":\"Dhokra Metal Casting\",\"location\":\"Bastar, Chhattisgarh\",\"avatar\":\"/images/a3.webp\",\"story\":\"Ramesh is a 4th-generation Dhokra metal caster. His family is one of only 40 left practicing this 4,000-year-old Indus Valley tradition.\",\"yearsActive\":18},{\"name\":\"Kalpana Jha\",\"craft\":\"Madhubani Folk Art\",\"location\":\"Madhubani, Bihar\",\"avatar\":\"/images/a4.webp\",\"story\":\"Kalpana learned Madhubani painting at 8. Today she trains 35 women in her village, keeping this UNESCO-recognized art alive.\",\"yearsActive\":30}]},\"values\":{\"overline\":\"Our Principles\",\"title\":\"What We Stand For\",\"list\":[{\"title\":\"Fair Trade\",\"desc\":\"60% of all sales go directly to the artisan family — guaranteed.\",\"icon\":\"Handshake\"},{\"title\":\"Sustainability\",\"desc\":\"Natural dyes, recycled packaging, and sustainable material sourcing.\",\"icon\":\"Leaf\"},{\"title\":\"Authenticity\",\"desc\":\"Every product is handmade and verified. Zero machine replicas.\",\"icon\":\"ScrollText\"},{\"title\":\"Artisan Training\",\"desc\":\"We fund workshops that train the next generation of craftspeople.\",\"icon\":\"GraduationCap\"}]}}', '{\"title\":\"Contact Us\",\"overline\":\"Get in Touch\",\"description\":\"Have a question? We\'d love to hear from you.\",\"mapEmbed\":\"https://maps.google.com/?q=Sultan+Shahi+Charminar+Hyderabad\"}', '{\"brandDescription\":\"We connect India’s master artisans with a world that loves handmade. Every purchase supports a craft heritage spanning centuriess.\",\"copyright\":\"Balaji Handicrafts Artisan - Updated by Jetski Marketplace. All rights reserved.\",\"links\":[{\"title\":\"Company\",\"items\":[{\"label\":\"Our Story\",\"href\":\"/about\"},{\"label\":\"Meet Artisans\",\"href\":\"/about#artisans\"},{\"label\":\"Our Mission\",\"href\":\"/about#mission\"},{\"label\":\"Contact Us\",\"href\":\"/contact\"},{\"label\":\"Press & Media\",\"href\":\"#\"}]},{\"title\":\"Support\",\"items\":[{\"label\":\"Track Order\",\"href\":\"#\"},{\"label\":\"Returns & Refunds\",\"href\":\"#\"},{\"label\":\"Shipping Policy\",\"href\":\"#\"},{\"label\":\"Size Guide\",\"href\":\"#\"},{\"label\":\"Care Instructions\",\"href\":\"#\"}]}],\"socialLinks\":[{\"platform\":\"Instagram\",\"href\":\"#https://www.youtube.com/\"},{\"platform\":\"Facebook\",\"href\":\"#https://www.youtube.com/\"},{\"platform\":\"Pinterest\",\"href\":\"#https://www.youtube.com/\"},{\"platform\":\"Twitter\",\"href\":\"#https://www.youtube.com/\"}]}', '2026-04-14 18:04:35.509', '2026-04-15 01:41:43.408');

-- --------------------------------------------------------

--
-- Table structure for table `testimonials`
--

CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL,
  `custom_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `rating` int(11) NOT NULL DEFAULT 5,
  `text` text NOT NULL,
  `product` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `testimonials`
--

INSERT INTO `testimonials` (`id`, `custom_id`, `name`, `city`, `avatar`, `rating`, `text`, `product`, `created_at`, `updated_at`) VALUES
(17, '1775000798053', 'Suresh Patell', 'City', '/images/pexels-photo-31477845.webp', 5, 'Found exactly what I needed for my office desk. The Dhokra owl figurine is a conversation starter. Fast delivery and excellent craftsmanship.', 'Item Name', '2026-04-15 01:41:43.407', '2026-04-15 01:41:43.407'),
(18, '1775000781452', 'Anita Krishnan', 'City', '/images/a3.webp', 5, 'The Banarasi silk scarf came with a note from the weaver himself. These are not just products — they\'re stories of craft and culture. Truly heartwarming.', 'Item Name', '2026-04-15 01:41:43.411', '2026-04-15 01:41:43.411'),
(19, '1775000752552', 'Vikram Singh', 'City', '/images/pexels-photo-33619692.webp', 5, 'I\'ve bought from many handicraft stores, but Balaji Handicrafts\'s quality and packaging are unmatched. The Ganesha idol arrived perfectly wrapped and looks divine.', 'Item Name', '2026-04-15 01:41:43.425', '2026-04-15 01:41:43.425'),
(20, '1775000705268', 'Priya Sharma', 'City', '/images/pexels-photo-34470630.webp', 5, 'The Madhubani painting I ordered is absolutely stunning. You can feel the love and skill poured into every brushstroke. It transformed my living room completely.', 'Item Name', '2026-04-15 01:41:43.429', '2026-04-15 01:41:43.429');

-- --------------------------------------------------------

--
-- Table structure for table `wholesale_catalogs`
--

CREATE TABLE `wholesale_catalogs` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `access_token` varchar(50) NOT NULL,
  `expiry_date` datetime(3) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `locked_to_device` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wholesale_catalogs`
--

INSERT INTO `wholesale_catalogs` (`id`, `name`, `description`, `access_token`, `expiry_date`, `is_active`, `locked_to_device`, `created_at`, `updated_at`) VALUES
(1, 'asd', 'asd', '431123af', '2026-04-25 00:00:00.000', 1, 'b21ca4b6-1fae-48f6-af67-3aceff53b28e', '2026-04-12 01:32:08.472', '2026-04-12 03:21:31.717'),
(2, 'sadsadfasdf', 'dsafasdf', '08782cc7', '2026-04-22 00:00:00.000', 1, '10e4af2a-69bd-4499-95c8-7d3f1712afe6', '2026-04-12 01:52:04.141', '2026-04-12 03:21:31.191'),
(3, 'asd', 'asd', '87bc553e', '2026-04-22 00:00:00.000', 1, '10e4af2a-69bd-4499-95c8-7d3f1712afe6', '2026-04-12 02:04:01.108', '2026-04-12 03:22:13.447'),
(4, 'asd', 'asd', '662e4c93', '2026-04-30 00:00:00.000', 1, '10e4af2a-69bd-4499-95c8-7d3f1712afe6', '2026-04-12 02:16:33.255', '2026-04-12 03:22:20.616'),
(5, 'Diwali sale', 'asd', 'a8c0f1f9', '2026-04-30 00:00:00.000', 0, '10e4af2a-69bd-4499-95c8-7d3f1712afe6', '2026-04-12 07:45:52.716', '2026-04-12 07:47:22.726'),
(6, 'asd', 'asd', '2833e564', '2026-04-30 00:00:00.000', 0, '10e4af2a-69bd-4499-95c8-7d3f1712afe6', '2026-04-12 08:01:20.402', '2026-04-12 08:03:53.903'),
(7, 'asd', 'asd', 'b700e182', '2026-04-24 00:00:00.000', 0, '10e4af2a-69bd-4499-95c8-7d3f1712afe6', '2026-04-12 08:12:10.432', '2026-04-12 08:12:57.933'),
(8, 'asd', 'asd', '796c58cc', '2026-04-30 00:00:00.000', 0, '10e4af2a-69bd-4499-95c8-7d3f1712afe6', '2026-04-12 08:15:30.197', '2026-04-12 08:16:17.043'),
(9, 'asd', 'asd', '09a17475', '2026-04-24 00:00:00.000', 0, 'b21ca4b6-1fae-48f6-af67-3aceff53b28e', '2026-04-13 10:19:08.072', '2026-04-13 10:24:54.655'),
(10, 'd', 'asd', 'e27c34fc', '2026-04-29 00:00:00.000', 0, '9eadc155-af73-449e-8f25-1cf186b926cc', '2026-04-13 16:28:35.354', '2026-04-13 16:30:58.367'),
(11, 'Diwali', 'ssdfdf', 'e98fe673', '2026-04-17 00:00:00.000', 1, NULL, '2026-04-14 11:54:10.020', '2026-04-14 11:54:10.020'),
(12, 'asd', 'asd', 'eb27ae0a', '2026-05-01 00:00:00.000', 1, NULL, '2026-04-14 11:55:38.277', '2026-04-14 11:55:38.277'),
(13, 'asd', 'asd', '48a6196c', '2026-04-29 00:00:00.000', 1, NULL, '2026-04-14 12:20:21.286', '2026-04-14 12:20:21.286'),
(14, 'asd', 'asd', 'd1f7c96a', '2026-04-30 00:00:00.000', 1, 'b21ca4b6-1fae-48f6-af67-3aceff53b28e', '2026-04-14 12:26:32.137', '2026-04-14 12:26:40.846'),
(15, 'fg', 'gf', '35205dfd', '2026-04-15 00:00:00.000', 1, NULL, '2026-04-14 12:28:18.138', '2026-04-14 12:28:18.138'),
(16, 'asd', 'asd', '2f890abe', '2026-04-23 00:00:00.000', 1, NULL, '2026-04-14 12:28:58.148', '2026-04-14 12:28:58.148'),
(17, 'df', 'fdf', 'f42ddb63', '2026-04-15 00:00:00.000', 1, NULL, '2026-04-14 12:31:16.281', '2026-04-14 12:31:16.281'),
(18, 'asd', 'asd', 'd848ec2b', '2026-05-01 00:00:00.000', 1, NULL, '2026-04-15 01:13:43.540', '2026-04-15 01:13:43.540'),
(19, 'd', 'asd', '4e604c79', '2026-05-02 00:00:00.000', 0, '10e4af2a-69bd-4499-95c8-7d3f1712afe6', '2026-04-15 05:22:20.544', '2026-04-15 05:24:18.276');

-- --------------------------------------------------------

--
-- Table structure for table `wholesale_catalog_products`
--

CREATE TABLE `wholesale_catalog_products` (
  `id` int(11) NOT NULL,
  `catalog_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `wholesale_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wholesale_catalog_products`
--

INSERT INTO `wholesale_catalog_products` (`id`, `catalog_id`, `product_id`, `wholesale_price`) VALUES
(1, 1, 1, 12.00),
(2, 1, 2, 1.00),
(3, 2, 1, 12.00),
(4, 2, 2, 11.00),
(5, 3, 1, 12.00),
(6, 3, 2, 11.00),
(7, 4, 1, 12.00),
(8, 4, 2, 11.00),
(9, 5, 1, 10.00),
(10, 5, 2, 15.00),
(11, 5, 3, 18.00),
(12, 6, 1, 15.00),
(13, 6, 2, 11.00),
(14, 6, 3, 18.00),
(15, 7, 1, 123.00),
(16, 7, 2, 145.00),
(17, 8, 1, 10.00),
(18, 8, 2, 11.00),
(19, 9, 1, 10.00),
(20, 9, 2, 10.00),
(21, 11, 16, 10.00),
(22, 11, 1, 15.00),
(23, 12, 15, 15.00),
(25, 13, 15, 15.00),
(27, 14, 15, 10.00),
(29, 15, 15, 12.00),
(30, 16, 15, 10.00),
(32, 17, 15, 12.00),
(34, 17, 28, 3.00),
(35, 18, 33, 15.00),
(36, 18, 34, 10.00),
(37, 19, 33, 17.00),
(38, 19, 34, 10.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coupons_code_key` (`code`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customers_firebase_uid_key` (`firebase_uid`);

--
-- Indexes for table `customer_addresses`
--
ALTER TABLE `customer_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_addresses_customer_id_fkey` (`customer_id`);

--
-- Indexes for table `hero_slides`
--
ALTER TABLE `hero_slides`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_customer_id_idx` (`customer_id`),
  ADD KEY `orders_payment_order_id_idx` (`payment_order_id`),
  ADD KEY `orders_logistics_status_idx` (`logistics_status`),
  ADD KEY `orders_created_at_idx` (`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_fkey` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_key` (`slug`),
  ADD KEY `products_category_idx` (`category`),
  ADD KEY `products_featured_idx` (`featured`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_product_id_fkey` (`product_id`);

--
-- Indexes for table `product_tags`
--
ALTER TABLE `product_tags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_tags_product_id_fkey` (`product_id`);

--
-- Indexes for table `site_config`
--
ALTER TABLE `site_config`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `site_content`
--
ALTER TABLE `site_content`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wholesale_catalogs`
--
ALTER TABLE `wholesale_catalogs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wholesale_catalogs_access_token_key` (`access_token`);

--
-- Indexes for table `wholesale_catalog_products`
--
ALTER TABLE `wholesale_catalog_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wholesale_catalog_products_catalog_id_fkey` (`catalog_id`),
  ADD KEY `wholesale_catalog_products_product_id_fkey` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `customer_addresses`
--
ALTER TABLE `customer_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hero_slides`
--
ALTER TABLE `hero_slides`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=232;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `product_tags`
--
ALTER TABLE `product_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

--
-- AUTO_INCREMENT for table `site_config`
--
ALTER TABLE `site_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `site_content`
--
ALTER TABLE `site_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `wholesale_catalogs`
--
ALTER TABLE `wholesale_catalogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `wholesale_catalog_products`
--
ALTER TABLE `wholesale_catalog_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customer_addresses`
--
ALTER TABLE `customer_addresses`
  ADD CONSTRAINT `customer_addresses_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_tags`
--
ALTER TABLE `product_tags`
  ADD CONSTRAINT `product_tags_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `wholesale_catalog_products`
--
ALTER TABLE `wholesale_catalog_products`
  ADD CONSTRAINT `wholesale_catalog_products_catalog_id_fkey` FOREIGN KEY (`catalog_id`) REFERENCES `wholesale_catalogs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wholesale_catalog_products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
