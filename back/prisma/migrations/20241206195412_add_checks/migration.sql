ALTER TABLE "User"
ADD CONSTRAINT "cstr__User__KeepNullConsistencyOnSoftDelete__chk" CHECK (
    CASE
        WHEN "fk_username_uq" IS NOT NULL THEN "deleted_at" IS NULL
        WHEN "fk_username_uq" IS NULL THEN "deleted_at" IS NOT NULL
    END
);

ALTER TABLE "User"
ADD CONSTRAINT "cstr__User__IsValidUsername__chk" CHECK ("fn_IsLowercaseAlphanumerical" ("fk_username_uq"));

ALTER TABLE "UserData"
ADD CONSTRAINT "cstr__UserData__IsValidUsername__chk" CHECK ("fn_IsLowercaseAlphanumerical" ("pk_username"));

ALTER TABLE "Card"
ADD CONSTRAINT "cstr__Card__IsValidCardName__chk" CHECK ("fn_IsLowercaseAlphanumerical" ("name_uq"));

ALTER TABLE "CardPack"
ADD CONSTRAINT "cstr__CardPack__IsValidPackName__chk" CHECK ("fn_IsLowercaseAlphanumerical" ("name_uq"));

ALTER TABLE "TradeOffer"
ADD CONSTRAINT "cstr__TradeOffer__ValidateClosingDateAndStatus__chk" CHECK (
    CASE
        WHEN "status" = 'Pending' THEN "closed_at" IS NULL
        WHEN "status" IN ('Cancelled', 'Denied', 'Accepted') THEN "closed_at" IS NOT NULL
    END
);

ALTER TABLE "TradeOffer"
ADD CONSTRAINT "cstr__TradeOffer__ValidateReceiverAndOfferType__chk" CHECK (
    CASE "offer_type"
        WHEN 'PrivateOffer' THEN "fk_receiver_id" IS NOT NULL
    END
);

ALTER TABLE "TradeOffer"
ADD CONSTRAINT "cstr__TradeOffer__ValidateReceiverAndStatus__chk" CHECK (
    CASE
        WHEN "status" IN ('Accepted', 'Denied') THEN "fk_receiver_id" IS NOT NULL
    END
);

ALTER TABLE "TradeOffer"
ADD CONSTRAINT "cstr__TradeOffer__ForbidSelfTrade__chk" CHECK ("fk_offerer_id" != "fk_receiver_id");

ALTER TABLE "TradeOfferDetail"
ADD CONSTRAINT "cstr__TradeOfferDetail__IsAmountPositive__chk" CHECK ("amount" >= 0);

ALTER TABLE "CollectionEntry"
ADD CONSTRAINT "cstr__CollectionEntry__IsAmountPositive__chk" CHECK ("amount" >= 0);

ALTER TABLE "CardPackHistoryEntry"
ADD CONSTRAINT "cstr__CardPackHistoryEntry__IsAmountOpenedPositive__chk" CHECK ("amount_opened" >= 0);
