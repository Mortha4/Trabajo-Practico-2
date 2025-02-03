import { Request } from "express";
import { Operation } from "express-openapi";
import { StatusCodes } from "http-status-codes";
import { prisma, PrismaError, SecurityScopes } from "../../../globals";
import { OpenAPIV3 } from "openapi-types";

export default function () {
    const GET: Operation = async (req: Request, res) => {
        const { username } = req.params;
        const user = await prisma.flattenedUser.findUnique({
            select: {
                username: true,
                profileName: true,
                privilege: true,
                profilePicturePath: true,
                email: true,
                createdAt: true,
                cardsSeen: true,
                cardsCollected: true,
            },
            where: {
                username,
            },
        });
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "User specified does not exist.",
            });
            return;
        }
        user["profilePictureUrl"] = user.profilePicturePath;
        delete user.profilePicturePath;
        res.status(StatusCodes.OK).json(user);
    };

    GET.apiDoc = {
        summary: "Gives information related to the specified user.",
        parameters: [
            {
                $ref: "#/components/parameters/Username",
            },
        ],
        security: [
            {
                CookieAuth: [SecurityScopes.Self],
            },
        ],
        responses: {
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized",
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden",
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                $ref: "#/components/responses/NotFound",
            },
            [StatusCodes.OK.toString()]: {
                description: "Successful query.",
                content: {
                    "application/json": {
                        schema: {
                            allOf: [
                                { $ref: "#/components/schemas/User" },
                                {
                                    properties: {
                                        cardsSeen: {
                                            type: "integer",
                                            minimum: 0,
                                        },
                                        cardsCollected: {
                                            type: "integer",
                                            minimum: 0,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
    };

    const PATCH: Operation = async (req, res) => {
        const { username } = req.params;
        const {
            username: newUsername,
            profileName: newProfileName,
            email: newEmail,
            password,
            newPassword,
        } = req.body;

        const savedUser = await prisma.userData.findUnique({
            select: {
                password: true,
            },
            where: {
                username,
            },
        });

        if (!savedUser) {
            // explicit 404 is necessary as admins can bypass Self requirement
            res.status(StatusCodes.NOT_FOUND).json({
                message: "User specified does not exist.",
            });
            return;
        }

        if (password !== savedUser.password) {
            res.status(StatusCodes.BAD_REQUEST).json({
                errors: [{ message: "Invalid password." }],
            });
            return;
        }

        try {
            await prisma.userData.update({
                data: {
                    username: newUsername,
                    profileName: newProfileName,
                    email: newEmail,
                    password: newPassword,
                },
                where: {
                    username: username,
                },
            });
        } catch (error) {
            if (error.code === PrismaError.UNIQUE_CONSTRAINT_VIOLATION) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    errors: [
                        {
                            message: `${error.meta.target[0]} already exists. Cannot update to the same value.`,
                        },
                    ],
                });
                return;
            }
            throw error;
        }
        //TODO: invalidate sessions with old password
        res.status(StatusCodes.NO_CONTENT).send();
    };

    const patchRequestSchema: OpenAPIV3.SchemaObject = {
        allOf: [
            { $ref: "#/components/schemas/User" },
            {
                properties: {
                    newPassword: {
                        $ref: "#/components/schemas/Password",
                    },
                    password: {
                        $ref: "#/components/schemas/Password",
                    },
                },
                required: ["password"],
            },
        ],
    };

    PATCH.apiDoc = {
        summary: "Updates the specified user.",
        parameters: [
            {
                $ref: "#/components/parameters/Username",
            },
        ],
        requestBody: {
            content: {
                "application/json": {
                    schema: patchRequestSchema,
                },
                "application/x-www-form-urlencoded": {
                    schema: patchRequestSchema,
                },
            },
        },
        security: [
            {
                CookieAuth: [SecurityScopes.Self],
            },
        ],
        responses: {
            [StatusCodes.NOT_FOUND.toString()]: {
                $ref: "#/components/responses/NotFound",
            },
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized",
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden",
            },
            [StatusCodes.BAD_REQUEST.toString()]: {
                $ref: "#/components/responses/BadRequest",
            },
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "User was updated successfully.",
            },
        },
    };

    const DELETE: Operation = async (req, res) => {
        const { username } = req.params;

        try {
            await prisma.$transaction([
                prisma.user.update({
                    where: {
                        username,
                    },
                    data: {
                        deletedAt: new Date(),
                    },
                }),
                prisma.userData.delete({
                    where: {
                        username,
                    },
                }),
            ]);
        } catch (error) {
            if (error.code !== PrismaError.REQUIRED_RECORD_NOT_FOUND)
                throw error;

            res.status(StatusCodes.NOT_FOUND).json({
                message: "User specified does not exist.",
            });
            return;
        }

        res.status(StatusCodes.NO_CONTENT).send();
    };

    DELETE.apiDoc = {
        summary: "Deletes the specified user.",
        parameters: [
            {
                $ref: "#/components/parameters/Username",
            },
        ],
        security: [
            {
                CookieAuth: [SecurityScopes.Self],
            },
        ],
        responses: {
            [StatusCodes.NOT_FOUND.toString()]: {
                $ref: "#/components/responses/NotFound",
            },
            [StatusCodes.UNAUTHORIZED.toString()]: {
                $ref: "#/components/responses/Unauthorized",
            },
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
            [StatusCodes.FORBIDDEN.toString()]: {
                $ref: "#/components/responses/Forbidden",
            },
            [StatusCodes.NO_CONTENT.toString()]: {
                description: "User was deleted successfully.",
            },
        },
    };
    return { GET, PATCH, DELETE };
}
