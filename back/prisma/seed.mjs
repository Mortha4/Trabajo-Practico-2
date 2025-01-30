import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const rarity = await prisma.rarity.createMany({
    data: [
        { name: "Common", dropProbability: 1 },
        { name: "Rare", dropProbability: 0.333 },
    ],
});

const cardTest1 = await prisma.cardClass.createMany({
    data: [
        {
            name: "carta1",
            title: "Carta de prueaba 1",
            season: "Season1",
            description: "Esta es la carta de prueba 1",
            rarity: "Common",
        },
        {
            name: "carta2",
            title: "Carta de prueaba 2",
            season: "Season1",
            description: "Esta es la carta de prueba 2",
            rarity: "Common",
        },
        {
            name: "carta3",
            title: "Carta de prueaba 3",
            season: "Season1",
            description: "Esta es la carta de prueba 3",
            rarity: "Rare",
        },
    ],
});

const testPack = await prisma.cardPackType.create({
    data: {
        name: "paquete_prueba",
        title: "Paquete de prueba",
        drops: {
            create: [{ cardName: "carta1" }, { cardName: "carta2" }],
        },
    },
});

const testPackEpic = await prisma.cardPackType.create({
    data: {
        name: "paquete_prueba_epico",
        title: "Paquete de prueba epico",
        drops: {
            create: [{ cardName: "carta3" }],
        },
    },
});

const user = await prisma.user.create({
    data: {
        data: {
            create: {
                username: "admin",
                profileName: "Perfil de prueba",
                email: "prueba@gmail.com",
                password: "admin",
                privilege: "Administrator",
            },
        },
        collection: {
            create: [
                {
                    cardName: "carta1",
                    quantity: 4,
                },
                {
                    cardName: "carta2",
                    quantity: 1,
                },
                {
                    cardName: "carta3",
                    quantity: 2,
                },
            ],
        },
        packOpening: {
            create: [
                {
                    packName: "paquete_prueba",
                    details: {
                        create: [
                            {
                                cardName: "carta1",
                                quantity: 4,
                            },
                            {
                                cardName: "carta2",
                                quantity: 1,
                            },
                        ],
                    },
                },
            ],
        },
    },
});

const user2 = await prisma.user.create({
    data: {
        data: {
            create: {
                username: "marxel",
                profileName: "Marxel_Pro",
                email: "marxelpro@gmail.com",
                password: "Breaking_Bad_TCG",
            },
        },
        collection: {
            create: [
                {
                    cardName: "carta3",
                    quantity: 5,
                },
            ],
        },
        packOpening: {
            create: [
                {
                    packName: "paquete_prueba_epico",
                    details: {
                        create: [
                            {
                                cardName: "carta3",
                                quantity: 5,
                            },
                        ],
                    },
                },
            ],
        },
    },
});

await prisma.$disconnect();
