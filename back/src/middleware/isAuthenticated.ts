import { Request } from "express";
import { prisma } from "../globals.js";
import { StatusCodes } from "http-status-codes";
import { SecurityHandler } from "openapi-security-handler";

declare module "express-session" {
    interface SessionData {
        userId?: number;
    }
}

const isAuthenticated: SecurityHandler = async (
    req: Request,
    scopes,
    definition
) => {
    if (req.session.userId) {
        const user = await prisma.user.findUnique({
            where: {
                id: req.session.userId,
            },
        });
        if (user) return true;
    }

    throw {
        status: StatusCodes.UNAUTHORIZED,
        message: "Authentication failed, missing or invalid token.",
    };
};

export default isAuthenticated;
