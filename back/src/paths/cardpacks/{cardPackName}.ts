import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, SecurityScopes, prisma } from "../../globals.js";
import { OpenAPIV3 } from "openapi-types";

export default function () {
    const DELETE: Operation = async (req, res) => {
        const { cardPackName } = req.params;

        try {
            await prisma.cardPackType.delete({
                where: { name: cardPackName },
            });
            res.status(StatusCodes.NO_CONTENT).send();
            return;
        } catch (error) {
            if (error.code === PrismaError.REQUIRED_RECORD_NOT_FOUND) {
                const status = StatusCodes.NOT_FOUND;
                res.status(status).json({
                    message: "The specified card pack does not exist.",
                });
                return;
            }
        }
    };

    DELETE.apiDoc = {
        summary: "Deletes a card pack.",
        responses: {
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized",
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden",
            },
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "The card pack was deleted successfully.",
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                $ref: "#/components/responses/NotFound",
            },
        },
        security: [
            {
                CookieAuth: [SecurityScopes.Admin],
            },
        ],
    };

    const PATCH: Operation = async (req, res) => {
        const { cardPackName } = req.params;
        const { title, drops, dropQuantity, cooldown } = req.body;

        try {
            await prisma.$transaction([
                prisma.cardPackType.update({
                    where: { name: cardPackName },
                    data: {
                        title,
                        dropQuantity,
                        cooldown,
                    },
                }),
                prisma.lootTable.deleteMany({
                    where: {
                        packName: cardPackName,
                    },
                }),
                prisma.lootTable.createMany({
                    data: drops.map((cardName) => ({
                        packName: cardPackName,
                        cardName,
                    })),
                }),
            ]);
            res.status(StatusCodes.NO_CONTENT).send();
            return;
        } catch (error) {
            if (error.code === PrismaError.REQUIRED_RECORD_NOT_FOUND) {
                const status = StatusCodes.NOT_FOUND;
                res.status(status).json({
                    message: "The specified cark pack does not exist.",
                });
                return;
            } else if (
                error.code === PrismaError.FOREIGN_KEY_CONSTRAINT_VIOLATION
            ) {
                const status = StatusCodes.BAD_REQUEST;
                res.status(status).json({
                    errors: [
                        {
                            message:
                                "A card specified in the drops list does not exist.",
                        },
                    ],
                });
                return;
            }
            throw error;
        }
    };

    const patchRequestSchema: OpenAPIV3.SchemaObject = {
        allOf: [
            {
                $ref: "#/components/schemas/CardPackData",
            },
            {
                properties: {
                    drops: {
                        type: "array",
                        description:
                            "A list of cards' names dropped by the card pack.",
                        items: {
                            allOf: [
                                {
                                    $ref: "#/components/schemas/StringIdentifier",
                                },
                                {
                                    example: "valid_card34",
                                },
                            ],
                        },
                    },
                },
            },
        ],
    };

    PATCH.apiDoc = {
        summary: "Updates a card pack.",
        parameters: [
            {
                in: "path",
                name: "cardPackName",
                schema: {
                    $ref: "#/components/schemas/StringIdentifier",
                },
            },
        ],
        requestBody: {
            content: {
                "application/json": {
                    schema: patchRequestSchema,
                },
                "application/x-www-form-urlencoded": {
                    schema: patchRequestSchema,
                },
            },
        },
        responses: {
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized",
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden",
            },
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest",
            },
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "The card pack was updated successfully.",
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                $ref: "#/components/responses/NotFound",
            },
        },
        security: [
            {
                CookieAuth: [SecurityScopes.Admin],
            },
        ],
    };

    return { DELETE, PATCH };
}
