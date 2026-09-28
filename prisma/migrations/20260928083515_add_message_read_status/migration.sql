-- AlterTable
ALTER TABLE `Message` ADD COLUMN `readAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Message_conversationId_readAt_idx` ON `Message`(`conversationId`, `readAt`);
