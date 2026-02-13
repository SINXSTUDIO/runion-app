-- CreateEnum
CREATE TYPE "ChangeRequestType" AS ENUM ('TRANSFER', 'CANCELLATION', 'MODIFICATION');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "paymentReminderEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "GlobalSettings" ADD COLUMN     "feature1Desc" TEXT,
ADD COLUMN     "feature1DescDe" TEXT,
ADD COLUMN     "feature1DescEn" TEXT,
ADD COLUMN     "feature1Icon" TEXT,
ADD COLUMN     "feature1Title" TEXT,
ADD COLUMN     "feature1TitleDe" TEXT,
ADD COLUMN     "feature1TitleEn" TEXT,
ADD COLUMN     "feature2Desc" TEXT,
ADD COLUMN     "feature2DescDe" TEXT,
ADD COLUMN     "feature2DescEn" TEXT,
ADD COLUMN     "feature2Icon" TEXT,
ADD COLUMN     "feature2Title" TEXT,
ADD COLUMN     "feature2TitleDe" TEXT,
ADD COLUMN     "feature2TitleEn" TEXT,
ADD COLUMN     "feature3Desc" TEXT,
ADD COLUMN     "feature3DescDe" TEXT,
ADD COLUMN     "feature3DescEn" TEXT,
ADD COLUMN     "feature3Icon" TEXT,
ADD COLUMN     "feature3Title" TEXT,
ADD COLUMN     "feature3TitleDe" TEXT,
ADD COLUMN     "feature3TitleEn" TEXT,
ADD COLUMN     "membershipNotificationEmail" TEXT,
ADD COLUMN     "membershipSellerId" TEXT,
ADD COLUMN     "shopAddress" TEXT,
ADD COLUMN     "shopBankAccountNumber" TEXT,
ADD COLUMN     "shopBankName" TEXT,
ADD COLUMN     "shopBeneficiaryName" TEXT,
ADD COLUMN     "shopEmail" TEXT,
ADD COLUMN     "shopFreeShippingThreshold" INTEGER DEFAULT 20000,
ADD COLUMN     "shopLogoUrl" TEXT,
ADD COLUMN     "shopNote" TEXT,
ADD COLUMN     "shopShippingCost" INTEGER DEFAULT 0,
ADD COLUMN     "shopTaxNumber" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "termsAccepted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "stockBreakdown" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "billingCity" TEXT,
ADD COLUMN     "billingName" TEXT,
ADD COLUMN     "billingZipCode" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "fiveTrialsId" TEXT,
ADD COLUMN     "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "membershipEnd" TIMESTAMP(3),
ADD COLUMN     "membershipExpiresAt" TIMESTAMP(3),
ADD COLUMN     "membershipStart" TIMESTAMP(3),
ADD COLUMN     "membershipTierId" TEXT,
ADD COLUMN     "taxNumber" TEXT,
ADD COLUMN     "teamMembers" TEXT[],
ADD COLUMN     "teamName" TEXT;

-- CreateTable
CREATE TABLE "MembershipTier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameDe" TEXT,
    "discountPercentage" DECIMAL(5,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "descriptionEn" TEXT,
    "descriptionDe" TEXT,
    "features" TEXT,
    "featuresEn" TEXT,
    "featuresDe" TEXT,
    "durationMonths" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeRequest" (
    "id" TEXT NOT NULL,
    "type" "ChangeRequestType" NOT NULL,
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "fromEvent" TEXT NOT NULL,
    "toEvent" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MembershipTier_name_key" ON "MembershipTier"("name");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_membershipTierId_fkey" FOREIGN KEY ("membershipTierId") REFERENCES "MembershipTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalSettings" ADD CONSTRAINT "GlobalSettings_membershipSellerId_fkey" FOREIGN KEY ("membershipSellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
