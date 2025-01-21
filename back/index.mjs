import express from "express";
import { initialize } from "express-openapi";
import { PrismaClient } from "@prisma/client";

const PORT = process.env.EXPRESS_PORT ?? 3000;

const app = express();

initialize({
    app,
    apiDoc: import.meta.dirname + "/src/api-doc.yaml",
    paths: import.meta.dirname + "/src/paths",
    routesGlob: "*.{ts,js}",
    routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
    promiseMode: true,
    dependencies: {
        prisma: new PrismaClient(),
    },
    errorMiddleware: (err, req, res, next) => {
        if (err) {
            console.log(err);
            res.status(400).json(err);
        } else next();
    },
    consumesMiddleware: {
        "application/json": express.json(),
        "application/x-www-form-urlencoded": express.urlencoded({
            extended: true,
        }),
    },
});

app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
