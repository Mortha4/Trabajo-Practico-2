import express from "express";
import fs from "fs";
import bodyParser from "body-parser";

const PORT = process.env.EXPRESS_PORT;

const app = express();
app.use(bodyParser.json());

const readData = () => {
    try {
        const data = fs.readFileSync("./db_prueba.json");
        return JSON.parse(data);
    } catch (error) {
        console.log(error);
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync("./db_prueba.json", JSON.stringify(data));
    } catch (error) {
        console.log(error);
    }
};

app.get("/", (req, res) => {
    res.send("<h1>LA API FUNCIONA PUTOS!!</h1>");
});

app.get("/miembros", (req, res) => {
    const data = readData();
    res.json(data.miembros);
});

app.get("/miembros/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const miembro = data.miembros.find((miembro) => miembro.id === id);
    res.json(miembro);
});

app.post("/miembros", (req, res) => {
    const data = readData();
    const body = req.body;
    const nuevoMiembro = {
        id: data.miembros.length + 1,
        ...body,
    };
    data.miembros.push(nuevoMiembro);
    writeData(data);
    res.json(nuevoMiembro);
});

app.put("/miembros/:id", (req, res) => {
    const data = readData();
    const body = req.body;
    const id = parseInt(req.params.id);
    const miembroId = data.miembros.findIndex((miembro) => miembro.id === id);
    data.miembros[miembroId] = {
        ...data.miembros[miembroId],
        ...body,
    };
    writeData(data);
    res.json({ message: "Usuario actualizado" });
});

app.delete("/miembros/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const miembroId = data.miembros.findIndex((miembro) => miembro.id === id);
    data.miembros.splice(miembroId, 1);
    writeData(data);
    res.json({ message: "Usuario eliminado" });
});

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
