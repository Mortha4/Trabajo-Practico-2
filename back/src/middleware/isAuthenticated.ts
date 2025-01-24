import { Request } from "express";
import { prisma, SecurityScopes } from "../globals.js";
import { StatusCodes } from "http-status-codes";
import { SecurityHandler } from "openapi-security-handler";
import { UserPrivilege } from "@prisma/client";

declare module "express-session" {
    interface SessionData {
        userId?: number;
    }
}

const isAuthenticated: SecurityHandler = async (
    req: Request,
    scopes: SecurityScopes[],
    definition
) => {
    const authFailure = {
        status: StatusCodes.UNAUTHORIZED,
        message: "Authentication failed, missing or invalid token.",
    };

    const missingPrivileges = {
        status: StatusCodes.FORBIDDEN,
        message: "Authentication failed, insufficient privileges.",
    };

    const isAnonymousSession = !req.session.userId;
    if (isAnonymousSession) throw authFailure;

    const user = await prisma.user.findUnique({
        select: {
            id: true,
            data: {
                select: {
                    username: true,
                    privilege: true,
                },
            },
        },
        where: {
            id: req.session.userId,
        },
    });

    if (!user) {
        console.error("Session references inexistent user!!!");
        throw authFailure;
    }

    const isAdmin = user.data.privilege === UserPrivilege.Administrator;

    const requiredAdmin = scopes.find(
        (scope) => scope === SecurityScopes.Admin
    );
    if (requiredAdmin && !isAdmin) throw missingPrivileges;

    const requiredSelf = scopes.find((scope) => scope === SecurityScopes.Self);
    if (requiredSelf) {
        if (!req.params.username)
            console.error(
                `Used SecurityScope.Self in an endpoint without req.params.username. Endpoint: ${req.path}`
            );

        const isSelf = user.data.username === req.params.username;
        if (isSelf || isAdmin) return true;
        throw missingPrivileges;
    }

    // TODO: what happens when return false?

    return true; // user is logged in
};

export default isAuthenticated;
