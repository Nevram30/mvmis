/*
  Warnings:

  - You are about to drop the column `assignment` on the `order_requisition` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `order_requisition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_requisition" DROP COLUMN "assignment",
DROP COLUMN "description",
ADD COLUMN     "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "overall_total" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "order_labor_item" (
    "id_labor_item" TEXT NOT NULL,
    "id_order_requisition" TEXT NOT NULL,
    "item_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "expenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "mechanic" TEXT,
    "assignment" TEXT,
    "remarks" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_labor_item_pkey" PRIMARY KEY ("id_labor_item")
);

-- CreateTable
CREATE TABLE "order_material_item" (
    "id_material_item" TEXT NOT NULL,
    "id_order_requisition" TEXT NOT NULL,
    "item_number" INTEGER NOT NULL,
    "quantity" INTEGER DEFAULT 1,
    "description" TEXT NOT NULL,
    "expenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_material_item_pkey" PRIMARY KEY ("id_material_item")
);

-- AddForeignKey
ALTER TABLE "order_labor_item" ADD CONSTRAINT "order_labor_item_id_order_requisition_fkey" FOREIGN KEY ("id_order_requisition") REFERENCES "order_requisition"("id_order_requisition") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_material_item" ADD CONSTRAINT "order_material_item_id_order_requisition_fkey" FOREIGN KEY ("id_order_requisition") REFERENCES "order_requisition"("id_order_requisition") ON DELETE CASCADE ON UPDATE CASCADE;
