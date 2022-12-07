const fs = require("fs");
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

server.post("/logs", (req, res) => {
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
    const logsDir = path.join(__dirname, "data", "logs");
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    fs.writeFileSync(
        path.join(logsDir, timestamp),
        JSON.stringify(req.body)
    );
    console.log("The file has created successfully.");
    res.sendStatus(200);
});

server.get("/logs", (_, res) => {
    let fileList = [];
    const logsDir = path.join(__dirname, "data", "logs");
    if (fs.existsSync(logsDir)) {
        let mapping = [];
        if (fs.existsSync(LOG_NAME_MAP)) {
            const mappingFileContent = fs.readFileSync(LOG_NAME_MAP);
            mapping = mappingFileContent.toString().split("\n");
        }
        const files = fs.readdirSync(logsDir);
        fileList = files.map(file => {
            const entry = mapping.find(entry => entry.includes(file));
            const name = entry ? entry.split("\t")[1] : null;
            return { id: file, name: name };
        });
    }
    res.render("logs-index", { files: fileList });
});

server.get("/logs/:id", (req, res) => {
    const file = path.join(__dirname, "data/logs", req.params.id);
    if (!fs.existsSync(file)) {
        res.sendStatus(404);
        return;
    }
    const content = fs.readFileSync(file);
    res.render("log-detail", {data: JSON.parse(content)});
});

server.put("/logs/:id/rename", (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    if (!fs.existsSync(path.join(__dirname, "data/logs", id))) {
        res.sendStatus(404);
        return;
    }
    let mapping = [];
    if (fs.existsSync(LOG_NAME_MAP)) {
        const mappingFileContent = fs.readFileSync(LOG_NAME_MAP);
        mapping = mappingFileContent.toString().split("\n");
    }
    const result =
        mapping
            .filter(entry => entry != "")
            .filter(entry => !entry.includes(id))
            .concat(`${id}\t${name}`)
    ;
    fs.writeFileSync(LOG_NAME_MAP, result.join("\n"));
    res.sendStatus(200);
});

server.delete("/logs/:id", (req, res) => {
    const id = req.params.id;
    const file = path.join(__dirname, "data/logs", id);
    if (!fs.existsSync(file)) {
        res.sendStatus(404);
        return;
    }
    fs.unlinkSync(file);
    if (fs.existsSync(LOG_NAME_MAP)) {
        const mappingFileContent = fs.readFileSync(LOG_NAME_MAP);
        const mapping = mappingFileContent.toString().split("\n");
        const result =
            mapping
                .filter(entry => entry != "")
                .filter(entry => !entry.includes(id))
        ;
        fs.writeFileSync(LOG_NAME_MAP, result.join("\n"));
    }
    res.sendStatus(204);
});

server.listen(3333, () => console.log("listening at 3333 port ..."));