ALTER TABLE "Rarity"
ADD CONSTRAINT "Rarity_IsValidProbability_chk" CHECK ("drop_probability" BETWEEN 0 AND 1);

-- Deferrable check constraints are not supported in postgres, this constraint is implemented as a CONSTRAINT TRIGGER "tg_User_AfterUpsert" on "User"
-- ALTER TABLE "User"
-- ADD CONSTRAINT "User_KeepNullConsistencyOnSoftDelete_chk" CHECK (
--     CASE
--         WHEN "fk_username_uq" IS NOT NULL THEN "deleted_at" IS NULL
--         WHEN "fk_username_uq" IS NULL THEN "deleted_at" IS NOT NULL
--     END
-- );
-- ALTER TABLE "User"
-- ALTER CONSTRAINT "User_KeepNullConsistencyOnSoftDelete_chk" DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "User"
ADD CONSTRAINT "User_IsValidUsername_chk" CHECK ("fn_IsLowercaseAlphanumerical" ("fk_username_uq"));

ALTER TABLE "UserData"
ADD CONSTRAINT "UserData_IsValidUsername_chk" CHECK ("fn_IsLowercaseAlphanumerical" ("pk_username"));

ALTER TABLE "CardClass"
ADD CONSTRAINT "CardClass_IsValidCardName_chk" CHECK ("fn_IsLowercaseAlphanumerical" ("pk_name"));

ALTER TABLE "CardPackType"
ADD CONSTRAINT "CardPackType_IsValidPackName_chk" CHECK ("fn_IsLowercaseAlphanumerical" ("pk_name"));

ALTER TABLE "Trade"
ADD CONSTRAINT "Trade_IsClosingDateAndStatusConsistent_chk" CHECK (
    CASE
        WHEN "status" = 'Pending' THEN "closed_at" IS NULL
        WHEN "status" IN ('Cancelled', 'Denied', 'Accepted') THEN "closed_at" IS NOT NULL
    END
);

ALTER TABLE "Trade"
ADD CONSTRAINT "Trade_PrivateOffersHaveReceiver_chk" CHECK (
    CASE "offer_type"
        WHEN 'PrivateOffer' THEN "fk_receiver_id" IS NOT NULL
    END
);

ALTER TABLE "Trade"
ADD CONSTRAINT "Trade_IsReceiverAndStatusConsistent_chk" CHECK (
    CASE
        WHEN "status" IN ('Accepted', 'Denied') THEN "fk_receiver_id" IS NOT NULL
    END
);

ALTER TABLE "Trade"
ADD CONSTRAINT "Trade_ForbidSelfTrade_chk" CHECK ("fk_offerer_id" != "fk_receiver_id");

ALTER TABLE "TradeDetail"
ADD CONSTRAINT "TradeDetail_IsQuantityPositive_chk" CHECK ("quantity" >= 0);

ALTER TABLE "CollectionEntry"
ADD CONSTRAINT "CollectionEntry_IsQuantityPositive_chk" CHECK ("quantity" >= 0);

ALTER TABLE "OpeningDetail"
ADD CONSTRAINT "OpeningDetail_IsQuantityStrictlyPositive_chk" CHECK ("quantity" > 0);
