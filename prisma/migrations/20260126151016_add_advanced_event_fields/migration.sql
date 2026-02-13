/*
  Warnings:

  - You are about to drop the column `bannerImageUrl` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizerId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Distance" ADD COLUMN     "description" TEXT,
ADD COLUMN     "nameDe" TEXT,
ADD COLUMN     "nameEn" TEXT;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "bannerImageUrl",
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "descriptionDe" TEXT,
ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "extraOrganizers" TEXT,
ADD COLUMN     "googleMapsUrl" TEXT,
ADD COLUMN     "organizerId" TEXT NOT NULL,
ADD COLUMN     "organizerName" TEXT,
ADD COLUMN     "showCountdown" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "titleDe" TEXT,
ADD COLUMN     "titleEn" TEXT,
ADD COLUMN     "websiteUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
