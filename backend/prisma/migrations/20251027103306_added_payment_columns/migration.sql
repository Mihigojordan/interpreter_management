-- AlterTable
ALTER TABLE `Interpreter` ADD COLUMN `amount` INTEGER NULL,
    ADD COLUMN `paymentStatus` ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `InterpreterRequest` ADD COLUMN `amount` INTEGER NULL,
    ADD COLUMN `paymentStatus` ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING';
