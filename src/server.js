import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.on("enter_room", (roomName, done) => {
    console.log(roomName);
    setTimeout(() => {
      // 중요한거는 
      // done()함수를 server.js 즉, 백엔드에서 실행하는게 아니라
      // done function이 호출되면 front-end에서 done에 인자로
      // 전달한 function이 실행될 것이다. why? front에서 보낸 function의 내용이
      // 신뢰하지 못하는 code context라면 문제 발생할 수 있음.
      // 따라서, back-end에서는 실행버튼만 눌러주는거라고 생각하면 된다.
      // 추가로, back-end에서 이 function에 argument를 넣어줄 수 있따.

      done("hello from the backend"); 
    }, 15000); // 15초 후에 done()을 call 할 것이다.
  });
});

/*
const wss = new WebSocket.Server({ server });
const sockets = [];
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Browser ✅");
  socket.on("close", onSocketClose);
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case "nickname":
        socket["nickname"] = message.payload;
    }
  });
}); */

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);