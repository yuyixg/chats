/*
  Warnings:

  - Added the required column `type` to the `ModelKeys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ModelKeys" ADD COLUMN     "type" VARCHAR(50) NOT NULL;
