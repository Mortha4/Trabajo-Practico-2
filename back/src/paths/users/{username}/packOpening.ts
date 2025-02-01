import { PrismaClient, Prisma, PackOpening, Rarity } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, SecurityScopes, prisma } from "../../../globals.js";
import { string } from "yaml/dist/schema/common/string.js";
import { Schema } from "yaml";
import { OpenAPIV3 } from "openapi-types";
import { application } from "express";
import { log } from "console";

export default function () {
    const POST: Operation = async (req, res) => {
        const { packName } = req.body;
        
        const rarities:any[] = await prisma.$queryRaw`SELECT "Rarity".pk_name, "Rarity".drop_probability FROM "LootTable" INNER JOIN "CardClass"
                        ON "LootTable".pk_card_name = "CardClass".pk_name
                        INNER JOIN "Rarity" ON
                        "CardClass".rarity = "Rarity".pk_name
                        WHERE "LootTable".pk_pack_name = ${req.body.packName}
                        GROUP BY "Rarity".pk_name ORDER BY "Rarity".drop_probability ASC`

        const loot = await prisma.lootTable.findMany({
            where: { packName },
            select: { 
                card: true
            }
        });

        const cards = loot.map( card => {
            const cartas = card.card
            return cartas
        })
        
        const group = Object.groupBy(cards, ({rarity}) => rarity);
        
        const cardsDrop = []

        for (var i=0; i<3; i++){
                          
            let random = Math.random()
            let result

            for (const rarity of rarities) {
                if (random < rarity.drop_probability){
                    result = rarity.pk_name;
                    break
                }
            }

            if (!result){
                result = rarities[rarities.length-1].pk_name
            }

            const access = group[result]            

            let item = access[Math.floor(Math.random()*(access.length))];
            
            cardsDrop.push({...item})

            const cardName = item.name
            
            const userId = req.session.userId;
                        
            const keep = await prisma.collectionEntry.upsert({
                where: { userId_cardName:{cardName, userId} },
                update: {
                    cardName,
                    userId,
                    quantity: {increment: 1}
                },
                create: {
                    cardName,
                    userId,
                    quantity: 1
                }
            })
        };
        //console.log(cardsDrop);
        cardsDrop.forEach((card) => {
            console.log(card);
            card["artUrl"] = card.artPath;
            delete card.artPath;
            
        })
        //console.log(cardsDrop);
        
        res.status(StatusCodes.OK).json(cardsDrop);
    };
    
    const postRequestSchema: OpenAPIV3.SchemaObject = {
        type: "object",
        properties: {
            packName: {
                type: "string"
            }
        },
        required: [
            "packName"
        ]
    };

    POST.apiDoc = {
        summary: "Add cards to collection.",
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
                $ref: "#/components/responses/Unauthorized"
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden"
            },
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest"
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError"
            },
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "The card was created successfully.",
            },
            [StatusCodes.OK.toString()]: {
                description: "Successful query.",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/CardClass"
                            }
                        },
                    },
                },
            },
        },
        security: [
            {
                CookieAuth: [SecurityScopes.Admin],
            },
        ],
    };
    return { POST };
}