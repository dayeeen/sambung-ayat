-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentCorrectStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "longestCorrectStreak" INTEGER NOT NULL DEFAULT 0;
