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

CREATE VIEW "vw_FlattenedUser" AS
SELECT
    "User".pk_user_id,
    "User".fk_username_uq,
    "User".deleted_at,
    "UserData".profile_name,
    "UserData".email_uq,
    COALESCE(
        "UserData".profile_picture_path,
        'public/deleted-profile-picture.svg'
    ) AS profile_picture_path,
    "UserData"."password",
    "UserData".privilege,
    "UserData".created_at,
    "UserData".modified_at,
    COALESCE("CollectionStats".cards_seen, 0) AS cards_seen,
    COALESCE("CollectionStats".cards_collected, 0) cards_collected
FROM
    "User"
    LEFT JOIN "UserData" ON "User".fk_username_uq = "UserData".pk_username
    LEFT JOIN (
        SELECT
            "CollectionEntry".pk_user_id,
            SUM("CollectionEntry".quantity) AS cards_collected,
            COUNT("CollectionEntry".pk_card_name) AS cards_seen
        FROM
            "CollectionEntry"
        GROUP BY
            "CollectionEntry".pk_user_id
    ) AS "CollectionStats" ON "User".pk_user_id = "CollectionStats".pk_user_id;
