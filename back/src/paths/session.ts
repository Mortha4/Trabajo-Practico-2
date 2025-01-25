import { OpenAPIV3 } from "openapi-types";
import { Operation } from "express-openapi";
import { prisma, PrismaError, SecurityScopes } from "../globals.js";
import { StatusCodes } from "http-status-codes";
import { Request } from "express";
import Username from "./users/{username}/index.js";

export default function () {
    const GET: Operation = async (req: Request, res) => {
        res.status(StatusCodes.OK).json({
            username: req.user.username,
            privilege: req.user.privilege
        })
    };

    GET.apiDoc = {
        summary: "Lists session details.",
        responses: {
            [StatusCodes.OK.toString()]: {
                description: "Successful query.",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                username: {
                                    $ref: "#/components/schemas/StringIdentifier"
                                },
                                privilege: {
                                    type: "string"
                                }
                            },
                            required: ["username", "privilege"]
                        }
                    }
                }
            },
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized"
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError"
            },
        },
        security: [
            {
                CookieAuth: []
            }
        ]
    }; 

    const POST: Operation = async (req: Request, res) => { 
        req.session.userId = req.user.id;
        res.status(StatusCodes.OK).json({ token: req.session.id });
    };

    POST.apiDoc = {
        summary: "Creates a new session.", 
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
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized",
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
        },
        security: [
            {
                BasicAuth: []
            }
        ]
    };

    const DELETE: Operation = async (req, res) => {
        req.session.destroy(() => {
            res.status(StatusCodes.NO_CONTENT).send();
        });
    };

    DELETE.apiDoc = {
        summary: "Terminates the current session.",
        responses: {
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized"
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
                CookieAuth: [],
            },
        ],
    };
    return { GET, POST, DELETE };
}
