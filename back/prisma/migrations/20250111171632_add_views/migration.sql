CREATE VIEW "vw_TradeInfo" AS
SELECT
    "Trade".*,
    (
        "Trade".status = 'Pending'
        AND "Trade".expiration_date IS NOT NULL
        AND CURRENT_TIMESTAMP > "Trade".expiration_date
    ) AS "has_expired"
FROM
    "Trade";
