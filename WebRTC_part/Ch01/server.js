// Backend
import http from "http";
import SocketIO from "socket.io";
import express from "express";    
import { appendFileSync } from "fs";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug"); // Pug로 view engine 설정
app.set("views", __dirname + "/views"); // Express에 template이 어딨는지 지정 
app.use("/public", express.static(__dirname + "/public")); // public url 생성 -> user에게 파일 공유
app.get("/", (_, res) => res.render("home")); // home.pug를 render 해주는 route handler 만듬
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// const httpServer = http.createServer(app); // webSocket을 하려면 꼭 필요한 부분임 => server가 만들어짐. 경로는 app.js
// const wsServer = SocketIO(httpServer);

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

function onSocketClose() {
    console.log("Disconnected from the Browser X");
}

function onSocketMessage(msg) {
    const parsed = JSON.parse(msg);
    switch (parsed.type) {
        case "new_message":
            sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`));
        case "nickname":
            socket["nickname"] = message.payload;
    }
}

// fake DB
const sockets = [];

// 각 browser와 연결될 때마다 사용됨
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";    // nickname을 지정하지 않은 사람들
    console.log("Connected to Browser !");
    socket.on("close", onSocketClose);
    socket.on("message", onSocketMessage);
    socket.send("Hello!");
});

server.listen(3000, handleListen);
