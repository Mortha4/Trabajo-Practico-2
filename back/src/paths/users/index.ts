import { OpenAPIV3 } from "openapi-types";
import { Operation } from "express-openapi";
import StatusCodes from "http-status-codes";
import { PrismaError, prisma } from "../../globals.js";
export default function () {
    const GET: Operation = async (req, res) => {
        const users = await prisma.flattenedUser.findMany({
            select: {
                username: true,
                profileName: true,
                profilePicturePath: true,
                createdAt: true,
            },
        });
        users.forEach((user) => {
            user["profilePictureUrl"] = user.profilePicturePath;
            delete user.profilePicturePath;
        });
        res.status(StatusCodes.OK).json(users);
    };

    GET.apiDoc = {
        summary: "Lists registered users.",
        responses: {
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized"
            },
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
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/User",
                                    },
                                    {
                                        required: [
                                            "username",
                                            "profileName",
                                            "profilePictureUrl",
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
                CookieAuth: [],
            },
        ],
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
            if (error.code === PrismaError.UNIQUE_CONSTRAINT_VIOLATION) {
                const fields = error.meta.target as string[];
                const status = StatusCodes.BAD_REQUEST;
                res.status(status).json({
                    errors: [
                        {
                            message: `${fields[0]} already exists. A new user cannot be created with the same value.`,
                        },
                    ],
                });
                return;
            }
            throw error;

        }
    };

    const postRequestSchema: OpenAPIV3.SchemaObject = {
        allOf: [
            { $ref: "#/components/schemas/User" },
            {
                required: ["username", "profileName", "email", "password"],
            },
        ],
    };

    POST.apiDoc = {
        summary: "Creates a new user.",
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
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest"
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError"
            },
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "The user was created successfully.",
            },
        },
    };

    return { GET, POST };
}
