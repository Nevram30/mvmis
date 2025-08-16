/*
  Warnings:

  - You are about to drop the `constructor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "constructor";

-- CreateTable
CREATE TABLE "contractor" (
    "id_contractor" TEXT NOT NULL,
    "contractor_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "tel_no" TEXT,
    "mobile_no" TEXT,
    "tin" TEXT,
    "assignment" "AssignmentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_pkey" PRIMARY KEY ("id_contractor")
);
