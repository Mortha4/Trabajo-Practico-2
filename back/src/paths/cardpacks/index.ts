import { OpenAPIV3 } from "openapi-types";
import { PrismaClient, Prisma, CardSeason } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, SecurityScopes, prisma } from "../../globals.js";

export default function () {
    const GET: Operation = async (req, res) => {
        const cards = await prisma.cardPackType.findMany({
            select: {
                name: true,
                title: true,
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

        cards.forEach((pack) => {
            pack["wrapperImageUrl"] = pack.wrapperImagePath;
            pack.drops.forEach((cardDropped) => {
                Object.assign(cardDropped, { ...cardDropped.card });
                delete cardDropped.card;
                cardDropped["artUrl"] = cardDropped["artPath"];
                delete cardDropped["artPath"];
            });
            delete pack.wrapperImagePath;
        });

        res.json(cards);
    };

    GET.apiDoc = {
        responses: {
            [StatusCodes.OK.toString()]: {
                description: "Lists available CardPacks.",
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
        const { name, title } = req.body;

        try {
            await prisma.cardPackType.create({
                data: {
                    name,
                    title,
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
                    errors: `${fields[0]} already exists. A new cardpack cannot be created with the same value.`,
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
        allOf: [
            { $ref: "#/components/schemas/CardPack" },
            {
                required: ["name", "title", "wrapperImageUrl", "drops"],
            },
        ],
    };

    POST.apiDoc = {
        summary: "Creates a new CardPack.",
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
                description: "The CardPack was created successfully.",
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
