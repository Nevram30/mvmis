-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('DEED_OF_SALE', 'ID', 'MAYOR_PERMIT');

-- CreateTable
CREATE TABLE "registration" (
    "id_registration" TEXT NOT NULL,
    "id_vehicle" TEXT NOT NULL,
    "sold_to" TEXT NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL,
    "status" "RegistrationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_pkey" PRIMARY KEY ("id_registration")
);

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_id_vehicle_fkey" FOREIGN KEY ("id_vehicle") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
