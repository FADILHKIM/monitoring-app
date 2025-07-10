-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 10 Jul 2025 pada 22.57
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `monitoring_dc`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `logs`
--

CREATE TABLE `logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `activity` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'success',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `logs`
--

INSERT INTO `logs` (`id`, `user_id`, `activity`, `description`, `ip_address`, `user_agent`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'system_setup', 'Database berhasil diinisialisasi', '127.0.0.1', 'System', 'success', '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(2, 1, 'login', 'Administrator berhasil masuk ke sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(3, 2, 'login', 'Berhasil mendaftar dan masuk ke sistem untuk pertama kali', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 03:22:25', NULL),
(4, 2, 'logout', 'Keluar dari sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 03:24:54', NULL),
(5, 3, 'login', 'Berhasil mendaftar dan masuk ke sistem untuk pertama kali', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 03:25:14', NULL),
(6, 3, 'password_change', 'Password akun berhasil diperbarui', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 03:26:36', NULL),
(7, 2, 'login', 'Berhasil masuk ke sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 08:27:03', NULL),
(8, 2, 'logout', 'Keluar dari sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 08:39:09', NULL),
(9, 2, 'login', 'Berhasil masuk ke sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 08:39:16', NULL),
(10, 4, 'login', 'Berhasil mendaftar dan masuk ke sistem untuk pertama kali', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 08:40:21', NULL),
(11, 4, 'logout', 'Keluar dari sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 08:40:55', NULL),
(12, 4, 'login', 'Berhasil masuk ke sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 08:40:59', NULL),
(13, 4, 'logout', 'Keluar dari sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 08:44:10', NULL),
(14, 5, 'export_data', 'Export data sensor dalam format CSV mulai 2025-07-09', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 10:36:15', NULL),
(15, 5, 'logout', 'Keluar dari sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 10:36:53', NULL),
(16, 5, 'logout', 'Keluar dari sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 10:37:14', NULL),
(17, 5, 'logout', 'Keluar dari sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 10:39:50', NULL),
(18, 5, 'export_data', 'Export data sensor dalam format PDF mulai 2025-07-10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:14:20', NULL),
(19, 5, 'export_data', 'Export data sensor dalam format PDF mulai 2025-07-10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:14:49', NULL),
(20, 5, 'export_data', 'Export data sensor dalam format PDF mulai 2025-07-10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:14:55', NULL),
(21, 5, 'export_data', 'Export data sensor dalam format PDF mulai 2025-07-10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:15:26', NULL),
(22, 5, 'export_data', 'Export data sensor dalam format PDF mulai 2025-07-10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:16:27', NULL),
(23, 5, 'export_data', 'Export data sensor dalam format PDF periode 2025-07-10 - 2025-07-11', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:16:59', NULL),
(24, 5, 'export_data', 'Export data sensor dalam format PDF periode 2025-07-10 - 2025-07-11', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:17:12', NULL),
(25, 5, 'export_data', 'Export data sensor dalam format PDF periode 2025-07-10 - 2025-07-11', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:20:03', NULL),
(26, 5, 'export_data', 'Export data sensor dalam format PDF periode 2025-07-10 - 2025-07-11', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:20:37', NULL),
(27, 5, 'export_data', 'Export data sensor dalam format PDF', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:21:43', NULL),
(28, 5, 'export_data', 'Export data sensor dalam format PDF', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:22:02', NULL),
(29, 5, 'export_data', 'Export data sensor dalam format PDF mulai 2025-07-09', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:26:56', NULL),
(30, 5, 'export_data', 'Export data sensor dalam format PDF mulai 2025-07-09', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', 'success', '2025-07-10 12:28:32', NULL),
(31, 5, 'logout', 'Keluar dari sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:35:47', NULL),
(32, 5, 'login', 'Berhasil masuk ke sistem', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 12:36:28', NULL),
(33, 5, 'export_data', 'Export data sensor dalam format PDF periode 2025-07-07 - 2025-07-09', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'success', '2025-07-10 13:29:48', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2025_01_01_000001_create_users_table', 1),
(2, '2025_01_01_000002_create_user_preferences_table', 1),
(3, '2025_01_01_000003_create_sensor_data_table', 1),
(4, '2025_01_01_000004_create_logs_table', 1),
(5, '2025_01_01_000005_create_system_logs_table', 1),
(6, '2025_01_01_000006_create_permission_tables', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'view-dashboard', 'web', '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(2, 'view-logs', 'web', '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(3, 'export-data', 'web', '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(4, 'manage-users', 'web', '2025-07-10 10:21:37', '2025-07-10 10:21:37');

-- --------------------------------------------------------

--
-- Struktur dari tabel `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'web', '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(2, 'user', 'web', '2025-07-10 10:21:37', '2025-07-10 10:21:37');

-- --------------------------------------------------------

--
-- Struktur dari tabel `sensor_data`
--

CREATE TABLE `sensor_data` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `device_id` varchar(255) NOT NULL DEFAULT 'NANO_001',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `current_in` decimal(8,3) DEFAULT NULL,
  `current_out` decimal(8,3) DEFAULT NULL,
  `voltage_in` decimal(8,3) DEFAULT NULL,
  `voltage_out` decimal(8,3) DEFAULT NULL,
  `temperature` decimal(5,2) DEFAULT NULL,
  `battery_percentage` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sensor_data`
--

INSERT INTO `sensor_data` (`id`, `device_id`, `timestamp`, `current_in`, `current_out`, `voltage_in`, `voltage_out`, `temperature`, `battery_percentage`, `created_at`, `updated_at`) VALUES
(1, 'NANO_001', '2025-07-10 09:21:37', 2.450, 2.380, 23.200, 22.800, 28.50, 85.50, '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(2, 'NANO_001', '2025-07-10 08:21:37', 2.470, 2.390, 23.100, 22.900, 28.20, 84.75, '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(3, 'NANO_001', '2025-07-10 07:21:37', 2.440, 2.370, 23.300, 22.700, 28.80, 86.25, '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(4, 'NANO_001', '2025-07-10 06:21:37', 2.460, 2.400, 23.000, 22.800, 27.90, 87.00, '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(5, 'NANO_001', '2025-07-10 04:21:37', 2.430, 2.360, 23.400, 22.600, 29.10, 83.50, '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(6, 'NANO_001', '2025-07-09 22:21:37', 2.410, 2.340, 23.500, 22.500, 29.30, 82.25, '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(7, 'NANO_001', '2025-07-09 16:21:37', 2.390, 2.320, 23.600, 22.400, 29.50, 81.00, '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(8, 'NANO_001', '2025-07-09 10:21:37', 2.370, 2.300, 23.700, 22.300, 29.80, 79.75, '2025-07-10 10:21:37', '2025-07-10 10:21:37');

-- --------------------------------------------------------

--
-- Struktur dari tabel `system_logs`
--

CREATE TABLE `system_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `event_message` varchar(255) NOT NULL,
  `event_data` text DEFAULT NULL,
  `severity` enum('info','warning','error','success') NOT NULL DEFAULT 'info',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `system_logs`
--

INSERT INTO `system_logs` (`id`, `event_type`, `event_message`, `event_data`, `severity`, `created_at`, `updated_at`) VALUES
(1, 'system', 'Database berhasil diinisialisasi', NULL, 'success', '2025-07-10 10:21:37', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'admin@monitoring.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(3, 'ozi calyan', 'Cal17@gmail.com', '$2y$12$s6Y/Ra9NJ7UMz1NYz27adOcKbxFbW8PzrVUxF9WihCMXIcW1PibYC', 'user', 'active', '2025-07-10 03:25:14', '2025-07-10 03:26:36'),
(5, 'M Fadil Hakim', 'test@example.com', '$2y$12$UQHts6REU63tHIeeWs8LlusYwR/f7pyBvP9uCTH0OFbQ4bZkh8jG2', 'user', 'active', '2025-07-10 08:46:34', '2025-07-10 08:46:34');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `preferences` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `preferences`, `created_at`, `updated_at`) VALUES
(1, 1, '{\"language\":\"id\",\"theme\":\"light\",\"timezone\":\"Asia/Jakarta\"}', '2025-07-10 10:21:37', '2025-07-10 10:21:37'),
(2, 2, '{\"language\":[\"id\",\"id\",\"id\"],\"theme\":[\"system\",\"system\",\"system\"],\"units\":{\"temperature\":[\"celsius\",\"celsius\",\"celsius\"],\"dateFormat\":[\"DD\\/MM\\/YYYY\",\"DD\\/MM\\/YYYY\",\"DD\\/MM\\/YYYY\"],\"timeFormat\":[\"24h\",\"24h\",\"24h\"]},\"notifications\":{\"email\":[true,true,true],\"browser\":[true,true,true],\"sounds\":[true,true,true],\"dataAlerts\":[true,true,true]},\"dashboard\":{\"refreshInterval\":[30,30,30],\"defaultTimeRange\":[\"1h\",\"1h\",\"1h\"],\"showGrid\":[true,true,true],\"compactView\":[false,false,false]},\"accessibility\":{\"highContrast\":[false,false,false],\"largeText\":[false,false,true,false,true,false,true,true],\"animations\":[true,true,false,true,true]}}', '2025-07-10 08:37:30', '2025-07-10 08:37:48'),
(3, 5, '{\"language\":[\"id\",\"en\",\"en\",\"id\",\"id\"],\"theme\":[\"system\",\"system\",\"dark\"],\"units\":{\"temperature\":[\"celsius\",\"celsius\",\"celsius\"],\"dateFormat\":[\"DD\\/MM\\/YYYY\",\"DD\\/MM\\/YYYY\",\"YYYY-MM-DD\"],\"timeFormat\":[\"24h\",\"24h\",\"24h\"]},\"notifications\":{\"email\":[true,true,true],\"browser\":[true,true,true],\"sounds\":[true,true,false],\"dataAlerts\":[true,true,true]},\"dashboard\":{\"refreshInterval\":[30,30,60],\"defaultTimeRange\":[\"1h\",\"1h\",\"10m\"],\"showGrid\":[true,true,true],\"compactView\":[false,false,false]},\"accessibility\":{\"highContrast\":[false,false,false],\"largeText\":[false,false,true],\"animations\":[true,true,true]}}', '2025-07-10 10:35:14', '2025-07-10 12:42:00');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `logs_user_id_index` (`user_id`),
  ADD KEY `logs_created_at_index` (`created_at`);

--
-- Indeks untuk tabel `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indeks untuk tabel `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indeks untuk tabel `sensor_data`
--
ALTER TABLE `sensor_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sensor_data_timestamp_index` (`timestamp`),
  ADD KEY `sensor_data_device_timestamp_index` (`device_id`,`timestamp`);

--
-- Indeks untuk tabel `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `system_logs_event_type_index` (`event_type`),
  ADD KEY `system_logs_created_at_index` (`created_at`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indeks untuk tabel `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `user_preferences_user_id_index` (`user_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `logs`
--
ALTER TABLE `logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT untuk tabel `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `sensor_data`
--
ALTER TABLE `sensor_data`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
