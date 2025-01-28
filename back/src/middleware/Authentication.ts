import { query, Request } from "express";
import { prisma, SecurityScopes } from "../globals.js";
import { StatusCodes } from "http-status-codes";
import { SecurityHandler } from "openapi-security-handler";
import { UserPrivilege } from "@prisma/client";

declare module "express-session" {
    interface SessionData {
        userId?: number;
    }
}

declare module "express" {
    interface Request {
        user?: {
            username: string,
            privilege: UserPrivilege
            id: number
        }
    }
}

const authFailure = {
    status: StatusCodes.UNAUTHORIZED,
    message: "Authentication failed, missing or invalid token.",
};
const missingPrivileges = {
    status: StatusCodes.FORBIDDEN,
    message: "Authentication failed, insufficient privileges.",
};
const serverError = {
    status: StatusCodes.INTERNAL_SERVER_ERROR, 
    message: "There was an error when authenticating the request."
};

export const basicAuth: SecurityHandler = async (
    req: Request,
    scopes: SecurityScopes[],
    definition
) => {
    const header = req.headers.authorization;
    
    if (!header?.startsWith("Basic ")) 
        throw authFailure;

    const base64String = header.slice("Basic ".length);
    const credentials = Buffer.from(base64String, 'base64');
    const [username, password] = credentials.toString().split(":");
    const user = await prisma.userData.findUnique({
        select: {
            username: true,
            privilege: true,
            user: {
                select: {
                    id: true
                }
            }
        },
        where: {
            username,
            password
        },
    });
    if (!user){
        throw authFailure
    }
    user["id"] = user?.user?.id;
    delete user.user;

    req["user"] = user as any;

    return validateScopes(req, scopes)
}

export const cookieAuth: SecurityHandler = async (
    req: Request,
    scopes: SecurityScopes[],
    definition
) => {
    const isAnonymousSession = req.session.userId == null;
    
    if (isAnonymousSession) 
        throw authFailure;
    
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
            id: req.session.userId
        },
    });
    user["username"] = user?.data?.username;
    user["privilege"] = user?.data?.privilege;
    delete user.data;
        
    

    if (!user) throw authFailure;
    req["user"] = user as any;

    return validateScopes(req, scopes);


};

async function validateScopes(req: Request, scopes: SecurityScopes[]): Promise<boolean> {
    const { user } = req;

    if (!user)
        throw serverError;

    const isAdmin = user.privilege === UserPrivilege.Administrator;

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

        const isSelf = user.username === req.params.username;
        if (isSelf || isAdmin) return true;
        throw missingPrivileges;
    }

    return true; // user is logged in   
}