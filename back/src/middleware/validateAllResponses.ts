import { Request, Response, NextFunction } from "express";
import { IOpenAPIResponseValidator } from "openapi-response-validator";
declare module "express" {
    interface Response extends IOpenAPIResponseValidator {}
}

export default function validateAllResponses(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (typeof res.validateResponse === "function") {
        const send = res.send;
        res.send = function expressOpenAPISend(...args) {
            const rawBody = args[0];
            try {
                const body = JSON.parse(rawBody ?? null);
                let validation = res.validateResponse(
                    res.statusCode.toString(),
                    body
                );
                if (validation)
                    console.error("[ERROR]: Invalid response\n", validation);
            } catch (error) {
                console.error("Cannot parse response: ", error);
            } finally {
                return send.apply(res, args);
            }
        };
    } else console.warn("[WARN] Response doesnt have validator");
    next();
}
