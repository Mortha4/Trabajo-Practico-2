import express from "express";
import { initialize } from "express-openapi";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import fs from "fs";
import session from "express-session";
import validateAllResponses from "./src/middleware/validateAllResponses.js";
import { prisma } from "./src/globals.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { cookieAuth, basicAuth } from "./src/middleware/Authentication.js";
import { StatusCodes } from "http-status-codes";
import cors from "cors";
const PORT = process.env.API_PORT ?? 3000;

const app = express();

const docsPath = import.meta.dirname + "/src/api-doc.yaml";
// TODO: change all POST endpoints responding with status 204 (No Content) to status 201 (Created) + Location header + body
// TODO: make unique constraint violations respond with 409 instead of 400
// TODO: respond 304 (Not Modified) for empty PATCHes
const apiDoc = YAML.parse(fs.readFileSync(docsPath).toString());

app.use(
    cors({
        origin: [process.env.FRONT_URL, process.env.API_URL],
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
    })
);

initialize({
    app,
    apiDoc: {
        ...apiDoc,
        "x-express-openapi-additional-middleware": [validateAllResponses],
    },
    docsPath: "/docs.json",
    paths: import.meta.dirname + "/src/paths",
    routesGlob: "**/**.{ts,js}",
    routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
    promiseMode: true,
    dependencies: {
        prisma,
    },
    validateApiDoc: true,
    consumesMiddleware: {
        "application/json": express.json(),
        "application/x-www-form-urlencoded": express.urlencoded({
            extended: true,
        }),
    },
    securityHandlers: {
        CookieAuth: cookieAuth,
        BasicAuth: basicAuth,
    },
    errorMiddleware: (err, req, res, next) => {
        if (err.status) {
            //TODO: check for OpenAPIRequestValidatorError
            res.status(err.status).json(err);
        } else {
            console.error(
                `[ERROR]: An unknown error occurred in ${req.path}\n`,
                err
            );
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "An unknown internal server error occurred.",
            });
        }
    },
});

const SESSION_LENGTH_MS = 1000 * 1800;
const DAY_MS = 24 * 60 * 60 * 1000;
app.use(
    session({
        secret: "at shadow's edge shatter the twilight reverie",
        saveUninitialized: false,
        resave: false,
        name: "token",
        cookie: {
            maxAge: SESSION_LENGTH_MS,
            sameSite: "lax",
            domain: process.env.API_DOMAIN,
        },
        store: new PrismaSessionStore(prisma, {
            dbRecordIdIsSessionId: true,
            checkPeriod: DAY_MS,
        }),
    })
);

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(null, { swaggerOptions: { url: "/api/v1/docs.json" } })
);

app.use(express.static(import.meta.dirname + "/public"));

app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
