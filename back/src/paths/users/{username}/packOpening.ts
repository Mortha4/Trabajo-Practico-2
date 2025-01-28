import { PrismaClient, Prisma, PackOpening } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, SecurityScopes, prisma } from "../../../globals.js";
import { string } from "yaml/dist/schema/common/string.js";
import { Schema } from "yaml";
import { OpenAPIV3 } from "openapi-types";

export default function () {
    const POST: Operation = async (req, res) => {
        const { packName } = req.body;

        const loot = await prisma.lootTable.findMany({
            where: { packName },
            select: { cardName: true }
        });

        const cards = loot.map(async card => {
            const cardName = card.cardName
            
            const userId = req.session.userId;
                            
            const keep = await prisma.collectionEntry.upsert({
                where: { userId_cardName:{cardName, userId} },
                update: {
                    cardName,
                    userId,
                    quantity: {increment: 1}
                },
                create: {
                    cardName,
                    userId,
                    quantity: 1
                }
            })
            return keep
        });

        res.status(StatusCodes.OK).send();
    };
    
    const postRequestSchema: OpenAPIV3.SchemaObject = {
        type: "object",
        properties: {
            packName: {
                type: "string"
            }
        },
        required: [
            "packName"
        ]
    };

    POST.apiDoc = {
        summary: "Add cards to collection.",
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: postRequestSchema,
                },
                "application/x-www-form-urlencoded": {
                    schema: postRequestSchema,
                },
            },
        },
        responses: {
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized"
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden"
            },
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest"
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError"
            },
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "The card was created successfully.",
            },
            [StatusCodes.OK.toString()]: {
                description: "Successful query.",
            },
        },
        security: [
            {
                CookieAuth: [SecurityScopes.Admin],
            },
        ],
    };
    return { POST };
}