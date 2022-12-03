const express = require("express");
const expressws = require("express-ws");
const fileupload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");

const app = express();
expressws(app);
app.use(fileupload());

const every_ws = {};

function IsJSON(json) {
    try {
        var a = JSON.parse(json);
        return a;
    } catch (e) {
        return false;
    }
};

app.ws("/ws", (ws, req) => {
    const id = uuid.v4();
    every_ws[id] = ws;
    ws.on("message", msg => {
        var isJson = IsJSON(msg);
        if (isJson) {
            var data = JSON.parse(msg);
            if (data.type == "message") {
                if (data.name == "") {
                    data.name = "Anonymous";
                };
                var data_read = JSON.parse(fs.readFileSync(path.join(__dirname, "chat.json")));
                data_read["history"].push({
                    "name": data.name,
                    "text": data.body
                });
                fs.writeFileSync(path.join(__dirname, "chat.json"), JSON.stringify(data_read));
                for (const property in every_ws) {
                    var socket = every_ws[property];
                    socket.send(JSON.stringify({
                        "type": "message",
                        "name": data.name,
                        "text": data.body
                    }));
                };
            } else if (data.type == "chat_history") {
                var chatHistory = fs.readFileSync("chat.json", "utf8");
                ws.send(JSON.stringify({
                    type: "chat_history",
                    body: chatHistory
                }));
            };
        };
    });
    var chatHistory = fs.readFileSync("chat.json", "utf8");
    ws.send(JSON.stringify({
        type: "chat_history",
        body: chatHistory
    }));
});

app.post("/upload", (req, res) => {
    var file_selected = req.files.files;
    if (!file_selected) { res.send("File not found!"); return; };
    var file_name = decodeURIComponent(file_selected.name);
    console.log(file_selected.name);
    fs.writeFileSync(path.join(__dirname, "uploads", file_name), file_selected.data);
    if (req.headers.name == "") {
        req.headers.name = "Anonymous";
    };
    var data_read = JSON.parse(fs.readFileSync(path.join(__dirname, "chat.json")));
    data_read["history"].push({
        "name": req.headers.name,
        "url": "/get_upload/" + file_name,
    });
    fs.writeFileSync(path.join(__dirname, "chat.json"), JSON.stringify(data_read));
    for (const property in every_ws) {
        var socket = every_ws[property];
        socket.send(JSON.stringify({
            "type": "file",
            "name": req.headers.name,
            "url": "/get_upload/" + file_name,
            "file_type": file_selected.mimetype
        }));
    };
    res.send("Uploaded!");
});

app.use("/download", (req, res) => {
    var find_src = path.join(__dirname, "uploads", req.path);
    if (fs.existsSync(find_src)) {
        res.download(find_src);
    } else {
        next();
    };
});

app.use("/get_upload", (req, res, next) => {
    var find_src = path.join(__dirname, "uploads", req.path);
    if (fs.existsSync(find_src)) {
        res.sendFile(find_src);
    } else {
        next();
    };
});

app.use("/public", (req, res, next) => {
    var find_src = path.join(__dirname, "public", req.path);
    if (fs.existsSync(find_src)) {
        res.sendFile(find_src);
    } else {
        next();
    };
});

app.use((req, res, next) => {
    res.sendFile(__dirname + "/src/chat.html");
});

app.listen(3000, () => {
    console.log("Server started on port 3000!");
});