import { PrismaClient, Prisma, CardSeason } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import {
    PrismaError,
    SecurityScopes,
    formatSeason,
    prisma,
    recoverSeason,
} from "../../../globals.js";

export default function () {
    const GET: Operation = async (req, res) => {
        const { username } = req.params;
        const cardTitle = req.query.title as string | undefined;
        const minimumQuantity = req.query.minimumQuantity as unknown as number;
        const maximumQuantity = req.query.maximumQuantity as unknown as number;

        const errorResponse = {
            errors: [],
        };

        const rarities = req.query.rarities as string[] | undefined;
        if (rarities) {
            const dbRarities = (
                await prisma.rarity.findMany({
                    select: {
                        name: true,
                    },
                })
            ).map((rarity) => rarity.name);

            const receivedValidRarities = rarities.every((rarity) =>
                dbRarities.includes(rarity)
            );
            if (!receivedValidRarities)
                errorResponse.errors.push({
                    message: "Received an invalid rarity.",
                });
        }

        const seasons = req.query.seasons as string[] | undefined;
        if (seasons) {
            const receivedValidSeasons = seasons?.every((season) =>
                Object.values(CardSeason)
                    .map(formatSeason)
                    .includes(season as any)
            );
            if (!receivedValidSeasons)
                errorResponse.errors.push({
                    message: "Received an invalid season.",
                });
        }

        if (errorResponse.errors.length) {
            res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
            return;
        }

        const specifiedMinimum = minimumQuantity !== undefined;
        const specifiedMaximum = maximumQuantity !== undefined;
        let quantityQuery;

        if (specifiedMinimum || specifiedMaximum) {
            quantityQuery = {};
            if (specifiedMaximum) quantityQuery["lte"] = maximumQuantity;

            if (specifiedMinimum) quantityQuery["gte"] = minimumQuantity;
        }

        const cards = await prisma.collectionEntry.findMany({
            select: {
                createdAt: true,
                quantity: true,
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
            where: {
                user: {
                    username: {
                        equals: username,
                    },
                },
                card: {
                    title: {
                        contains: cardTitle,
                    },
                    rarity: {
                        in: rarities,
                    },
                    season: {
                        in: seasons?.map(recoverSeason) as CardSeason[],
                    },
                },
                quantity: quantityQuery,
            },
        });

        cards.forEach((card) => {
            card["firstDroppedAt"] = card.createdAt;
            delete card.createdAt;
            card["artUrl"] = card.card.artPath;
            delete card.card.artPath;
            Object.assign(card, card.card);
            card["season"] = formatSeason(card["season"]);
            delete card.card;
        });

        res.json(cards);
    };

    GET.apiDoc = {
        summary: "Lists the cards in the user's collection.",
        parameters: [
            {
                $ref: "#/components/parameters/Username",
            },
            {
                $ref: "#/components/parameters/CardRarities",
            },
            {
                $ref: "#/components/parameters/CardSeasons",
            },
            {
                in: "query",
                name: "minimumQuantity",
                allowEmptyValue: false,
                description:
                    "Filters cards that don't meet the minimum quantity.",
                schema: {
                    type: "integer",
                    minimum: 0,
                },
            },
            {
                in: "query",
                name: "maximumQuantity",
                allowEmptyValue: false,
                description: "Filters cards that surpass the maximum quantity.",
                schema: {
                    type: "integer",
                    minimum: 0,
                },
            },
            {
                in: "query",
                name: "title",
                allowEmptyValue: false,
                description: "Filter cards that don't match the title.",
                example: "dark",
                schema: {
                    type: "string",
                },
            },
        ],
        responses: {
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized",
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden",
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                $ref: "#/components/responses/NotFound",
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest",
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
                                        properties: {
                                            quantity: {
                                                type: "integer",
                                                minimum: 0,
                                            },
                                            firstDroppedAt: {
                                                type: "string",
                                                format: "date-time",
                                            },
                                        },
                                        required: [
                                            "name",
                                            "title",
                                            "season",
                                            "description",
                                            "rarity",
                                            "artUrl",
                                            "quantity",
                                            "firstDroppedAt",
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
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
