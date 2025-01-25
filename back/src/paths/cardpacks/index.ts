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
        summary: "Lists available card packs.",
        responses: {
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError"
            },
            [StatusCodes.OK.toString()]: {
                description: "Successful query.",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: {
                                        $ref: "#/components/schemas/StringIdentifier"
                                    },
                                    title: {
                                        type: "string",
                                        example: "Daily Card Pack"
                                    },
                                    wrapperImageUrl: {
                                        type: "string",
                                        example: "http://www.example.com/packwrapper.jpeg",
                                        readOnly: true
                                    },
                                    drops: {
                                        type: "array",
                                        items: {
                                            $ref: "#/components/schemas/CardClass"                                                            
                                        }
                                    }
                                }
                            }
                        },
                    },
                },
            },
        },
    };

    const POST: Operation = async (req, res) => {
        const { name, title, drops } = req.body;
        const lootEntries = drops.map(cardName => (
            {
                create: {
                    cardName
                },
                where: {
                    packName_cardName: {
                        packName: name,
                        cardName
                    }
                }
            }
        ));
        try {
            await prisma.cardPackType.create({
                data: {
                    name,
                    title,
                    drops: {
                        connectOrCreate: lootEntries 
                    }
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
                    errors: [{message: `${fields[0]} already exists. A new cardpack cannot be created with the same value.`}],
                });
                return;
            } else if (error.code === PrismaError.FOREIGN_KEY_CONSTRAINT_VIOLATION) {
                const status = StatusCodes.BAD_REQUEST;
                res.status(status).json({
                    status,
                    errors: [{message: `A card specified in the drops list does not exist.`}],
                });
                return;
            }
            throw error;
        }
    };

    const postCardPackSchema = {
        allOf: [
            {
                properties: {
                    name: {
                        $ref: "#/components/schemas/StringIdentifier"
                    }
                }
            },
            { $ref: "#/components/schemas/CardPackData" },
        ]
    };

    POST.apiDoc = {
        summary: "Creates a new card pack.",
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: postCardPackSchema
                },
                "application/x-www-form-urlencoded": {
                    schema: postCardPackSchema,
                },
            },
        },
        responses: {
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError"
            },
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized"
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden"
            },
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest"
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
