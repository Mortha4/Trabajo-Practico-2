import { OpenAPIV3 } from "openapi-types";
import { Operation } from "express-openapi";
import { prisma, PrismaError, SecurityScopes } from "../../../globals.js";
import { StatusCodes } from "http-status-codes";

export default function () {
    const POST: Operation = async (req, res) => {
        const { username } = req.params;
        const { password } = req.body;

        const user = await prisma.flattenedUser.findUnique({
            select: {
                id: true,
                password: true,
            },
            where: {
                username,
            },
        });

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).send();
            return;
        }

        if (user.password !== password) {
            res.status(StatusCodes.UNAUTHORIZED).send();
            return;
        }
        req.session.userId = user.id;

        res.status(StatusCodes.OK).json({ token: req.session.id });
    };

    const postRequestSchema: OpenAPIV3.SchemaObject = {
        type: "object",
        properties: {
            password: {
                $ref: "#/components/schemas/Password",
            },
        },
    };

    // TODO: transition to Basic authentication
    POST.apiDoc = {
        summary: "Creates a new session.",
        parameters: [
            {
                $ref: "#/components/parameters/Username",
            },
        ],
        requestBody: {
            description: "The credentials needed to crate a new session.",
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
            [StatusCodes.OK.toString()]: {
                description: "The session was created successfully.",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["token"],
                            properties: {
                                token: {
                                    type: "string",
                                    example: "abcde12345"
                                },
                            },
                        }
                    },
                },
                headers: {
                    "Set-Cookie": {
                        schema: {
                            type: "string",
                            example: "token=abcde12345; Path=/; HttpOnly"
                        }
                    }
                }           
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                // TODO: add middleware under /users/{username} to check if user exists
                $ref: "#/components/responses/NotFound"
            },
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized",
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
        },
    };

    const DELETE: Operation = async (req, res) => {
        req.session.destroy(() => {
            res.status(StatusCodes.NO_CONTENT).send();
        });
    };

    DELETE.apiDoc = {
        summary: "Terminates the current session.",
        parameters: [{ $ref: "#/components/parameters/Username" }],
        responses: {
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized"
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden"
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                $ref: "#/components/responses/NotFound"
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError"
            },
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "The session was successfully terminated.",
            },
        },
        security: [
            {
                CookieAuth: [SecurityScopes.Self],
            },
        ],
    };
    return { POST, DELETE };
}
