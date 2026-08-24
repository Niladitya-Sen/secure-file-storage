/*
  Warnings:

  - Made the column `expiresAt` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "expiresAt" SET NOT NULL;
