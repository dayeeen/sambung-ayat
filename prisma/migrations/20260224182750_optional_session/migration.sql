-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_sessionId_fkey";

-- AlterTable
ALTER TABLE "Answer" ALTER COLUMN "sessionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
