import { OpenAPIV3 } from "openapi-types";
import { PrismaClient, Prisma, CardSeason, UserPrivilege } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, prisma } from "../../globals.js";
import { request } from "http";
import isAdministrator from "../../middleware/isAdministrator.js";

export default function () {
    const DELETE: Operation = async (req, res) => {
        const {cardName} = req.params;
        
        try {
            await prisma.cardClass.delete({
                where: {name:cardName}
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
        summary: "Delete a card",
        responses: {
            [StatusCodes.OK.toString()]: {
                description: "Delete the indicated card",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/CardClass",
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

    const PATCH: Operation = async (req, res) => {
        const { cardName } = req.params
        const { title, season, description, rarityName } = req.body;

        try {
            await prisma.cardClass.update({
                where: {name:cardName},
                data: {
                    title,
                    season,
                    description,
                    rarityName
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
        required: [ "title", "season", "description", "rarityName"],
        additionalProperties: false,
        properties: {
            title: {
                description:
                    "The visible name of the new card.",
                type: "string",
            },
            season: {
                description:
                    "Indicate which season the card belongs to.",
                type: "string",
                enum: [ 
                        CardSeason.Season1,
                        CardSeason.Season2,
                        CardSeason.Season3,
                        CardSeason.Season4,
                        CardSeason.Season5 
                    ],
            },
            description: {
                description:
                    "The description of the content of the new card.",
                type: "string",
            },
            rarityName: {
                $ref: "#/components/schemas/Rarity",
            },
        },
    };

    PATCH.apiDoc = {
        parameters: [
            {
                in: "path",
                name: "cardName",
                schema: {
                    $ref: "#/components/schemas/StringIdentifier",
                },
            },
        ],
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
        summary: "Update a card",
        responses: {
            [StatusCodes.OK.toString()]: {
                description: "Update the information of the card",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/CardClass",
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