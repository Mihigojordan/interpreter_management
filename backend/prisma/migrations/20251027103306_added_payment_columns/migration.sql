-- AlterTable
ALTER TABLE `interpreter` ADD COLUMN `amount` INTEGER NULL,
    ADD COLUMN `paymentStatus` ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `interpreterrequest` ADD COLUMN `amount` INTEGER NULL,
    ADD COLUMN `paymentStatus` ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING';
