import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set('view engine', "pug");  // Pug로 view engine 설정
app.set("views", __dirname + "/views"); // Express에 template이 어딨는지 지정  
app.use("/public", express.static(__dirname + "/public"));  // public url 생성 -> user에게 파일 공유
app.get("/", (_, res) => res.render("home")); // home.pug를 render 해주는 route handler 만듬
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on ws://localhost:3000`);

const server = http.createServer(app); // webSocket을 하려면 꼭 필요한 부분임 => server가 만들어짐
const wss = new WebSocket.Server({server}); //webSocket Server

wss.on("connection", (socket) => {  // connection이 생기면서 socket을 받음
    console.log("Connected to Browser");
    socket.on("close", () => console.log("Disconeected from Server XXX"));  // backend
    socket.on("message", (message) => {   // 브라우저가 서버에 메세지를 보냈을 때를 위한 listener
        console.log(message);
    });
    socket.send("hello!!!");
});

server.listen(3000, handleListen);
