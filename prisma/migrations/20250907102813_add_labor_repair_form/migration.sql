/*
  Warnings:

  - You are about to drop the column `remarks` on the `order_labor_item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_labor_item" DROP COLUMN "remarks";

-- CreateTable
CREATE TABLE "labor_repair_form" (
    "id_labor_repair_form" TEXT NOT NULL,
    "lrf_number" TEXT NOT NULL,
    "id_order_labor_item" TEXT NOT NULL,
    "contractor_name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "make" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "engine_number" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "or_number" TEXT,
    "scope_of_work_details" TEXT,
    "total_cash_advance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "reviewed_by" TIMESTAMP(3),
    "approved_by" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labor_repair_form_pkey" PRIMARY KEY ("id_labor_repair_form")
);

-- CreateTable
CREATE TABLE "labor_repair_form_cash_advance" (
    "id_cash_advance" TEXT NOT NULL,
    "id_labor_repair_form" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labor_repair_form_cash_advance_pkey" PRIMARY KEY ("id_cash_advance")
);

-- CreateIndex
CREATE UNIQUE INDEX "labor_repair_form_lrf_number_key" ON "labor_repair_form"("lrf_number");

-- AddForeignKey
ALTER TABLE "labor_repair_form" ADD CONSTRAINT "labor_repair_form_id_order_labor_item_fkey" FOREIGN KEY ("id_order_labor_item") REFERENCES "order_labor_item"("id_labor_item") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labor_repair_form_cash_advance" ADD CONSTRAINT "labor_repair_form_cash_advance_id_labor_repair_form_fkey" FOREIGN KEY ("id_labor_repair_form") REFERENCES "labor_repair_form"("id_labor_repair_form") ON DELETE CASCADE ON UPDATE CASCADE;
