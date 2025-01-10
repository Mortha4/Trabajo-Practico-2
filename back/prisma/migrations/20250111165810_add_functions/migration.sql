CREATE FUNCTION "fn_IsLowercaseAlphanumerical" (string VARCHAR) RETURNS BOOLEAN LANGUAGE SQL IMMUTABLE RETURNS NULL ON NULL INPUT RETURN string NOT SIMILAR TO '%[^a-z0-9_]%';

CREATE FUNCTION "fn_ManuallyCascadeDeleteUserData" () RETURNS TRIGGER AS $tg_UserData_BeforeDelete$
DECLARE
    user_id INTEGER;
BEGIN
    SELECT pk_user_id INTO user_id FROM "User" WHERE fk_username_uq = OLD.pk_username;

    IF (NOT FOUND) THEN
        RAISE EXCEPTION 'Username % does not have an associated user_id, the database is in an invalid state!', OLD.pk_username;
    END IF;

    DELETE FROM "CollectionEntry" WHERE pk_user_id = user_id;

    DELETE FROM "PackOpening" WHERE pk_user_id = user_id;

    WITH "cte_DeletedUsers" AS (
        SELECT pk_user_id FROM "User" WHERE fk_username_uq IS NULL AND deleted_at IS NOT NULL
    ) DELETE FROM 
        "Trade" 
    WHERE 
        (fk_receiver_id IN (SELECT pk_user_id FROM "cte_DeletedUsers") OR fk_receiver_id = user_id)
    AND
        (fk_offerer_id IN (SELECT pk_user_id FROM "cte_DeletedUsers") OR fk_offerer_id = user_id);
      
    RETURN OLD; -- Indicates the trigger should continue on to the next row
END;
$tg_UserData_BeforeDelete$ LANGUAGE plpgsql;
