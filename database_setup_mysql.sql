-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `clubName` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `tshirtSize` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN', 'STAFF') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `emergencyContactName` VARCHAR(191) NULL,
    `emergencyContactPhone` VARCHAR(191) NULL,
    `isVegetarian` BOOLEAN NOT NULL DEFAULT false,
    `fiveTrialsId` VARCHAR(191) NULL,
    `teamName` VARCHAR(191) NULL,
    `teamMembers` JSON NULL,
    `billingName` VARCHAR(191) NULL,
    `taxNumber` VARCHAR(191) NULL,
    `billingZipCode` VARCHAR(191) NULL,
    `billingCity` VARCHAR(191) NULL,
    `billingAddress` VARCHAR(191) NULL,
    `membershipTierId` VARCHAR(191) NULL,
    `membershipExpiresAt` DATETIME(3) NULL,
    `membershipStart` DATETIME(3) NULL,
    `membershipEnd` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `tokenVersion` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_createdAt_idx`(`createdAt`),
    INDEX `User_updatedAt_idx`(`updatedAt`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_deletedAt_idx`(`deletedAt`),
    INDEX `User_membershipTierId_idx`(`membershipTierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MembershipTier` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NULL,
    `nameDe` VARCHAR(191) NULL,
    `discountPercentage` DECIMAL(5, 2) NOT NULL,
    `discountAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `description` VARCHAR(191) NULL,
    `descriptionEn` VARCHAR(191) NULL,
    `descriptionDe` VARCHAR(191) NULL,
    `features` VARCHAR(191) NULL,
    `featuresEn` VARCHAR(191) NULL,
    `featuresDe` VARCHAR(191) NULL,
    `durationMonths` INTEGER NOT NULL DEFAULT 12,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MembershipTier_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `eventDate` DATETIME(3) NOT NULL,
    `regDeadline` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `descriptionDe` TEXT NULL,
    `descriptionEn` TEXT NULL,
    `endDate` DATETIME(3) NULL,
    `extraOrganizers` VARCHAR(191) NULL,
    `googleMapsUrl` VARCHAR(191) NULL,
    `organizerId` VARCHAR(191) NOT NULL,
    `organizerName` VARCHAR(191) NULL,
    `showCountdown` BOOLEAN NOT NULL DEFAULT true,
    `slug` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `titleDe` VARCHAR(191) NULL,
    `titleEn` VARCHAR(191) NULL,
    `websiteUrl` VARCHAR(191) NULL,
    `ogDescription` VARCHAR(191) NULL,
    `ogImage` VARCHAR(191) NULL,
    `extraLocations` JSON NULL,
    `extraOrganizersJson` JSON NULL,
    `extras` JSON NULL,
    `formConfig` JSON NULL,
    `notificationEmail` VARCHAR(191) NULL,
    `sellerId` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `confirmationEmailText` TEXT NULL,
    `paymentReminderEnabled` BOOLEAN NOT NULL DEFAULT true,
    `infopack` JSON NULL,

    UNIQUE INDEX `Event_slug_key`(`slug`),
    INDEX `Event_organizerId_idx`(`organizerId`),
    INDEX `Event_sellerId_idx`(`sellerId`),
    INDEX `Event_status_idx`(`status`),
    INDEX `Event_eventDate_idx`(`eventDate`),
    INDEX `Event_slug_idx`(`slug`),
    INDEX `Event_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Seller` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `taxNumber` VARCHAR(191) NULL,
    `regNumber` VARCHAR(191) NULL,
    `representative` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `bankAccountNumber` VARCHAR(191) NULL,
    `iban` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `bankAccountNumberEuro` VARCHAR(191) NULL,
    `ibanEuro` VARCHAR(191) NULL,

    UNIQUE INDEX `Seller_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Distance` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `capacityLimit` INTEGER NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `nameDe` VARCHAR(191) NULL,
    `nameEn` VARCHAR(191) NULL,
    `priceEur` DECIMAL(10, 2) NULL,
    `crewPricing` JSON NULL,

    INDEX `Distance_eventId_idx`(`eventId`),
    INDEX `Distance_startTime_idx`(`startTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceTier` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `priceEur` DECIMAL(10, 2) NULL,
    `validFrom` DATETIME(3) NOT NULL,
    `validTo` DATETIME(3) NOT NULL,
    `distanceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PriceTier_distanceId_idx`(`distanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Registration` (
    `id` VARCHAR(191) NOT NULL,
    `bibNumber` VARCHAR(191) NULL,
    `bibSent` BOOLEAN NOT NULL DEFAULT false,
    `paymentId` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `distanceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `barionPaymentId` VARCHAR(191) NULL,
    `barionPaymentState` VARCHAR(191) NULL,
    `invoiceGeneratedAt` DATETIME(3) NULL,
    `invoiceNumber` VARCHAR(191) NULL,
    `invoiceUrl` VARCHAR(191) NULL,
    `paymentMethod` ENUM('CARD', 'BANK_TRANSFER', 'CASH') NOT NULL DEFAULT 'CARD',
    `paymentStatus` ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
    `proformaGeneratedAt` DATETIME(3) NULL,
    `proformaNumber` VARCHAR(191) NULL,
    `proformaUrl` VARCHAR(191) NULL,
    `receiptGeneratedAt` DATETIME(3) NULL,
    `receiptNumber` VARCHAR(191) NULL,
    `receiptUrl` VARCHAR(191) NULL,
    `registrationStatus` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `extras` JSON NULL,
    `formData` JSON NULL,
    `crewSize` INTEGER NULL,
    `finalPrice` DECIMAL(10, 2) NULL,

    UNIQUE INDEX `Registration_barionPaymentId_key`(`barionPaymentId`),
    UNIQUE INDEX `Registration_invoiceNumber_key`(`invoiceNumber`),
    UNIQUE INDEX `Registration_proformaNumber_key`(`proformaNumber`),
    UNIQUE INDEX `Registration_receiptNumber_key`(`receiptNumber`),
    INDEX `Registration_userId_idx`(`userId`),
    INDEX `Registration_distanceId_idx`(`distanceId`),
    INDEX `Registration_barionPaymentId_idx`(`barionPaymentId`),
    INDEX `Registration_registrationStatus_idx`(`registrationStatus`),
    INDEX `Registration_paymentStatus_idx`(`paymentStatus`),
    INDEX `Registration_createdAt_idx`(`createdAt`),
    INDEX `Registration_paymentMethod_idx`(`paymentMethod`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `category` ENUM('MERCHANDISE', 'EQUIPMENT', 'SERVICE') NOT NULL DEFAULT 'MERCHANDISE',
    `imageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `descriptionDe` VARCHAR(191) NULL,
    `descriptionEn` VARCHAR(191) NULL,
    `nameDe` VARCHAR(191) NULL,
    `nameEn` VARCHAR(191) NULL,
    `sizes` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NULL,
    `stockBreakdown` JSON NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    INDEX `Product_active_idx`(`active`),
    INDEX `Product_category_idx`(`category`),
    INDEX `Product_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `paymentMethod` ENUM('CARD', 'BANK_TRANSFER', 'CASH') NOT NULL DEFAULT 'BANK_TRANSFER',
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `billingName` VARCHAR(191) NOT NULL,
    `billingZip` VARCHAR(191) NOT NULL,
    `billingCity` VARCHAR(191) NOT NULL,
    `billingAddress` VARCHAR(191) NOT NULL,
    `billingTaxNumber` VARCHAR(191) NULL,
    `shippingName` VARCHAR(191) NOT NULL,
    `shippingZip` VARCHAR(191) NOT NULL,
    `shippingCity` VARCHAR(191) NOT NULL,
    `shippingAddress` VARCHAR(191) NOT NULL,
    `shippingPhone` VARCHAR(191) NOT NULL,
    `shippingEmail` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `termsAccepted` BOOLEAN NOT NULL DEFAULT false,
    `privacyAccepted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    INDEX `Order_userId_idx`(`userId`),
    INDEX `Order_status_idx`(`status`),
    INDEX `Order_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `size` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstantTrack` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `gpxFileUrl` VARCHAR(191) NOT NULL,
    `rewardMedalImage` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` VARCHAR(191) NULL,
    `access_token` VARCHAR(191) NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` VARCHAR(191) NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Partner` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomepageFeature` (
    `id` VARCHAR(191) NOT NULL,
    `iconName` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `titleEn` VARCHAR(191) NULL,
    `titleDe` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `descriptionEn` VARCHAR(191) NULL,
    `descriptionDe` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GalleryImage` (
    `id` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sponsor` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutPage` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `titleEn` VARCHAR(191) NULL,
    `titleDe` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `descriptionEn` TEXT NULL,
    `descriptionDe` TEXT NULL,
    `founderName` VARCHAR(191) NOT NULL,
    `founderRole` VARCHAR(191) NOT NULL,
    `founderRoleEn` VARCHAR(191) NULL,
    `founderRoleDe` VARCHAR(191) NULL,
    `image1Url` VARCHAR(191) NULL,
    `image2Url` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FAQ` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `questionEn` VARCHAR(191) NULL,
    `questionDe` VARCHAR(191) NULL,
    `answer` TEXT NOT NULL,
    `answerEn` TEXT NULL,
    `answerDe` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalSettings` (
    `id` VARCHAR(191) NOT NULL,
    `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,
    `shopEnabled` BOOLEAN NOT NULL DEFAULT true,
    `shopEmail` VARCHAR(191) NULL,
    `shopBeneficiaryName` VARCHAR(191) NULL,
    `shopBankName` VARCHAR(191) NULL,
    `shopBankAccountNumber` VARCHAR(191) NULL,
    `shopShippingCost` INTEGER DEFAULT 0,
    `shopFreeShippingThreshold` INTEGER DEFAULT 20000,
    `shopNote` TEXT NULL,
    `shopTaxNumber` VARCHAR(191) NULL,
    `shopAddress` VARCHAR(191) NULL,
    `shopLogoUrl` VARCHAR(191) NULL,
    `feature1Title` VARCHAR(191) NULL,
    `feature1TitleEn` VARCHAR(191) NULL,
    `feature1TitleDe` VARCHAR(191) NULL,
    `feature1Desc` VARCHAR(191) NULL,
    `feature1DescEn` VARCHAR(191) NULL,
    `feature1DescDe` VARCHAR(191) NULL,
    `feature1Icon` VARCHAR(191) NULL,
    `feature2Title` VARCHAR(191) NULL,
    `feature2TitleEn` VARCHAR(191) NULL,
    `feature2TitleDe` VARCHAR(191) NULL,
    `feature2Desc` VARCHAR(191) NULL,
    `feature2DescEn` VARCHAR(191) NULL,
    `feature2DescDe` VARCHAR(191) NULL,
    `feature2Icon` VARCHAR(191) NULL,
    `feature3Title` VARCHAR(191) NULL,
    `feature3TitleEn` VARCHAR(191) NULL,
    `feature3TitleDe` VARCHAR(191) NULL,
    `feature3Desc` VARCHAR(191) NULL,
    `feature3DescEn` VARCHAR(191) NULL,
    `feature3DescDe` VARCHAR(191) NULL,
    `feature3Icon` VARCHAR(191) NULL,
    `membershipSellerId` VARCHAR(191) NULL,
    `membershipNotificationEmail` VARCHAR(191) NULL,
    `cancellationEnabled` BOOLEAN NOT NULL DEFAULT false,
    `transferInfoHu` TEXT NULL,
    `transferInfoEn` TEXT NULL,
    `transferInfoDe` TEXT NULL,
    `transferBeneficiary` VARCHAR(191) NULL,
    `transferBankName` VARCHAR(191) NULL,
    `transferBankAccountNumber` VARCHAR(191) NULL,
    `transferNote` VARCHAR(191) NULL,
    `transferEmail` VARCHAR(191) NULL,
    `transferSellerId` VARCHAR(191) NULL,
    `featuredEventId` VARCHAR(191) NULL,
    `featuredEventActive` BOOLEAN NOT NULL DEFAULT false,
    `featuredEventTitleHU` VARCHAR(191) NULL,
    `featuredEventTitleEN` VARCHAR(191) NULL,
    `featuredEventTitleDE` VARCHAR(191) NULL,
    `featuredEventDescriptionHU` VARCHAR(191) NULL,
    `featuredEventDescriptionEN` VARCHAR(191) NULL,
    `featuredEventDescriptionDE` VARCHAR(191) NULL,
    `featuredEventButtonHU` VARCHAR(191) NULL,
    `featuredEventButtonEN` VARCHAR(191) NULL,
    `featuredEventButtonDE` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChangeRequest` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('TRANSFER', 'CANCELLATION', 'MODIFICATION') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `fromEvent` VARCHAR(191) NOT NULL,
    `toEvent` VARCHAR(191) NULL,
    `comment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'info',
    `read` BOOLEAN NOT NULL DEFAULT false,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Notification_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('BUG', 'FEATURE', 'OTHER') NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    `adminResponse` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Feedback_userId_idx`(`userId`),
    INDEX `Feedback_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'SOFT_DELETE', 'FORCE_DELETE') NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `entityData` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_entityType_idx`(`entityType`),
    INDEX `AuditLog_entityId_idx`(`entityId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    INDEX `AuditLog_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_membershipTierId_fkey` FOREIGN KEY (`membershipTierId`) REFERENCES `MembershipTier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_organizerId_fkey` FOREIGN KEY (`organizerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `Seller`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Distance` ADD CONSTRAINT `Distance_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceTier` ADD CONSTRAINT `PriceTier_distanceId_fkey` FOREIGN KEY (`distanceId`) REFERENCES `Distance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_distanceId_fkey` FOREIGN KEY (`distanceId`) REFERENCES `Distance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalSettings` ADD CONSTRAINT `GlobalSettings_membershipSellerId_fkey` FOREIGN KEY (`membershipSellerId`) REFERENCES `Seller`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalSettings` ADD CONSTRAINT `GlobalSettings_transferSellerId_fkey` FOREIGN KEY (`transferSellerId`) REFERENCES `Seller`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalSettings` ADD CONSTRAINT `GlobalSettings_featuredEventId_fkey` FOREIGN KEY (`featuredEventId`) REFERENCES `Event`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
