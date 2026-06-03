-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAccountVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetOtp" TEXT,
ADD COLUMN     "resetOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verifyOtp" TEXT,
ADD COLUMN     "verifyOtpExpiresAt" TIMESTAMP(3);
