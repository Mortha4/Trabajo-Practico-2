import { OpenAPIV3 } from "openapi-types";
import { PrismaClient, Prisma } from "@prisma/client";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import PrismaError from "../prisma-errors";

export default function () {
    const prisma = new PrismaClient();

    const GET: Operation = async (req, res) => {
        const users = await prisma.flattenedUser.findMany({
            select: {
                id: true,
                username: true,
                profileName: true,
                profilePicturePath: true,
                createdAt: true,
            },
        });
        res.status(200).json(users);
    };

    GET.apiDoc = {
        summary: "Returns a list of users",
        responses: {
            [StatusCodes.OK.toString()]: {
                description: "A list of users",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/User",
                            },
                        },
                    },
                },
            },
        },
    };

    const POST: Operation = async (req, res) => {
        const { username, profileName, email, password } = req.body;

        try {
            await prisma.user.create({
                data: {
                    data: {
                        create: {
                            username,
                            email,
                            profileName,
                            password,
                        },
                    },
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
                    errors: `${fields[0]} already exists. A new user cannot be created with the same value.`,
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
        required: ["username", "email", "profileName", "password"],
        additionalProperties: false,
        properties: {
            username: {
                description:
                    "A unique alphanumerical lowercase string that identifies the user.",
                type: "string",
                pattern: "^[a-z0-9_]+$",
            },
            email: {
                description:
                    "The email used for account management such as password change, notifications, etc.",
                format: "email",
                type: "string",
            },
            profileName: {
                description: "The display name used for most purposes.",
                type: "string",
            },
            password: {
                description: "The password used for authenticating.",
                type: "string",
                format: "password",
            },
        },
    };

    POST.apiDoc = {
        summary: "Creates a new User.",
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
                description: "The user was created successfully.",
            },
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest",
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                description: "An internal server error occurred.",
            },
        },
    };

    return { GET, POST };
}
