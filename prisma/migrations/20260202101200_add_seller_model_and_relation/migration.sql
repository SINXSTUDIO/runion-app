/*
  Warnings:

  - You are about to drop the column `bankAccountNumber` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `beneficiaryName` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "bankAccountNumber",
DROP COLUMN "bankName",
DROP COLUMN "beneficiaryName",
ADD COLUMN     "sellerId" TEXT;

-- DropTable
DROP TABLE "Company";

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "key" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "taxNumber" TEXT,
    "regNumber" TEXT,
    "representative" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "iban" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_key_key" ON "Seller"("key");

-- CreateIndex
CREATE INDEX "Event_sellerId_idx" ON "Event"("sellerId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
