-- CreateTable
CREATE TABLE "selling_price" (
    "id_selling_price" TEXT NOT NULL,
    "id_vehicle" TEXT NOT NULL,
    "selling_price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "selling_price_pkey" PRIMARY KEY ("id_selling_price")
);

-- AddForeignKey
ALTER TABLE "selling_price" ADD CONSTRAINT "selling_price_id_vehicle_fkey" FOREIGN KEY ("id_vehicle") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
