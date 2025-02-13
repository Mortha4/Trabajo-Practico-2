CREATE TRIGGER "tg_UserData_BeforeDelete" BEFORE DELETE ON "UserData" FOR EACH ROW
EXECUTE FUNCTION "fn_ManuallyCascadeDeleteUserData" ();

CREATE CONSTRAINT TRIGGER "tg_User_AfterUpsert"
AFTER INSERT
OR
UPDATE OF fk_username_uq,
deleted_at ON "User" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW
EXECUTE FUNCTION "fn_KeepNullConsistencyOnUserSoftDelete" ();
