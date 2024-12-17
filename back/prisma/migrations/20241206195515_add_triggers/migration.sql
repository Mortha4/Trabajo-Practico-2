CREATE TRIGGER "tg_UserData_BeforeDelete" BEFORE DELETE ON "UserData" FOR EACH ROW
EXECUTE FUNCTION "fn_ManuallyCascadeDeleteUserData" ();
