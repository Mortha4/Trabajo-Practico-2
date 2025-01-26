import { OpenAPIV3 } from "openapi-types";
import { PrismaClient, Prisma, CardSeason } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, SecurityScopes, prisma } from "../../globals.js";

export default function () {
    const GET: Operation = async (req, res) => {
        const cards = await prisma.cardClass.findMany({
            select: {
                name: true,
                title: true,
                season: true,
                description: true,
                rarity: true,
                artPath: true,
            },
        });

        cards.forEach((card) => {
            card["artUrl"] = card.artPath;
            delete card.artPath;
        });

        res.status(StatusCodes.OK).json(cards);
    };

    GET.apiDoc = {
        summary: "Lists available cards.",
        responses: {
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
            [StatusCodes.OK.toString()]: {
                description: "Successful query.",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/CardClass",
                                    },
                                    {
                                        required: [
                                            "name",
                                            "title",
                                            "season",
                                            "description",
                                            "rarity",
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
    };

    const POST: Operation = async (req, res) => {
        const { name, title, season, description, rarity } = req.body;

        try {
            await prisma.cardClass.create({
                data: {
                    name,
                    title,
                    season,
                    description,
                    rarity,
                },
            });
            res.status(StatusCodes.NO_CONTENT).send();
            return;
        } catch (error) {
            if (error.code === PrismaError.UNIQUE_CONSTRAINT_VIOLATION) {
                const fields = error.meta.target as string[];
                const status = StatusCodes.BAD_REQUEST;
                res.status(status).json({
                    status,
                    errors: [
                        {
                            message: `${fields[0]} already exists. A new card cannot be created with the same value.`,
                        },
                    ],
                });
                return;
            }
            throw error;
        }
    };

    const postRequestSchema: OpenAPIV3.SchemaObject = {
        allOf: [
            {
                required: ["name", "title", "season", "description", "rarity"],
            },
            { $ref: "#/components/schemas/CardClass" },
        ],
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
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized",
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden",
            },
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest",
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "The card was created successfully.",
            },
        },
        security: [
            {
                CookieAuth: [SecurityScopes.Admin],
            },
        ],
    };

    return { GET, POST };
}
