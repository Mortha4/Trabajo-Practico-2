CREATE VIEW "vw_TradeOfferInfo" AS
SELECT
    "TradeOffer".*,
    (
        "TradeOffer".status = 'Pending'
        AND "TradeOffer".expiration_date IS NOT NULL
        AND CURRENT_TIMESTAMP > "TradeOffer".expiration_date
    ) AS "has_expired"
FROM
    "TradeOffer";
