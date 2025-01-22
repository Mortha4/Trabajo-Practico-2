import { OpenAPIV3 } from "openapi-types";
import { PrismaClient, Prisma, CardSeason } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, prisma } from "../../globals.js";
import isAdministrator from "../../middleware/isAdministrator.js";


export default function () {
    const GET: Operation = async (req, res) => {
        const cards = await prisma.cardPackType.findMany({
            select: {
                title: true,
            },
        });
        res.json(cards);
    };

    GET.apiDoc = {
        summary: "Returns a list of cardpacks",
        responses: {
            [StatusCodes.OK.toString()]: {
                description: "A list of cardpacks",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/CardPackType",
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
                    title
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
        type: "object",
        required: ["name", "title"],
        additionalProperties: false,
        properties: {
            name: {
                description:
                    "A unique alphanumerical lowercase string that identifies the cardpack.",
                type: "string",
                pattern: "^[a-z0-9_]+$",
            },
            title: {
                description:
                    "The visible name of the new cardpack.",
                type: "string",
            },
        },
    };
    
    POST.apiDoc = {
        summary: "Creates a new cardpack.",
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
                description: "The cardpack was created successfully.",
            },
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest",
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                description: "An internal server error occurred.",
            },
        },
        security: [
            {
                CookieAuth: [],
            },
        ],
    };

        

    return { GET, POST:[isAdministrator, POST] };
}
