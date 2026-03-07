-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "Dimension" AS ENUM ('EI', 'SN', 'TF', 'JP');

-- CreateEnum
CREATE TYPE "Trait" AS ENUM ('E', 'I', 'S', 'N', 'T', 'F', 'J', 'P');

-- CreateEnum
CREATE TYPE "MbtiCode" AS ENUM ('ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "introText" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "status" "TestStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSetting" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "tieEI" "Trait" NOT NULL,
    "tieSN" "Trait" NOT NULL,
    "tieTF" "Trait" NOT NULL,
    "tieJP" "Trait" NOT NULL,
    "shareEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerScale" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "scoreWeight" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "AnswerScale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "dimension" "Dimension" NOT NULL,
    "positiveTrait" "Trait" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MbtiResult" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "mbtiCode" "MbtiCode" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "strengthsJson" JSONB NOT NULL,
    "cautionsJson" JSONB NOT NULL,
    "shareTitle" TEXT NOT NULL,
    "shareDescription" TEXT NOT NULL,
    "imageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MbtiResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestAttempt" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "answersJson" JSONB NOT NULL,
    "scoresJson" JSONB NOT NULL,
    "resultMbti" "MbtiCode" NOT NULL,
    "resultSnapshotJson" JSONB NOT NULL,
    "shareToken" TEXT NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Test_slug_key" ON "Test"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TestSetting_testId_key" ON "TestSetting"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerScale_testId_value_key" ON "AnswerScale"("testId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "MbtiResult_testId_mbtiCode_key" ON "MbtiResult"("testId", "mbtiCode");

-- CreateIndex
CREATE UNIQUE INDEX "TestAttempt_shareToken_key" ON "TestAttempt"("shareToken");

-- AddForeignKey
ALTER TABLE "TestSetting" ADD CONSTRAINT "TestSetting_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerScale" ADD CONSTRAINT "AnswerScale_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbtiResult" ADD CONSTRAINT "MbtiResult_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
