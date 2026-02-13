-- DropForeignKey
ALTER TABLE "Distance" DROP CONSTRAINT "Distance_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_distanceId_fkey";

-- AddForeignKey
ALTER TABLE "Distance" ADD CONSTRAINT "Distance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_distanceId_fkey" FOREIGN KEY ("distanceId") REFERENCES "Distance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
