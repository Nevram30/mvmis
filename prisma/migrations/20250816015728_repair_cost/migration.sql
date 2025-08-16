-- CreateTable
CREATE TABLE "repair_cost" (
    "id_repair_cost" TEXT NOT NULL,
    "id_vehicle" TEXT NOT NULL,
    "fuel_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "labor_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "material_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "other_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "mobilization" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "licensing" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_other_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_cost_pkey" PRIMARY KEY ("id_repair_cost")
);

-- AddForeignKey
ALTER TABLE "repair_cost" ADD CONSTRAINT "repair_cost_id_vehicle_fkey" FOREIGN KEY ("id_vehicle") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
