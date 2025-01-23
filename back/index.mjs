import express from "express";
import { initialize } from "express-openapi";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import fs from "fs";
import session from "express-session";
import validateAllResponses from "./src/middleware/validateAllResponses.js";
import { prisma } from "./src/globals.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import isAuthenticated from "./src/middleware/isAuthenticated.js";
import { StatusCodes } from "http-status-codes";
import { error } from "console";

const PORT = process.env.EXPRESS_PORT ?? 3000;

const app = express();

const docsPath = import.meta.dirname + "/src/api-doc.yaml";
const apiDoc = YAML.parse(fs.readFileSync(docsPath).toString());

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
        CookieAuth: isAuthenticated,
    },
    errorMiddleware: (err, req, res, next) => {
        if (!err) next();
        else if (err.status) res.status(err.status).json(err);
        else {res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
        console.log(err)};
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
    swaggerUi.setup(null, { swaggerOptions: { url: "/docs.json" } })
);

app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
