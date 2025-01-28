import { PrismaClient, Prisma, PackOpening } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, SecurityScopes, prisma } from "../../../globals.js";

export default function () {
    const GET: Operation = async (req, res) => {

            const openings = await prisma.packOpening.findMany({
                where: { userId : req.session.userId },
                select: {
                    packName: true,
                    openedAt: true
                }
            })
            res.json(openings);
    };

    GET.apiDoc = {
        summary: "Lists the history of packages opened by the user.",
        parameters: [
            {
                $ref: "#/components/parameters/Username",
            }
        ],
        responses: {
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized"
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden"
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                $ref: "#/components/responses/NotFound"
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest",
            },
            [StatusCodes.OK.toString()]: {
                description: "Successful query.",
            },
        },
        security: [
            {
                CookieAuth: [SecurityScopes.Self],
            },
        ],
    };

    return { GET };
}
