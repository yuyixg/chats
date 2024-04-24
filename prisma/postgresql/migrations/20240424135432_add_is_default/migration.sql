/*
  Warnings:

  - You are about to drop the column `default` on the `ChatModels` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatModels" DROP COLUMN "default",
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;
