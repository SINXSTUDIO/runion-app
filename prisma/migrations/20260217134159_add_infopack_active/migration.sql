-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "infopack" JSONB,
ADD COLUMN     "infopackActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellerEuroId" TEXT;

-- AlterTable
ALTER TABLE "GlobalSettings" ADD COLUMN     "featuredEventActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredEventButtonDE" TEXT,
ADD COLUMN     "featuredEventButtonEN" TEXT,
ADD COLUMN     "featuredEventButtonHU" TEXT,
ADD COLUMN     "featuredEventDescriptionDE" TEXT,
ADD COLUMN     "featuredEventDescriptionEN" TEXT,
ADD COLUMN     "featuredEventDescriptionHU" TEXT,
ADD COLUMN     "featuredEventId" TEXT,
ADD COLUMN     "featuredEventTitleDE" TEXT,
ADD COLUMN     "featuredEventTitleEN" TEXT,
ADD COLUMN     "featuredEventTitleHU" TEXT,
ADD COLUMN     "transferEmail" TEXT,
ADD COLUMN     "transferSellerId" TEXT;

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "nameEuro" TEXT;

-- CreateIndex
CREATE INDEX "Event_sellerEuroId_idx" ON "Event"("sellerEuroId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_sellerEuroId_fkey" FOREIGN KEY ("sellerEuroId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalSettings" ADD CONSTRAINT "GlobalSettings_featuredEventId_fkey" FOREIGN KEY ("featuredEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalSettings" ADD CONSTRAINT "GlobalSettings_transferSellerId_fkey" FOREIGN KEY ("transferSellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
