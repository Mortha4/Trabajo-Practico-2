import express from "express";
import { initialize } from "express-openapi";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import fs from "fs";

const PORT = process.env.EXPRESS_PORT ?? 3000;

const app = express();

const docsPath = import.meta.dirname + "/src/api-doc.yaml";
const apiDoc = YAML.parse(fs.readFileSync(docsPath).toString());

function validateAllResponses(req, res, next) {
    if (typeof res.validateResponse === "function") {
        const send = res.send;
        res.send = function expressOpenAPISend(...args) {
            const rawBody = args[0];
            try {
                const body = JSON.parse(rawBody);
                let validation = res.validateResponse(res.statusCode, body);
                if (validation)
                    console.error("[ERROR]: Invalid response\n", validation);
            } catch (error) {
                console.err("Cannot parse response: ", error);
            } finally {
                return send.apply(res, args);
            }
        };
    } else console.warn("[WARN] Response doesnt have validator");
    next();
}

initialize({
    app,
    apiDoc: {
        ...apiDoc,
        "x-express-openapi-additional-middleware": [validateAllResponses],
    },
    docsPath: "/docs.json",
    paths: import.meta.dirname + "/src/paths",
    routesGlob: "*.{ts,js}",
    routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
    promiseMode: true,
    dependencies: {
        prisma: new PrismaClient(),
    },
    validateApiDoc: true,
    consumesMiddleware: {
        "application/json": express.json(),
        "application/x-www-form-urlencoded": express.urlencoded({
            extended: true,
        }),
    },
    errorMiddleware: (err, req, res, next) => {
        if (err) {
            console.log(err);
            res.status(400).json(err);
        } else next();
    },
});

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(null, { swaggerOptions: { url: "/docs.json" } })
);

app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
