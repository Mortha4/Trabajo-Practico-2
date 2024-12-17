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
CREATE TYPE "CardRarity" AS ENUM('Common', 'Rare');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM('Pending', 'Cancelled', 'Denied', 'Accepted');

-- CreateEnum
CREATE TYPE "TradeOfferType" AS ENUM('PublicOffer', 'PrivateOffer');

-- CreateEnum
CREATE TYPE "TradeOfferDetailType" AS ENUM('Offered', 'Requested');

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
CREATE TABLE "CardPack" (
    "pk_pack_id" SERIAL NOT NULL,
    "name_uq" VARCHAR(100) NOT NULL,
    "title" VARCHAR(60) NOT NULL,
    "wrapper_image_path" VARCHAR(255) NOT NULL DEFAULT 'public/placeholder-image.svg',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ,
    CONSTRAINT "CardPack_pkey" PRIMARY KEY ("pk_pack_id")
);

-- CreateTable
CREATE TABLE "Card" (
    "pk_card_id" SERIAL NOT NULL,
    "name_uq" VARCHAR(100) NOT NULL,
    "title" VARCHAR(60) NOT NULL,
    "season" "CardSeason" NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "rarity" "CardRarity" NOT NULL,
    "art_path" VARCHAR(255) NOT NULL DEFAULT 'public/placeholder-image.svg',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ,
    CONSTRAINT "Card_pkey" PRIMARY KEY ("pk_card_id")
);

-- CreateTable
CREATE TABLE "TradeOffer" (
    "pk_trade_id" SERIAL NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'Pending',
    "closed_at" TIMESTAMPTZ,
    "expiration_date" TIMESTAMPTZ,
    "offer_type" "TradeOfferType" NOT NULL DEFAULT 'PublicOffer',
    "fk_offerer_id" INTEGER NOT NULL,
    "fk_receiver_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ,
    CONSTRAINT "TradeOffer_pkey" PRIMARY KEY ("pk_trade_id")
);

-- CreateTable
CREATE TABLE "TradeOfferDetail" (
    "fk_offer_id" INTEGER NOT NULL,
    "fk_card_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "detail_type" "TradeOfferDetailType" NOT NULL,
    CONSTRAINT "TradeOfferDetail_pkey" PRIMARY KEY ("fk_offer_id", "fk_card_id")
);

-- CreateTable
CREATE TABLE "CollectionEntry" (
    "fk_card_id" INTEGER NOT NULL,
    "fk_user_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ,
    CONSTRAINT "CollectionEntry_pkey" PRIMARY KEY ("fk_user_id", "fk_card_id")
);

-- CreateTable
CREATE TABLE "CardPackHistoryEntry" (
    "fk_pack_id" INTEGER NOT NULL,
    "fk_user_id" INTEGER NOT NULL,
    "amount_opened" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ,
    CONSTRAINT "CardPackHistoryEntry_pkey" PRIMARY KEY ("fk_user_id", "fk_pack_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_fk_username_uq_key" ON "User" ("fk_username_uq");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_email_uq_key" ON "UserData" ("email_uq");

-- CreateIndex
CREATE UNIQUE INDEX "CardPack_name_uq_key" ON "CardPack" ("name_uq");

-- CreateIndex
CREATE UNIQUE INDEX "Card_name_uq_key" ON "Card" ("name_uq");

-- AddForeignKey
ALTER TABLE "User"
ADD CONSTRAINT "cstr__User__username__fk__UserData" FOREIGN KEY ("fk_username_uq") REFERENCES "UserData" ("pk_username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserData"
ADD CONSTRAINT "cstr__UserData__username__fk__User__username" FOREIGN KEY ("pk_username") REFERENCES "User" ("fk_username_uq") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeOffer"
ADD CONSTRAINT "cstr__TradeOffer__offerer__fk__User" FOREIGN KEY ("fk_offerer_id") REFERENCES "User" ("pk_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeOffer"
ADD CONSTRAINT "cstr__TradeOffer__receiver__fk__User" FOREIGN KEY ("fk_receiver_id") REFERENCES "User" ("pk_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeOfferDetail"
ADD CONSTRAINT "cstr__TradeOfferDetail__offer__fk__TradeOffer" FOREIGN KEY ("fk_offer_id") REFERENCES "TradeOffer" ("pk_trade_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeOfferDetail"
ADD CONSTRAINT "cstr__TradeOfferDetail__card__fk__Card" FOREIGN KEY ("fk_card_id") REFERENCES "Card" ("pk_card_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionEntry"
ADD CONSTRAINT "cstr__CollectionEntry__card__fk__Card" FOREIGN KEY ("fk_card_id") REFERENCES "Card" ("pk_card_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionEntry"
ADD CONSTRAINT "cstr__CollectionEntry__user__fk__User" FOREIGN KEY ("fk_user_id") REFERENCES "User" ("pk_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPackHistoryEntry"
ADD CONSTRAINT "cstr__CardPackHistoryEntry__pack__fk__CardPack" FOREIGN KEY ("fk_pack_id") REFERENCES "CardPack" ("pk_pack_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPackHistoryEntry"
ADD CONSTRAINT "cstr__CardPackHistoryEntry__user__fk__User" FOREIGN KEY ("fk_user_id") REFERENCES "User" ("pk_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
