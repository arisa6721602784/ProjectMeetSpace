-- ===================================================
-- MeetSpace - Meeting Room Booking Schema
-- ===================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4; -- ทำให้ฐานข้อมูลรองรับภาษาไทยและEmoji

-- ===================================================
-- 1. ตาราง users (ข้อมูลผู้ใช้งาน)
-- ===================================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `firstname` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `lastname` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `email` varchar(255) CHARACTER SET utf8mb4 NOT NULL UNIQUE,
    `password` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `role` enum('user', 'admin') DEFAULT 'user',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================
-- 2. ตาราง rooms (ข้อมูลห้องประชุม)
-- ===================================================
CREATE TABLE `rooms` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `description` text CHARACTER SET utf8mb4,
    `capacity` int(11) NOT NULL,
    `image_url` varchar(255) CHARACTER SET utf8mb4,
    `status` enum('available', 'occupied', 'maintenance') DEFAULT 'available',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================
-- 3. ตาราง bookings (ข้อมูลการจองห้องประชุม)
-- ===================================================
CREATE TABLE `bookings` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `start_time` datetime NOT NULL,
    `end_time` datetime NOT NULL,
    `status` enum('confirmed', 'pending', 'cancelled') DEFAULT 'confirmed',
    `user_id` int(11) NOT NULL,
    `room_id` int(11) NOT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================
-- ข้อมูลตัวอย่าง
-- ===================================================
INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Admin', 'MeetSpace', 'admin@meet.com', '123456', 'admin', '2026-03-18 07:27:22'),
(2, 'สมใจ', 'ทดสอบ', 'test@gmail.com', '121212', 'user', '2026-03-18 07:46:09');

INSERT INTO `rooms` (`id`, `name`, `description`, `capacity`, `image_url`, `status`, `created_at`) VALUES
(1, 'Luna Conference Room', 'องประชุมขนาดเล็กบรรยากาศอบอุ่น โต๊ะประชุมทรงกลม เหมาะสำหรับการประชุมทีมย่อย การสัมภาษณ์ หรือการพูดคุยแบบ 1-on-1', 4, '/uploads/room-1773827033078.jpg', 'available', '2026-03-18 09:43:53'),
(2, 'Nova Meeting Suite', 'ห้องประชุมสไตล์โมเดิร์น โปร่งสว่างด้วยผนังกระจก เหมาะสำหรับการประชุมทีมขนาดกลางหรือการพรีเซนต์งาน', 8, '/uploads/room-1773827174814.webp', 'available', '2026-03-18 09:46:14'),
(3, 'Orion Executive Room', 'ห้องประชุมโทนเข้มระดับผู้บริหาร บรรยากาศเป็นส่วนตัว เหมาะสำหรับการประชุมสำคัญหรือการเจรจาธุรกิจ', 10, '/uploads/room-1773827216708.avif', 'occupied', '2026-03-18 09:46:56'),
(4, 'Stellar Strategy Room', 'ห้องประชุมสำหรับวางแผนงานและประชุมเชิงกลยุทธ์ มาพร้อมอุปกรณ์สำหรับการนำเสนอและระดมความคิด', 10, '/uploads/room-1773827249915.jpg', 'available', '2026-03-18 09:47:29'),
(5, 'Orbit Co-Working Space', ' พื้นที่ทำงานร่วมกันแบบเปิด บรรยากาศสบาย มีโต๊ะทำงานหลากหลาย เหมาะสำหรับทำงานทั่วไปหรือประชุมไม่เป็นทางการ', 25, '/uploads/room-1773827302980.jpg', 'maintenance', '2026-03-18 09:48:23'),
(6, 'Horizon Creative Space', 'พื้นที่เปิดสำหรับงานครีเอทีฟและการระดมไอเดีย มีไวท์บอร์ดและพื้นที่ยืดหยุ่น เหมาะสำหรับ brainstorming และ workshop', 30, '/uploads/room-1773827327672.jpg', 'available', '2026-03-18 09:48:47'),
(7, 'Cosmos Collaboration Space', 'พื้นที่ทำงานร่วมกันแบบเปิด เหมาะสำหรับการระดมสมอง เวิร์กช็อป หรือการทำงานเป็นทีม', 50, '/uploads/room-1773827359954.jpg', 'available', '2026-03-18 09:49:19'),
(8, 'Aurora Meeting Hall', 'ห้องประชุมสัมมนาขนาดใหญ่ พร้อมเวทีและที่นั่งแบบ Theater เหมาะสำหรับงานสัมมนาหรือการประชุมองค์กร', 100, '/uploads/room-1773827391734.webp', 'occupied', '2026-03-18 09:49:51'),
(9, 'Nebula Grand Hall', 'ห้องประชุมขนาดใหญ่ดีไซน์ทันสมัย มีเวทีและที่นั่งจำนวนมาก เหมาะสำหรับสัมมนา อีเวนต์ หรือการประชุมองค์กร', 200, '/uploads/room-1773827419456.jpg', 'maintenance', '2026-03-18 09:50:19');

INSERT INTO `bookings` (`id`, `start_time`, `end_time`, `status`, `user_id`, `room_id`, `created_at`) VALUES
(1, '2026-03-19 10:00:00', '2026-03-21 22:00:00', 'confirmed', 2, 6, '2026-03-19 03:00:35'),
(2, '2026-03-19 11:00:00', '2026-03-20 23:00:00', 'cancelled', 2, 4, '2026-03-19 03:01:25');

COMMIT;
