-- AlterTable
ALTER TABLE `interpreterrequest` ADD COLUMN `interpreterId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `InterpreterRequest` ADD CONSTRAINT `InterpreterRequest_interpreterId_fkey` FOREIGN KEY (`interpreterId`) REFERENCES `Interpreter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
