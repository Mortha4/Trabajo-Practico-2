import { OpenAPIV3 } from "openapi-types";
import { Operation } from "express-openapi";
import { prisma, PrismaError } from "../../../globals.js";
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

    POST.apiDoc = {
        parameters: [
            {
                in: "path",
                name: "username",
                schema: {
                    $ref: "#/components/schemas/StringIdentifier",
                },
            },
        ],
        requestBody: {
            description: "The credentials needed to crate a new Session",
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
                                },
                            },
                        },
                    },
                },
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                description: "The user specified does not exist.",
            },
            [StatusCodes.UNAUTHORIZED.toString()]: {
                description: "Wrong credentials.",
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
        responses: {
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "The session was successfully terminated.",
            },
        },
        security: [
            {
                CookieAuth: [],
            },
        ],
    };
    return { POST, DELETE };
}
