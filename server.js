const fs = require("fs").promises;
const path = require("path");

const express = require("express");
const server = express();

// template engine
server.set("view engine", "pug");
server.set("views", path.join(__dirname, "template"));

// request parser
server.use(
    express.urlencoded({ extended: true, limit: "1mb" }),
    express.json({ extended: true, limit: "1mb" })
);

// public path
server.use(express.static(path.join(__dirname, "public")));

// consts
const LOG_NAME_MAP = path.join(__dirname, "data", "log-name-mapping");

server.post("/logs", async (req, res) => {
    const today = new Date();
    const timestamp = ""
        + today.getFullYear()
        + `${today.getMonth() + 1}`.padStart(2, "0")
        + `${today.getDate()}`.padStart(2, "0")
        + "_"
        + `${today.getHours()}`.padStart(2, "0")
        + `${today.getMinutes()}`.padStart(2, "0")
        + `${today.getSeconds()}`.padStart(2, "0")
    ;
    await fs.writeFile(
        path.join(__dirname, "data/logs", timestamp),
        JSON.stringify(req.body)
    );
    console.log("The file has created suscessfully.");
    res.sendStatus(200);
});

server.get("/logs", async (_, res) => {
    const mapping = await fs.readFile(LOG_NAME_MAP);
    const lines = mapping.toString().split("\n");
    const files = await fs.readdir(path.join(__dirname, "data/logs"));
    const fileList = files.map(file => {
        const record = lines.find(line => line.includes(file));
        const name = record ? record.split("\t")[1] : null;
        return { id: file, name: name};
    });
    res.render("logs-index", { files: fileList });
});

server.get("/logs/:id", async (req, res) => {
    const content = await fs.readFile(path.join(__dirname, "data/logs", req.params.id));
    res.render("log-detail", {data: JSON.parse(content)});
});

server.put("/logs/:id/rename", async (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    const mapping = await fs.readFile(LOG_NAME_MAP);
    const lines = mapping.toString().split("\n");
    const result =
        lines
            .filter(line => line != "")
            .filter(line => !line.includes(id))
            .concat(`${id}\t${name}`)
    ;
    await fs.writeFile(LOG_NAME_MAP, result.join("\n"));
    res.sendStatus(200);
});

server.delete("/logs/:id", async (req, res) => {
    const id = req.params.id;
    await fs.unlink(path.join(__dirname, "data/logs", id));
    const mapping = await fs.readFile(LOG_NAME_MAP);
    const lines = mapping.toString().split("\n");
    const result =
        lines
            .filter(line => line != "")
            .filter(line => !line.includes(id))
    ;
    await fs.writeFile(LOG_NAME_MAP, result.join("\n"));
    res.sendStatus(204);
})

server.listen(3333, () => console.log("listening at 3333 port ..."));