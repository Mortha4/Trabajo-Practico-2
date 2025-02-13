import { Operation } from "express-openapi";
import { Cookie } from "express-session";
import { StatusCodes } from "http-status-codes";
import { formatSeason, prisma, SecurityScopes } from "../../../../globals";

export default function () {
    const GET: Operation = async (req, res) => {
        const { username } = req.params;

        const { id: userId } =
            (await prisma.user.findUnique({
                select: {
                    id: true,
                },
                where: {
                    username,
                },
            })) ?? {};

        if (!userId) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "The user specified does not exist.",
            });
            return;
        }

        interface ResultRow {
            pk_name: string;
            last_opening: Date | null;
        }

        const lastPackOpenings: ResultRow[] = await prisma.$queryRaw`
            SELECT
                "CardPackType".pk_name,
                MAX("FilteredPackOpening".pk_opened_at) AS last_opening
            FROM
                "CardPackType"
                LEFT JOIN (
                    SELECT
                        *
                    FROM
                        "PackOpening"
                    WHERE
                        "PackOpening".pk_user_id = ${userId}
                ) AS "FilteredPackOpening" ON "CardPackType".pk_name = "FilteredPackOpening".pk_pack_name
            GROUP BY
                "CardPackType".pk_name;
        `;

        const lastOpeningMap: Record<string, Date> = Object.fromEntries(
            lastPackOpenings
                .entries()
                .map((entry) => [entry[1].pk_name, entry[1].last_opening])
        );

        const packs = await prisma.cardPackType.findMany({
            include: {
                drops: {
                    select: {
                        card: true,
                    },
                },
            },
        });

        packs.forEach((pack) => {
            pack.drops.forEach((card) => {
                Object.assign(card, card.card);
                delete card.card;
                card["artUrl"] = card["artPath"];
                delete card["artPath"];
                card["season"] = formatSeason(card["season"]);
            });
            pack["wrapperImageUrl"] = pack.wrapperImagePath;
            delete pack.wrapperImagePath;
            pack["lastOpened"] =
                lastOpeningMap[pack.name]?.toISOString() ?? null;
        });

        res.status(StatusCodes.OK).json(packs);
    };

    GET.apiDoc = {
        summary: "Lists card packs belonging to the specified user.",
        parameters: [{ $ref: "#/components/parameters/Username" }],
        security: [
            {
                CookieAuth: [SecurityScopes.Self],
            },
        ],
        responses: {
            [StatusCodes.INTERNAL_SERVER_ERROR.toString()]: {
                $ref: "#/components/responses/InternalServerError",
            },
            [StatusCodes.NOT_FOUND.toString()]: {
                $ref: "#/components/responses/NotFound",
            },
            [StatusCodes.OK.toString()]: {
                description: "Successful query.",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/CardPack",
                                    },
                                    {
                                        properties: {
                                            lastOpened: {
                                                type: "string",
                                                format: "date-time",
                                                nullable: true,
                                            },
                                        },
                                        required: ["lastOpened"],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
    };

    return { GET };
}
