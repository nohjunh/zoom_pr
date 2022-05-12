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
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome");
  });
  // disconnecting은 접속을 중단하지만, 아직 방을 완전히 나가지는 않은 상태
  // disconnecting을 통해 클라이언트가 서버와 연결이 끊어지기 전에 마지막으로 메세지를 보낼 수 있게 할 수 있다.
  socket.on("disconnecting", () => {
    // socket.rooms의 반환값은 set이기에 iterable반복이 가능.
    // foreach로 돌면서 해당 socket이 접속해있는 모든 방에 차례로 접근해
    // room에 있는 모든 클라이언트들에게 bye event 발생.
    socket.rooms.forEach((room) => socket.to(room).emit("bye"));
  });
  // 백엔드로 new_message event가 들어오면 emit함수의 인자들이 차례로 msg, room,done에 할당되고
  // done()함수를 실행하라고 지시하면 front에서 지정한 emit함수의 세번 째 인자인 익명함수가 front에서 실행됨. 
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", msg); // 인자로 들어온 room에 있는 모든 클라이언트에게
                                              // new_message event 발생시킴.
    done(); // 백엔드에서 done호출시 front에서 실행함.
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