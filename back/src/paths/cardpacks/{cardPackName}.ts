import { OpenAPIV3 } from "openapi-types";
import { PrismaClient, Prisma, CardSeason, UserPrivilege } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, prisma } from "../../globals.js";
import { request } from "http";
import isAdministrator from "../../middleware/isAdministrator.js";

export default function () {
    const DELETE: Operation = async (req, res) => {
        const {packName} = req.params;
        
        try {
            await prisma.cardPackType.delete({
                where: {name:packName}
            });
            res.status(StatusCodes.NO_CONTENT).send();
            return;
        } catch (error) {
            if (error.code === PrismaError.REQUIRED_RECORD_NOT_FOUND) {
                const status = StatusCodes.NOT_FOUND;
                res.status(status).send()
                return;
            }
        }
    };

    DELETE.apiDoc = {
        summary: "Delete a cardpack",
        responses: {
            [StatusCodes.OK.toString()]: {
                description: "Delete the indicated cardpack",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/CardPackType",
                            },
                        },
                    },
                },
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                description: "Pack name not found.",
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                description: "You don't have the permissions for that.",
            },
        },
        security: [
            {
                CookieAuth: [],
            },
        ],
    };

    const PATCH: Operation = async (req, res) => {
        const { packName } = req.params
        const { title } = req.body;

        try {
            await prisma.cardClass.update({
                where: {name:packName},
                data: {
                    title
                }
            });
            res.status(StatusCodes.NO_CONTENT).send();
            return;
        } catch (error) {
            if (error.code === PrismaError.REQUIRED_RECORD_NOT_FOUND) {
                const status = StatusCodes.NOT_FOUND;
                res.status(status).send()
                return;
            }
        }
    };

    const patchRequestSchema: OpenAPIV3.SchemaObject = {
        type: "object",
        required: [ "title" ],
        additionalProperties: false,
        properties: {
            title: {
                description:
                    "The visible name of the new card.",
                type: "string",
            },
        },
    };

    PATCH.apiDoc = {
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: patchRequestSchema,
                },
                "application/x-www-form-urlencoded": {
                    schema: patchRequestSchema,
                },
            },
        },
        summary: "Update a card pack",
        responses: {
            [StatusCodes.OK.toString()]: {
                description: "Update the information of the card pack",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/CardPackType",
                            },
                        },
                    },
                },
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                description: "Card name not found.",
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                description: "You don't have the permissions for that.",
            },
        },
        security: [
            {
                CookieAuth: [],
            },
        ],
    };


    return { DELETE:[isAdministrator, DELETE], PATCH:[isAdministrator, PATCH] };
}