-- CreateEnum
CREATE TYPE "UserPrivilege" AS ENUM('Administrator', 'Standard');

-- CreateEnum
CREATE TYPE "CardSeason" AS ENUM(
    'Season1',
    'Season2',
    'Season3',
    'Season4',
    'Season5'
);

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM('Pending', 'Cancelled', 'Denied', 'Accepted');

-- CreateEnum
CREATE TYPE "TradeType" AS ENUM('PublicOffer', 'PrivateOffer');

-- CreateEnum
CREATE TYPE "TradeDetailType" AS ENUM('Offered', 'Requested');

-- CreateTable
CREATE TABLE "Session" (
    "pk_session_id" TEXT NOT NULL,
    "sid_" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("pk_session_id")
);

-- CreateTable
CREATE TABLE "User" (
    "pk_user_id" SERIAL NOT NULL,
    "fk_username_uq" VARCHAR(32),
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "User_pkey" PRIMARY KEY ("pk_user_id")
);

-- CreateTable
CREATE TABLE "UserData" (
    "pk_username" VARCHAR(32) NOT NULL,
    "profile_name" VARCHAR(100) NOT NULL,
    "email_uq" VARCHAR(255) NOT NULL,
    "profile_picture_path" VARCHAR(255) NOT NULL DEFAULT 'public/default-profile-picture.svg',
    "password" VARCHAR(20) NOT NULL,
    "privilege" "UserPrivilege" NOT NULL DEFAULT 'Standard',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ,
    CONSTRAINT "UserData_pkey" PRIMARY KEY ("pk_username")
);

-- CreateTable
CREATE TABLE "CardPackType" (
    "pk_name" VARCHAR(100) NOT NULL,
    "title" VARCHAR(60) NOT NULL,
    "wrapper_image_path" VARCHAR(255) NOT NULL DEFAULT 'public/placeholder-image.svg',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ,
    CONSTRAINT "CardPackType_pkey" PRIMARY KEY ("pk_name")
);

-- CreateTable
CREATE TABLE "Rarity" (
    "pk_name" VARCHAR(100) NOT NULL,
    "drop_probability" DECIMAL(4, 3) NOT NULL,
    CONSTRAINT "Rarity_pkey" PRIMARY KEY ("pk_name")
);

-- CreateTable
CREATE TABLE "CardClass" (
    "pk_name" VARCHAR(100) NOT NULL,
    "title" VARCHAR(60) NOT NULL,
    "season" "CardSeason" NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "rarity" VARCHAR(100) NOT NULL,
    "art_path" VARCHAR(255) NOT NULL DEFAULT 'public/placeholder-image.svg',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ,
    CONSTRAINT "CardClass_pkey" PRIMARY KEY ("pk_name")
);

-- CreateTable
CREATE TABLE "LootTable" (
    "pk_pack_name" TEXT NOT NULL,
    "pk_card_name" TEXT NOT NULL,
    CONSTRAINT "LootTable_pkey" PRIMARY KEY ("pk_pack_name", "pk_card_name")
);

-- CreateTable
CREATE TABLE "CollectionEntry" (
    "pk_card_name" TEXT NOT NULL,
    "pk_user_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ,
    CONSTRAINT "CollectionEntry_pkey" PRIMARY KEY ("pk_user_id", "pk_card_name")
);

-- CreateTable
CREATE TABLE "PackOpening" (
    "pk_user_id" INTEGER NOT NULL,
    "pk_pack_name" TEXT NOT NULL,
    "pk_opened_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PackOpening_pkey" PRIMARY KEY ("pk_user_id", "pk_pack_name", "pk_opened_at")
);

-- CreateTable
CREATE TABLE "OpeningDetail" (
    "pk_user_id" INTEGER NOT NULL,
    "pk_pack_name" TEXT NOT NULL,
    "pk_opened_at" TIMESTAMP(3) NOT NULL,
    "pk_card_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "OpeningDetail_pkey" PRIMARY KEY (
        "pk_user_id",
        "pk_pack_name",
        "pk_opened_at",
        "pk_card_name"
    )
);

-- CreateTable
CREATE TABLE "Trade" (
    "pk_trade_id" SERIAL NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'Pending',
    "closed_at" TIMESTAMPTZ,
    "expiration_date" TIMESTAMPTZ,
    "offer_type" "TradeType" NOT NULL DEFAULT 'PublicOffer',
    "fk_offerer_id" INTEGER NOT NULL,
    "fk_receiver_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ,
    CONSTRAINT "Trade_pkey" PRIMARY KEY ("pk_trade_id")
);

-- CreateTable
CREATE TABLE "TradeDetail" (
    "pk_trade_id" INTEGER NOT NULL,
    "pk_card_name" VARCHAR(100) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "detail_type" "TradeDetailType" NOT NULL,
    CONSTRAINT "TradeDetail_pkey" PRIMARY KEY ("pk_trade_id", "pk_card_name")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid__key" ON "Session" ("sid_");

-- CreateIndex
CREATE UNIQUE INDEX "User_fk_username_uq_key" ON "User" ("fk_username_uq");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_email_uq_key" ON "UserData" ("email_uq");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_fk_offerer_id_created_at_key" ON "Trade" ("fk_offerer_id", "created_at");

-- AddForeignKey
ALTER TABLE "User"
ADD CONSTRAINT "User_Owns_UserData" FOREIGN KEY ("fk_username_uq") REFERENCES "UserData" ("pk_username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserData"
ADD CONSTRAINT "UserData_BelongsTo_User" FOREIGN KEY ("pk_username") REFERENCES "User" ("fk_username_uq") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardClass"
ADD CONSTRAINT "CardClass_IsClassifiedBy_Rarity" FOREIGN KEY ("rarity") REFERENCES "Rarity" ("pk_name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LootTable"
ADD CONSTRAINT "CardPackType_Drops_CardClass" FOREIGN KEY ("pk_pack_name") REFERENCES "CardPackType" ("pk_name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LootTable"
ADD CONSTRAINT "CardClass_IsDroppedBy_CardPackType" FOREIGN KEY ("pk_card_name") REFERENCES "CardClass" ("pk_name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionEntry"
ADD CONSTRAINT "CollectionEntry_Tracks_CardClass" FOREIGN KEY ("pk_card_name") REFERENCES "CardClass" ("pk_name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionEntry"
ADD CONSTRAINT "CollectionEntry_BelongsTo_User" FOREIGN KEY ("pk_user_id") REFERENCES "User" ("pk_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackOpening"
ADD CONSTRAINT "PackOpening_IsPerformedBy_User" FOREIGN KEY ("pk_user_id") REFERENCES "User" ("pk_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackOpening"
ADD CONSTRAINT "PackOpening_Opens_CardPackType" FOREIGN KEY ("pk_pack_name") REFERENCES "CardPackType" ("pk_name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningDetail"
ADD CONSTRAINT "OpeningDetail_BelongsTo_PackOpening" FOREIGN KEY ("pk_user_id", "pk_pack_name", "pk_opened_at") REFERENCES "PackOpening" ("pk_user_id", "pk_pack_name", "pk_opened_at") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningDetail"
ADD CONSTRAINT "OpeningDetail_IsConsistentWith_LootTable" FOREIGN KEY ("pk_pack_name", "pk_card_name") REFERENCES "LootTable" ("pk_pack_name", "pk_card_name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade"
ADD CONSTRAINT "Trade_IsOfferedBy_User" FOREIGN KEY ("fk_offerer_id") REFERENCES "User" ("pk_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade"
ADD CONSTRAINT "Trade_IsReceivedBy_User" FOREIGN KEY ("fk_receiver_id") REFERENCES "User" ("pk_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeDetail"
ADD CONSTRAINT "TradeDetail_BelongsTo_Trade" FOREIGN KEY ("pk_trade_id") REFERENCES "Trade" ("pk_trade_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeDetail"
ADD CONSTRAINT "TradeDetail_Features_CardClass" FOREIGN KEY ("pk_card_name") REFERENCES "CardClass" ("pk_name") ON DELETE CASCADE ON UPDATE CASCADE;
