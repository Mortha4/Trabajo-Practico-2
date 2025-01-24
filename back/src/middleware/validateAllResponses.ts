import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
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
            const rawBody = args[0] ?? null;
            let validation;
            let parseError = false;
            try {
                const body = JSON.parse(rawBody);
                validation = res.validateResponse(
                    res?.statusCode?.toString(),
                    body
                );
            } catch (error) {
                console.error("Cannot parse response: ", error);
                parseError = true;
            }
            if (validation || parseError) {
                console.error(
                    `[ERROR]: Invalid response on ${req.path}\n`,
                    validation
                );
                return send.apply(
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR),
                    [
                        JSON.stringify({
                            message: "The server produced an invalid response.",
                        }),
                    ]
                );
            }
            return send.apply(res, args);
        };
    } else console.warn("[WARN] Response doesnt have validator");
    next();
}
