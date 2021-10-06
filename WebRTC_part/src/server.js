// Backend
import http from "http";
import SocketIO from "socket.io";
import express from "express";    

const app = express();

app.set("view engine", "pug"); // Pug로 view engine 설정
app.set("views", __dirname + "/views"); // Express에 template이 어딨는지 지정 
app.use("/public", express.static(__dirname + "/public")); // public url 생성 -> user에게 파일 공유
app.get("/", (_, res) => res.render("home")); // home.pug를 render 해주는 route handler 만듬
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app); // webSocket을 하려면 꼭 필요한 부분임 => server가 만들어짐. 경로는 app.js
const wsServer = SocketIO(httpServer);

// socket에는 이미 room 기능이 내장되어 있음
// socket.to(room) : room 전체에 message를 보낼 수 있음 | emit("an event") : string인 an event를 보낼 수 있음
wsServer.on("connection", (socket) => {
    socket.on("join_room", (roomName) => {  // join_room : event 
        socket.to(roomName).emit("welcome");  // roomName 방에 들어가서 welcome 채팅 보냄
});
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
  });
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
  });
    socket.on("ice", (ice, roomName) => {
      socket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);

// import {Server} from "socket.io";
// import { instrument } from "@socket.io/admin-ui";

// const app = express();

// app.set("view engine", "pug");
// app.set("views", __dirname + "/views");
// app.use("/public", express.static(__dirname + "/public"));
// app.get("/", (_,res) => res.render("home"));
// app.get("/*", (_,res) => res.redirect("/"));

// const httpServer = http.createServer(app);
// const wsServer = new Server(httpServer, {
//     cors: {
//         origin: ["https://admin.socket.io"],
//         credentials: true,
//     },
// });

// instrument(wsServer, {
//     auth: false,
// });

// function publicRooms(){
//     const {
//         sockets: {
//             adapter: {sids, rooms},
//         },
//     } = wsServer;
//     const publicRooms = [];
//     rooms.forEach((_, key) => {
//         if(sids.get(key) === undefined){
//             publicRooms.push(key);
//         }
//     });
//     return publicRooms;    
// }

// function countRoom(roomName){
//     return wsServer.sockets.adapter.rooms.get(roomName)?.size;
// }

// SocketIO에서는 기본적으로 user와 server 사이에 private room이 존재
// wsServer.on("connection", (socket) => {
//     socket["nickname"] = "Anon";
//     socket.onAny((event) => {  // onAny : 어떤 event에서도 console.log 가능
//         console.log(`Socket Event: ${event}`);
//     });
//     socket.on("enter_room", (roomName, done) => {
//         socket.join(roomName); // roomName의 방으로 참가
//         done();
//         socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
//         wsServer.sockets.emit("room_change", publicRooms());
//     });
//     socket.on("offer", (offer, roomName) => {
//         socket.to(roomName).emit("offer", offer);
//     });
//     socket.on("disconnecting", () => {
//         socket.rooms.forEach((room) =>  // socket.rooms : socket이 어느 방에 있는지 알고 싶을 때
//             socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)  // disconnect -> bye 출력
//         );
//     });
//     socket.on("disconnect", () => {
//         wsServer.sockets.emit("room_change", publicRooms());
//     });
//     socket.on("new_message", (msg, room, done) => {  // 어떤 방으로 message를 보내야하는지 알 수 있음
//         socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
//         done();
//     });
//     socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
// });

// ========= http 서버, webSocket 서버 둘 다 만듬. 꼭 안 그래도 됨
// http protocol과 ws connection 지원함
// http를 만든 이유는, views, statifc files, home, redirection을 원하기 때문
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server }); // wss : WebSocket Server - 서버를 전달해줄 수 있음. http 서버 위에 wetSocket 서버 만듬

// const sockets = [];

// wss.on("connection", (socket) => { // connection이 생기면서 socket을 받음
//     sockets.push(socket);
//     socket["nickname"] = "Anon"; // socket에 nickname을 줌
//     console.log("Connected to Browser");
//     socket.on("close", onSocketClose);   // close를 listen 해줌
//     socket.on("message", (roomName) => { // socket이 message를 보낼때까지 기다림
//         const message = JSON.parse(roomName);
//         switch (message.type){   // message.type에 따른 switch문
//             case "new_message":  // message type이 new_message인 경우
//                 sockets.forEach((aSocket) =>
//                  aSocket.send(`${socket.nickname}: ${message.payload}`)  // nickname property를 socket object에 저장
//                 );
//             case "nickname":
//                 socket["nickname"] = message.payload;    // 사용자로부터 받은 nickname을 socket에 넣어줌 => socket 안에 정보 저장 가능!
//         }
//     });
// });

// const handleListen = () => console.log('Listening on http://localhost:3000');
// httpServer.listen(3000, handleListen);
