-- AlterTable
ALTER TABLE "GlobalSettings" ADD COLUMN     "cancellationEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transferBankAccountNumber" TEXT,
ADD COLUMN     "transferBankName" TEXT,
ADD COLUMN     "transferBeneficiary" TEXT,
ADD COLUMN     "transferInfoDe" TEXT,
ADD COLUMN     "transferInfoEn" TEXT,
ADD COLUMN     "transferInfoHu" TEXT,
ADD COLUMN     "transferNote" TEXT;
