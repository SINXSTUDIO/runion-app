-- AlterTable
ALTER TABLE "Distance" ADD COLUMN     "crewPricing" JSONB;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "crewSize" INTEGER,
ADD COLUMN     "finalPrice" DECIMAL(10,2);
