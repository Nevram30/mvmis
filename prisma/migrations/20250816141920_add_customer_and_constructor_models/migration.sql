-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('OUTSIDE_LABOR', 'INHOUSE');

-- CreateTable
CREATE TABLE "customer" (
    "id_customer" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "tel_no" TEXT,
    "mobile_no" TEXT,
    "tin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id_customer")
);

-- CreateTable
CREATE TABLE "constructor" (
    "id_constructor" TEXT NOT NULL,
    "constructor_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "tel_no" TEXT,
    "mobile_no" TEXT,
    "tin" TEXT,
    "assignment" "AssignmentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constructor_pkey" PRIMARY KEY ("id_constructor")
);
