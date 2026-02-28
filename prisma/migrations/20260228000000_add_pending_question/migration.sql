-- CreateTable
CREATE TABLE "PendingQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "currentAyahId" INTEGER NOT NULL,
    "correctAyahId" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "PendingQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PendingQuestion" ADD CONSTRAINT "PendingQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
