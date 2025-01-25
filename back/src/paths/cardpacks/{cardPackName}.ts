import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, SecurityScopes, prisma } from "../../globals.js";

export default function () {
    const DELETE: Operation = async (req, res) => {
        const { cardPackName } = req.params;

        try {
            await prisma.cardPackType.delete({
                where: { name: cardPackName },
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
        summary: "Deletes a card pack.",
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
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "The card pack was deleted successfully.",
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                description: "The card pack specified does not exist.",
            },
        },
        security: [
            {
                CookieAuth: [SecurityScopes.Admin],
            },
        ],
    };

    const PATCH: Operation = async (req, res) => {
        const { cardPackName } = req.params;
        const { title, season, description, rarity } = req.body;

        try {
            await prisma.cardClass.update({
                where: { name: cardPackName },
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
            else {
                throw error
            }
        }
    };

    PATCH.apiDoc = {
        summary: "Updates a card pack.",
        parameters: [
            {
                in: "path",
                name: "cardPackName",
                schema: {
                    $ref: "#/components/schemas/StringIdentifier",
                },
            },
        ],
        requestBody: {
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/CardPackData",
                    },
                },
                "application/x-www-form-urlencoded": {
                    schema: {
                        $ref: "#/components/schemas/CardPackData",
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
                description: "The card pack was updated successfully.",
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
