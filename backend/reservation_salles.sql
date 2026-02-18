-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 18, 2026 at 09:23 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `reservation_salles`
--

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text,
  `debut` datetime NOT NULL,
  `fin` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `users_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `titre`, `description`, `debut`, `fin`, `created_at`, `users_id`) VALUES
(1, 'Réunion', '', '2026-02-13 07:00:00', '2026-02-13 11:00:00', '2026-02-12 15:33:53', 2),
(2, 'Réunion budget', '', '2026-02-13 11:00:00', '2026-02-13 13:00:00', '2026-02-13 08:19:55', 2),
(7, 'Réunion', '', '2026-02-13 13:00:00', '2026-02-13 15:00:00', '2026-02-13 12:47:56', 4),
(8, 'Réunion', '', '2026-02-16 09:00:00', '2026-02-16 12:00:00', '2026-02-16 08:33:56', 4),
(10, 'Réunion d\'équipe', '', '2026-02-16 13:00:00', '2026-02-16 16:00:00', '2026-02-16 08:36:22', 4),
(14, 'Réunion', '', '2026-02-17 10:00:00', '2026-02-17 12:00:00', '2026-02-17 08:35:24', 4),
(15, 'Réunion', '', '2026-02-18 12:00:00', '2026-02-18 14:00:00', '2026-02-17 09:43:11', 4),
(22, 'Réunion', '', '2026-02-17 14:00:00', '2026-02-17 16:00:00', '2026-02-17 12:36:48', 6),
(23, 'Réunion d\'équipe', '', '2026-02-18 16:00:00', '2026-02-18 17:00:00', '2026-02-17 12:37:19', 6);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` varchar(20) NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `created_at`, `role`) VALUES
(1, 'test@test.fr', '$2b$10$jCePa.BfojeyneuBm2kiQeF3SAzHigQUzjo9e8pDMON.OScfSfwLi', '2026-02-12 10:06:54', 'user'),
(2, 'test2@test.fr', '$2b$10$1L3YM3WRgi1jx3EDgtAeGuAQjjEQ.98MVE.Uz7pMyQyEwOFisnc6y', '2026-02-12 10:13:05', 'user'),
(3, 'test3@test.fr', '$2b$10$dyanmOzvtqg2QOS8VmpNhel6PwXnV2vUtrhGd.pbQVngpQvoLyTV.', '2026-02-13 08:20:23', 'user'),
(4, 'dark-vador@test.fr', '$2b$10$.CvHNtATCzK6Drk7zoIvkOi2vaIUe8NgXqznhm2yrzF93xiO/5.ki', '2026-02-13 08:21:26', 'user'),
(5, 'mercedes_feeney@gmail.com', '$2b$10$MCB5cTxBrnaK3CPyV/EkLusudiH8hQEHj0rcgTeT0lgaGoZkVh4Qe', '2026-02-13 13:37:23', 'user'),
(6, 'pauline-hiez@test.fr', '$2b$10$oHyOAJtfHkYKiuKKrzfRNuU9JG5twH0yjXIXAvgEbiNaR5MOkNWwO', '2026-02-17 12:24:38', 'user'),
(7, 'admin@admin.fr', '$2b$10$84c4uNet59xCS1jiyyVDeeunH5LSz8R7n88JnEkoY7zzjbmRmTCmK', '2026-02-18 09:23:01', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`,`users_id`),
  ADD KEY `fk_reservations_users_idx` (`users_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_UNIQUE` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `fk_reservations_users` FOREIGN KEY (`users_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
