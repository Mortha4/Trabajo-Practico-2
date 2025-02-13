import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import {
    SecurityScopes,
    formatSeason,
    prisma,
} from "../../../../../globals.js";
import moment from "moment";
import { CardSeason } from "@prisma/client";

export default function () {
    const GET: Operation = async (req, res) => {
        // TODO implement GET cardpack/{}/openings
        // const openings = await prisma.packOpening.findMany({
        // where: { userId: req.session.userId },
        // select: {
        // packName: true,
        // openedAt: true,
        // },
        // });
        // res.json(openings);
    };

    GET.apiDoc = {
        summary: "Lists the history of card packs opened by the user.",
        parameters: [
            {
                $ref: "#/components/parameters/Username",
            },
            {
                $ref: "#/components/parameters/PackName",
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
            // [StatusCodes.BAD_REQUEST.toString()]: {
            // $ref: "#/components/responses/BadRequest",
            // },
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

    const POST: Operation = async (req, res) => {
        // TODO: look for db race conditions or locking
        const { username, packName } = req.params;

        const { id: userId } =
            (await prisma.user.findUnique({
                select: {
                    id: true,
                },
                where: {
                    username,
                },
            })) ?? {};

        // NOTE: loose equality is intended
        if (userId == null) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "The user specified does not exist.",
            });
            return;
        }

        const pack = await prisma.cardPackType.findUnique({
            select: {
                dropQuantity: true,
                cooldown: true,
            },
            where: {
                name: packName,
            },
        });

        if (!pack) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "The card pack specified does not exist.",
            });
            return;
        }

        const {
            _max: { openedAt: lastOpening },
        } = await prisma.packOpening.aggregate({
            _max: {
                openedAt: true,
            },
            where: {
                userId,
                packName,
            },
        });

        const nextOpening = moment(lastOpening).add(
            moment.duration(pack.cooldown)
        );
        const canOpen = !lastOpening || nextOpening.isBefore(moment());
        if (!canOpen) {
            res.setHeader("Retry-After", nextOpening.toDate().toUTCString())
                .status(StatusCodes.CONFLICT)
                .json({
                    message:
                        "Cannot open the required package as it is on cooldown.",
                });
            return;
        }

        const loot = await prisma.lootTable.findMany({
            where: { packName },
            select: {
                card: true,
            },
        });

        const cards = loot.map((loot) => loot.card);

        const lootRarities = new Set(cards.map((card) => card.rarity));

        // ordered by least to most likely
        const rarities = await prisma.rarity.findMany({
            select: {
                name: true,
                dropProbability: true,
            },
            where: {
                name: {
                    in: lootRarities.values().toArray(),
                },
            },
            orderBy: {
                dropProbability: "asc",
            },
        });

        const cardsByRarity = Object.groupBy(cards, ({ rarity }) => rarity);

        // An object/dictionary that maps card names to the quantity dropped
        const cardsDroppedQuantityMap: Record<string, number> = {};

        for (let i = 0; i < pack.dropQuantity; i++) {
            let random = Math.random();
            let dropRarity;

            for (const rarity of rarities) {
                // TODO: add constraint in rarity table to enforce probabilities to conform to the notion of a "Probability measure", refactor this accordingly
                if (rarity.dropProbability.greaterThan(random)) {
                    dropRarity = rarity.name;
                    break;
                }
            }

            if (!dropRarity) {
                const leastRare = rarities[rarities.length - 1].name;
                dropRarity = leastRare;
            }

            const dropCandidates = cardsByRarity[dropRarity];

            const cardChosen =
                dropCandidates[
                    Math.floor(Math.random() * dropCandidates.length)
                ];

            const newQuantity = cardsDroppedQuantityMap[cardChosen.name] + 1;
            cardsDroppedQuantityMap[cardChosen.name] = newQuantity || 1;
        }

        const cardsDropped = Object.entries(cardsDroppedQuantityMap).map(
            (entry) => ({ cardName: entry[0], quantity: entry[1] })
        );

        const upserts = cardsDropped.map((card) =>
            prisma.collectionEntry.upsert({
                where: { userId_cardName: { cardName: card.cardName, userId } },
                update: {
                    quantity: { increment: card.quantity },
                },
                create: {
                    cardName: card.cardName,
                    userId,
                    quantity: card.quantity,
                },
            })
        );

        // TODO: could LootTable have changed since our first query? possible stale data
        await prisma.$transaction([
            prisma.packOpening.create({
                data: {
                    packName,
                    userId,
                    details: {
                        createMany: {
                            data: cardsDropped,
                        },
                    },
                },
            }),
            ...upserts,
        ]);

        res.status(StatusCodes.OK).json(
            Object.entries(cardsDroppedQuantityMap).map((entry) => {
                const card = cards.find((card) => card.name === entry[0]);
                card["quantity"] = entry[1];
                card["artUrl"] = card.artPath;
                delete card.artPath;
                card["season"] = formatSeason(card["season"]) as CardSeason;
                return card;
            })
        );
    };

    POST.apiDoc = {
        summary: "Opens a card pack for the specified user.",
        parameters: [
            { $ref: "#/components/parameters/Username" },
            { $ref: "#/components/parameters/PackName" },
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
            [StatusCodes.CONFLICT.toString()]: {
                headers: {
                    "Retry-After": {
                        schema: {
                            type: "string",
                            example: "Wed, 21 Oct 2022 07:28:00 GMT",
                        },
                    },
                },
                description:
                    "Could not open the card pack as it is on cooldown.",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    required: ["message"],
                                },
                            },
                        },
                    },
                },
            },
            [StatusCodes.OK.toString()]: {
                description: "The card pack was opened successfully.",
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
                                                type: "number",
                                                minimum: 1,
                                            },
                                        },
                                        required: ["quantity"],
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
    return { POST };
}
