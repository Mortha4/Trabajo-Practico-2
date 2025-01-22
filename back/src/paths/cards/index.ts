import { OpenAPIV3 } from "openapi-types";
import { PrismaClient, Prisma, CardSeason } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, prisma } from "../../globals.js";
import isAdministrator from "../../middleware/isAdministrator.js";


export default function () {
    const GET: Operation = async (req, res) => {
        const cards = await prisma.cardClass.findMany({
            select: {
                title: true,
                season: true,
                description: true,
                rarityName: true,
                artPath: true,
            },
        });
        res.json(cards);
    };

    GET.apiDoc = {
        summary: "Returns a list of cards",
        responses: {
            [StatusCodes.OK.toString()]: {
                description: "A list of cards",
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
        },
    };

    const POST: Operation = async (req, res) => {
        const { name, title, season, description, rarityName } = req.body;

        try {
            await prisma.cardClass.create({
                data: {
                    name,
                    title,
                    season,
                    description,
                    rarityName
                },
            });
            res.status(StatusCodes.NO_CONTENT).send();
            return;
        } catch (error) {
            if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
                console.log("Encountered unknown database error: ", error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
                return;
            }

            if (error.code === PrismaError.UNIQUE_CONSTRAINT_VIOLATION) {
                const fields = error.meta.target as string[];
                const status = StatusCodes.BAD_REQUEST;
                res.status(status).json({
                    status,
                    errors: `${fields[0]} already exists. A new card cannot be created with the same value.`,
                });
                return;
            } else {
                console.log(
                    "Encountered know but unhandled database error: ",
                    error
                );
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
                return;
            }
        }
    };

    const postRequestSchema: OpenAPIV3.SchemaObject = {
        type: "object",
        required: ["name", "title", "season", "description", "rarityName"],
        additionalProperties: false,
        properties: {
            name: {
                description:
                    "A unique alphanumerical lowercase string that identifies the card.",
                type: "string",
                pattern: "^[a-z0-9_]+$",
            },
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
                description:
                    "Defines the probability of obtaining this card",
                type: "string",
                enum: [
                        "Common",
                        "Rare"
                ],
            },
        },
    };
    
    POST.apiDoc = {
        summary: "Creates a new Card.",
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
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "The card was created successfully.",
            },
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest",
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                description: "An internal server error occurred.",
            },
        },
        security: [
            {
                CookieAuth: [],
            },
        ],
    };

    

    return { GET, POST:[isAdministrator, POST] };
}
