/*
  Warnings:

  - You are about to drop the column `status` on the `registration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "registration" DROP COLUMN "status",
ADD COLUMN     "deed_of_sale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "id_status" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mayor_permit" BOOLEAN NOT NULL DEFAULT false;
