import { OpenAPIV3 } from "openapi-types";
import {
    PrismaClient,
    Prisma,
    CardSeason,
    UserPrivilege,
} from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, SecurityScopes, prisma } from "../../globals.js";

export default function () {
    const DELETE: Operation = async (req, res) => {
        const { cardName } = req.params;

        try {
            await prisma.cardClass.delete({
                where: { name: cardName },
            });
            res.status(StatusCodes.NO_CONTENT).send();
            return;
        } catch (error) {
            if (error.code === PrismaError.REQUIRED_RECORD_NOT_FOUND) {
                const status = StatusCodes.NOT_FOUND;
                res.status(status).send();
                return;
            }
        }
    };

    DELETE.apiDoc = {
        summary: "Deletes a card.",
        parameters: [{ $ref: "#/components/parameters/CardName" }],
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
            [StatusCodes.NOT_FOUND.toString()]: {
                $ref: "#/components/responses/NotFound"
            },
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "The card was deleted successfully.",
            },
        },
        security: [
            {
                CookieAuth: [SecurityScopes.Admin],
            },
        ],
    };

    const PATCH: Operation = async (req, res) => {
        const { cardName } = req.params;
        const { title, season, description, rarity } = req.body;

        try {
            await prisma.cardClass.update({
                where: { name: cardName },
                data: {
                    title,
                    season,
                    description,
                    rarity,
                },
            });
            res.status(StatusCodes.NO_CONTENT).send();
            return;
        } catch (error) {
            if (error.code === PrismaError.REQUIRED_RECORD_NOT_FOUND) {
                const status = StatusCodes.NOT_FOUND;
                res.status(status).send();
                return;
            }
        }
    };

    PATCH.apiDoc = {
        summary: "Updates a card.",
        parameters: [{ $ref: "#/components/parameters/CardName" }],
        requestBody: {
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/CardClassData",
                    },
                },
                "application/x-www-form-urlencoded": {
                    schema: {
                        $ref: "#/components/schemas/CardClassData",
                    },
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
                description: "The card was updated successfully.",
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                $ref: "#/components/responses/NotFound"
            },
        },
        security: [
            {
                CookieAuth: [SecurityScopes.Admin],
            },
        ],
    };

    return { DELETE, PATCH };
}
