-- CreateTable
CREATE TABLE "work_order" (
    "id_work_order" TEXT NOT NULL,
    "id_order_requisition" TEXT NOT NULL,
    "id_contractor" TEXT NOT NULL,
    "id_labor_repair" TEXT NOT NULL,
    "customer_billing" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "expenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_pkey" PRIMARY KEY ("id_work_order")
);

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_id_order_requisition_fkey" FOREIGN KEY ("id_order_requisition") REFERENCES "order_requisition"("id_order_requisition") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_id_contractor_fkey" FOREIGN KEY ("id_contractor") REFERENCES "contractor"("id_contractor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_id_labor_repair_fkey" FOREIGN KEY ("id_labor_repair") REFERENCES "labor_repair_form"("id_labor_repair_form") ON DELETE CASCADE ON UPDATE CASCADE;
