/*
  Warnings:

  - You are about to drop the column `isAccountVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetOtp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetOtpExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verifyOtp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verifyOtpExpiresAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAccountVerified",
DROP COLUMN "password",
DROP COLUMN "resetOtp",
DROP COLUMN "resetOtpExpiresAt",
DROP COLUMN "verifyOtp",
DROP COLUMN "verifyOtpExpiresAt",
ADD COLUMN     "avatar" TEXT;
