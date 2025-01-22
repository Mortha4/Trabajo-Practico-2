import { PrismaClient, Prisma, CardSeason,  } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, prisma, } from "../../../globals.js";


export default function () {
    const GET: Operation = async (req, res) => {
        const { rarity } = req.query
        try {
            const cards = await prisma.cardClass.findMany({
                where: {rarityName: {in:rarity}}
            });
            res.json(cards);
        } catch (error) {
            if (error.code === PrismaError.REQUIRED_RECORD_NOT_FOUND) {
                const status = StatusCodes.NOT_FOUND;
                res.status(status).send()
                return;
            }
        }
    };

    GET.apiDoc = {
        summary: "Returns a list of cards according to their rarity",
        parameters: [
            {
                in:"query",
                name: "rarity",
                schema: {
                    type: "array",
                    items: {
                        $ref: "#/components/schemas/Rarity",
                    }
                },
                description: "List the cards according to their rarity"
            }
        ],
        responses: {
            [StatusCodes.OK.toString()]: {
                description: "A list of cards according to their rarity",
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
                description: "Rarity not found.",
            },
        },
    };

    return {  };
}
    