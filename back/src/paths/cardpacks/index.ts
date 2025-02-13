import { OpenAPIV3 } from "openapi-types";
import { PrismaClient, Prisma, CardSeason } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import {
    PrismaError,
    SecurityScopes,
    prisma,
    deformatSeason,
    formatSeason,
} from "../../globals.js";

export default function () {
    const GET: Operation = async (req, res) => {
        const packs = await prisma.cardPackType.findMany({
            select: {
                name: true,
                title: true,
                dropQuantity: true,
                cooldown: true,
                wrapperImagePath: true,
                drops: {
                    select: {
                        packName: false,
                        cardName: false,
                        card: {
                            select: {
                                name: true,
                                title: true,
                                season: true,
                                description: true,
                                rarity: true,
                                artPath: true,
                            },
                        },
                    },
                },
            },
        });

        packs.forEach((pack) => {
            pack["wrapperImageUrl"] = pack.wrapperImagePath;
            pack.drops.forEach((cardDropped) => {
                Object.assign(cardDropped, { ...cardDropped.card });
                delete cardDropped.card;
                cardDropped["artUrl"] = cardDropped["artPath"];
                delete cardDropped["artPath"];
                cardDropped["season"] = formatSeason(cardDropped["season"]);
            });
            delete pack.wrapperImagePath;
        });

        res.json(packs);
    };

    GET.apiDoc = {
        summary: "Lists available card packs.",
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
                                $ref: "#/components/schemas/CardPack",
                            },
                        },
                    },
                },
            },
        },
    };

    const POST: Operation = async (req, res) => {
        const { name, title, drops, dropQuantity, cooldown } = req.body;
        const lootEntries = drops.map((cardName) => ({
            create: {
                cardName,
            },
            where: {
                packName_cardName: {
                    packName: name,
                    cardName,
                },
            },
        }));
        try {
            await prisma.cardPackType.create({
                data: {
                    name,
                    title,
                    dropQuantity,
                    cooldown,
                    drops: {
                        connectOrCreate: lootEntries,
                    },
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
                            message: `${fields[0]} already exists. A new cardpack cannot be created with the same value.`,
                        },
                    ],
                });
                return;
            } else if (
                error.code === PrismaError.FOREIGN_KEY_CONSTRAINT_VIOLATION
            ) {
                const status = StatusCodes.BAD_REQUEST;
                res.status(status).json({
                    status,
                    errors: [
                        {
                            message: `A card specified in the drops list does not exist.`,
                        },
                    ],
                });
                return;
            }
            throw error;
        }
    };

    const postCardPackSchema: OpenAPIV3.SchemaObject = {
        allOf: [
            {
                properties: {
                    name: {
                        $ref: "#/components/schemas/StringIdentifier",
                    },
                },
            },
            { $ref: "#/components/schemas/CardPackData" },
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
            {
                required: [
                    "name",
                    "title",
                    "drops",
                    "dropQuantity",
                    "cooldown",
                ],
            },
        ],
    };

    POST.apiDoc = {
        summary: "Creates a new card pack.",
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: postCardPackSchema,
                },
                "application/x-www-form-urlencoded": {
                    schema: postCardPackSchema,
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
                description: "The card pack was created successfully.",
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
