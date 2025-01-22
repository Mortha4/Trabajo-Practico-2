import { UserPrivilege } from "@prisma/client";
import StatusCodes from "http-status-codes";
import { prisma } from "../globals";

export default async function isAdministrator(req, res, next) {

    const userId = req.session.userId
        const user = await prisma.user.findUnique({
            select: {data:{select:{privilege:true}}},
            where: {id:userId}
        })

        if (user.data.privilege !== UserPrivilege.Administrator){
            res.status(StatusCodes.FORBIDDEN).send();
            return;
        }
    next()
}