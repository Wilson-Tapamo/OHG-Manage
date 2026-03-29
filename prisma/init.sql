-- Optimum Juridis Finance Database Schema
-- Run this in your MariaDB client

USE optimum_juridis;

-- User table
CREATE TABLE IF NOT EXISTS `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('DIRECTOR', 'CONSULTANT') NOT NULL DEFAULT 'CONSULTANT',
    `avatar` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `User_email_key`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Project table
CREATE TABLE IF NOT EXISTS `Project` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD') NOT NULL DEFAULT 'PENDING',
    `clientName` VARCHAR(191) NULL,
    `budget` DECIMAL(10, 2) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `managerId` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `Project_managerId_idx`(`managerId`),
    FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Task table
CREATE TABLE IF NOT EXISTS `Task` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED') NOT NULL DEFAULT 'TODO',
    `priority` INT NOT NULL DEFAULT 1,
    `dueDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `assigneeId` VARCHAR(191) NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `Task_projectId_idx`(`projectId`),
    INDEX `Task_assigneeId_idx`(`assigneeId`),
    INDEX `Task_creatorId_idx`(`creatorId`),
    FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`assigneeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Invoice table
CREATE TABLE IF NOT EXISTS `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `tax` DECIMAL(10, 2) NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `dueDate` DATETIME(3) NULL,
    `paidDate` DATETIME(3) NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `Invoice_number_key`(`number`),
    INDEX `Invoice_projectId_idx`(`projectId`),
    INDEX `Invoice_userId_idx`(`userId`),
    FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Payment table
CREATE TABLE IF NOT EXISTS `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `method` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `Payment_invoiceId_idx`(`invoiceId`),
    INDEX `Payment_userId_idx`(`userId`),
    FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert test users (password is 'password123' hashed with bcrypt)
INSERT INTO `User` (`id`, `email`, `name`, `password`, `role`, `phone`, `createdAt`, `updatedAt`) VALUES
('director-001', 'director@test.com', 'Jean Dupont', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqGntZ9T3Ao1s.EfP0HDbQ1TUWYphHq', 'DIRECTOR', '+33 6 12 34 56 78', NOW(), NOW()),
('consultant-001', 'consultant@test.com', 'Marie Martin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqGntZ9T3Ao1s.EfP0HDbQ1TUWYphHq', 'CONSULTANT', '+33 6 98 76 54 32', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

SELECT 'Database schema created successfully!' as result;
