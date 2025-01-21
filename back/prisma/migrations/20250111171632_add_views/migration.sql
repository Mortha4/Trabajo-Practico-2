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
    "UserData".modified_at
FROM
    "User"
    LEFT JOIN "UserData" ON "User".fk_username_uq = "UserData".pk_username;
