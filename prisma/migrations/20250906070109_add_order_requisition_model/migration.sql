-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "order_requisition" (
    "id_order_requisition" TEXT NOT NULL,
    "id_customer" TEXT NOT NULL,
    "id_contractor" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "engine_number" TEXT NOT NULL,
    "description" TEXT,
    "assignment" TEXT,
    "total_labor_and_services_expenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_parts_and_material_expenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "generated_or_number" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_requisition_pkey" PRIMARY KEY ("id_order_requisition")
);

-- AddForeignKey
ALTER TABLE "order_requisition" ADD CONSTRAINT "order_requisition_id_customer_fkey" FOREIGN KEY ("id_customer") REFERENCES "customer"("id_customer") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_requisition" ADD CONSTRAINT "order_requisition_id_contractor_fkey" FOREIGN KEY ("id_contractor") REFERENCES "contractor"("id_contractor") ON DELETE CASCADE ON UPDATE CASCADE;
