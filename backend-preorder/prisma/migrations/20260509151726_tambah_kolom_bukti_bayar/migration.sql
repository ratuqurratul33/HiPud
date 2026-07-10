/*
  Warnings:

  - You are about to drop the column dpAmount on the Order table. All the data in the column will be lost.
  - You are about to alter the column totalAmount on the Order table. The data in that column could be lost. The data in that column will be cast from Int to Double.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "dpAmount",
    ADD COLUMN "proofImage" TEXT,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN "totalAmount" TYPE DOUBLE PRECISION USING "totalAmount"::DOUBLE PRECISION,
    ALTER COLUMN "status" SET DEFAULT 'PENDING';
