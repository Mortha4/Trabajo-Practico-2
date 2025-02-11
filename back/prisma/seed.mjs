import { CardSeason, PrismaClient } from "@prisma/client";
import moment from "moment";
const prisma = new PrismaClient();

const rarity = await prisma.rarity.createMany({
    data: [
        { name: "Common", dropProbability: 1 },
        { name: "Rare", dropProbability: 0.6 },
        { name: "Epic", dropProbability: 0.3 },
        { name: "MEME", dropProbability: 0.1 },
    ],
});

const cards = await prisma.cardClass.createMany({
    data: [
        {
            name: "walter_white",
            title: "Walter White",
            season: CardSeason.Season1,
            description:
                "Walter Hartwell White es un profesor de química que, tras ser diagnosticado con cáncer de pulmón inoperable, decide fabricar metanfetamina para poder mantener a su familia.",
            rarity: "Rare",
            artPath: "/cards/walter.jpg",
        },
        {
            name: "jesse_pinkman",
            title: "Jesse Pinkman",
            season: CardSeason.Season1,
            description:
                "Jesse era un consumidor, fabricante y traficante de poca monta de metanfetamina. El prestaba poca atención a las clases de química de su profesor, el propio Walter.",
            rarity: "Rare",
            artPath: "/cards/jesse.jpg",
        },
        {
            name: "skyler_white",
            title: "Skyler White",
            season: CardSeason.Season1,
            description:
                "Skyler White (de soltera Lambert) es la mujer de Walter White y madre de Walter White Jr. y Holly White. Skyler ha tenido múltiples trabajos o actividades para obtener dinero. ",
            rarity: "Rare",
            artPath: "/cards/skyler.jpg",
        },
        {
            name: "walter_jr",
            title: "Walter Jr.",
            season: CardSeason.Season1,
            description:
                "Walter Hartwell White Jr. o 'Flynn' es el hijo de Walter y Skyler White y el hermano de Holly White. Estudia en el mismo instituto en el que su padre imparte clases. ",
            rarity: "Rare",
            artPath: "/cards/walter_jr.jpg",
        },
        {
            name: "hank_schrander",
            title: "Henry 'Hank' Schrander",
            season: CardSeason.Season1,
            description:
                "Henry R. 'Hank' Schrader es el marido de Marie Schrader (hermana de Skyler White) y agente especial a cargo de las oficinas de la DEA en Albuquerque. ",
            rarity: "Rare",
            artPath: "/cards/hank.jpg",
        },
        {
            name: "marie_schrander",
            title: "Marie Schrander",
            season: CardSeason.Season1,
            description:
                "Marie Schrader (de soltera Lambert) es la hermana de Skyler White y mujer del agente de la DEA Hank Schrader. ",
            rarity: "Rare",
            artPath: "/cards/marie.jpg",
        },
        {
            name: "steve_gomez",
            title: "Steve Gomez",
            season: CardSeason.Season1,
            description:
                "fue compañero y buen amigo de Hank en las oficinas de la DEA de Albuquerque . Apodado 'Gomie' por Hank, a menudo colabora en la investigación de Heisenberg y el cristal azul. ",
            rarity: "Common",
            artPath: "/cards/steve.jpg",
        },
        {
            name: "carmen_molina",
            title: "Carmen Molina",
            season: CardSeason.Season1,
            description:
                "Carmen Molina es la directora del instituto J.P. Wynne, donde Walter es profesor de química. ",
            rarity: "Common",
            artPath: "/cards/carmen.jpg",
        },
        {
            name: "krazy_8",
            title: "Loco-8",
            season: CardSeason.Season1,
            description:
                "Domingo Gallardo Molina (alias 'Loco-8') es un distribuidor de metanfetamina previamente asociado con Jesse Pinkman y Emilio Koyama. ",
            rarity: "Common",
            artPath: "/cards/krazy.jpg",
        },
        {
            name: "tuco_salamanca",
            title: "Tuco Salamanca",
            season: CardSeason.Season1,
            description:
                "Tuco Salamanca es un traficante de drogas mexicano que actuó brevemente como distribuidor de metanfetamina para Walter White y Jesse Pinkman. ",
            rarity: "Rare",
            artPath: "/cards/tuco.jpg",
        },
        {
            name: "gretchen_schwartz",
            title: "Gretchen Schwartz",
            season: CardSeason.Season1,
            description:
                "Gretchen Schwartz es la antigua compañera de química de Walter y co-fundadora de Gray Matter Technologies. ",
            rarity: "Common",
            artPath: "/cards/gretchen.jpg",
        },
        {
            name: "skinny_pete",
            title: "Flaco Pete",
            season: CardSeason.Season1,
            description:
                "Peter 'Flaco Pete' es uno de los mejores amigos de Jesse. Cuando estuvo en la cárcel, donde conoció a Tuco Salamanca, a quien luego presenta a Jesse para que hagan negocios. ",
            rarity: "Common",
            artPath: "/cards/pete.jpg",
        },
        {
            name: "badger",
            title: "Badger",
            season: CardSeason.Season1,
            description:
                "Brandon 'Badger' Mayhew es uno de los tres amigos de Jesse que acaban haciendo negocios con él. Posteriormente, acaba trabajando en la venta del producto de Walter y Jesse. ",
            rarity: "Common",
            artPath: "/cards/badger.jpg",
        },
        {
            name: "combo",
            title: "Combo",
            season: CardSeason.Season1,
            description:
                "Christian 'Combo' Ortega es uno de los tres amigos de Jesse que trabajaron para él en el negocio del tráfico de su metanfetamina. ",
            rarity: "Common",
            artPath: "/cards/combo.jpg",
        },
        {
            name: "laboratory",
            title: "Camioneta de Heisenberg",
            season: CardSeason.Season1,
            description: "Jesse we need to cook",
            rarity: "Epic",
            artPath: "/cards/truck.jpg",
        },
        {
            name: "heisenberg",
            title: "Heisenberg",
            season: CardSeason.Season1,
            description:
                "Heisenberg es todo un ícono tanto en el mundo criminal cómo en las oficinas de la DEA, puesto que es irreconocible, y el único capaz de cocinar la famosa metanfetamina azúl. ",
            rarity: "Epic",
            artPath: "/cards/heisenberg.jpg",
        },
        {
            name: "meth",
            title: "Metanfetamina",
            season: CardSeason.Season1,
            description:
                "Fabricada por Walter y Jesse en un principio, esta era simple metanfetamina hecha por el modo de la pseudoefedrina. Su color común es el blanco.",
            rarity: "Common",
            artPath: "/cards/meth.jpg",
        },
        {
            name: "chili_meth",
            title: "Metanfetamina con chili",
            season: CardSeason.Season1,
            description:
                "Fabricada por Jesse y Emilio Koyama, antes de la asociación de este primero con Walter. Es metanfetamina con la diferencia de que el ingrediente secreto de esta era el chili.",
            rarity: "Rare",
            artPath: "/cards/chili_meth.jpg",
        },
        {
            name: "blue_meth",
            title: "Metanfetamina Azul",
            season: CardSeason.Season1,
            description:
                "Walter y Jesse tuvieron que cocinar la metanfetamina con una alternativa siendo esta la metilamina, que le otorgaba un color característico al cristal siendo este el azul.",
            rarity: "Epic",
            artPath: "/cards/blue_meth.jpg",
        },
        {
            name: "meme_1",
            title: "Kid Named Finger",
            season: CardSeason.Season1,
            description: "I'm not having sex with you right now, Waltuh.",
            rarity: "MEME",
            artPath: "/cards/meme1.jpg",
        },
        {
            name: "meme_2",
            title: "Senior Guait",
            season: CardSeason.Season1,
            description: "¿Ke quieres Yesi?",
            rarity: "MEME",
            artPath: "/cards/meme2.jpg",
        },
        {
            name: "meme_3",
            title: "SCIENCE BITCH",
            season: CardSeason.Season1,
            description: "YEAH, SCIENCE BITCH",
            rarity: "MEME",
            artPath: "/cards/meme3.jpg",
        },
        {
            name: "meme_4",
            title: "Walter desnudo",
            season: CardSeason.Season1,
            description: "El inicio de todo",
            rarity: "MEME",
            artPath: "/cards/meme4.jpg",
        },
        {
            name: "meme_5",
            title: "Say my name",
            season: CardSeason.Season1,
            description: "You're goddamn right!",
            rarity: "MEME",
            artPath: "/cards/meme5.jpg",
        },
    ],
});

const PackBasic = await prisma.cardPackType.create({
    data: {
        name: "paquete_basico",
        title: "Pack Basico",
        drops: {
            create: [
                { cardName: "walter_white" },
                { cardName: "jesse_pinkman" },
                { cardName: "skyler_white" },
                { cardName: "walter_jr" },
                { cardName: "hank_schrander" },
                { cardName: "marie_schrander" },
                { cardName: "steve_gomez" },
                { cardName: "carmen_molina" },
                { cardName: "krazy_8" },
                { cardName: "tuco_salamanca" },
                { cardName: "gretchen_schwartz" },
                { cardName: "skinny_pete" },
                { cardName: "badger" },
                { cardName: "combo" },
                { cardName: "laboratory" },
                { cardName: "meth" },
                { cardName: "chili_meth" },
                { cardName: "blue_meth" },
                { cardName: "meme_1" },
                { cardName: "meme_2" },
                { cardName: "meme_3" },
                { cardName: "meme_4" },
                { cardName: "meme_5" },
                { cardName: "heisenberg" },
            ],
        },
        dropQuantity: 3,
        cooldown: moment.duration({ seconds: 10 }),
        wrapperImagePath: "/logo-pack.png",
    },
});

const PackRare = await prisma.cardPackType.create({
    data: {
        name: "paquete_raro",
        title: "Pack Raro",
        drops: {
            create: [
                { cardName: "skyler_white" },
                { cardName: "hank_schrander" },
                { cardName: "tuco_salamanca" },
            ],
        },
        dropQuantity: 3,
        cooldown: moment.duration({ seconds: 10 }),
        wrapperImagePath: "/walter-white.png",
    },
});

const PackEpic = await prisma.cardPackType.create({
    data: {
        name: "paquete_epico",
        title: "Pack Epico",
        drops: {
            create: [
                { cardName: "combo" },
                { cardName: "heisenberg" },
                { cardName: "blue_meth" },
            ],
        },
        dropQuantity: 3,
        cooldown: moment.duration({ seconds: 10 }),
        wrapperImagePath: "/heisenberg.png",
    },
});

const user = await prisma.user.create({
    data: {
        data: {
            create: {
                username: "admin",
                profileName: "Perfil de prueba",
                email: "prueba@gmail.com",
                password: "password",
                privilege: "Administrator",
            },
        },
        collection: {
            create: [
                { cardName: "walter_white", quantity: 1 },
                { cardName: "jesse_pinkman", quantity: 1 },
                { cardName: "skyler_white", quantity: 1 },
                { cardName: "walter_jr", quantity: 1 },
                { cardName: "hank_schrander", quantity: 1 },
                { cardName: "marie_schrander", quantity: 1 },
                { cardName: "steve_gomez", quantity: 1 },
                { cardName: "carmen_molina", quantity: 1 },
                { cardName: "krazy_8", quantity: 1 },
                { cardName: "tuco_salamanca", quantity: 1 },
                { cardName: "gretchen_schwartz", quantity: 1 },
                { cardName: "skinny_pete", quantity: 1 },
                { cardName: "badger", quantity: 1 },
                { cardName: "combo", quantity: 1 },
                { cardName: "laboratory", quantity: 1 },
                { cardName: "meth", quantity: 1 },
                { cardName: "chili_meth", quantity: 1 },
                { cardName: "blue_meth", quantity: 1 },
                { cardName: "heisenberg", quantity: 1 },
                { cardName: "meme_1", quantity: 1 },
                { cardName: "meme_2", quantity: 1 },
                { cardName: "meme_3", quantity: 1 },
                { cardName: "meme_4", quantity: 1 },
                { cardName: "meme_5", quantity: 1 },
            ],
        },
        packOpening: {
            create: [
                {
                    packName: "paquete_basico",
                    details: {
                        create: [
                            {
                                cardName: "combo",
                                quantity: 1,
                            },
                            {
                                cardName: "badger",
                                quantity: 1,
                            },
                            {
                                cardName: "heisenberg",
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
                    cardName: "combo",
                    quantity: 3,
                },
            ],
        },
        packOpening: {
            create: [
                {
                    packName: "paquete_basico",
                    details: {
                        create: [
                            {
                                cardName: "combo",
                                quantity: 3,
                            },
                        ],
                    },
                },
            ],
        },
    },
});

await prisma.$disconnect();
