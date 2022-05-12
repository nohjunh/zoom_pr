import http from "http";
import SocketIO from "socket.io";
import express from "express";
/*
socket.to("others").emit("an event", { some: "data"});
to함수의 인자로는 room의 이름이 들어가고
emit함수의 인자로는 발생시킬 event가 들어간다.
혹은
socket.to("room1").to("room2").emit("hello");
다수의 방에 event를 발생시킬 수도 있다.
to함수 안에 다른 소켓의id 값을 넣어주면 private하게 event를 보낼 수도 있다.
*/
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// connection event 결과로 반환된 socket에는 socket.id 값이 부여되어 있고
// 이 socket이 room에 배정되면 console.log(socket.rooms)을 했을 때 
// socket.id와 socket이 배정된 room의 이름이 set객체로 묶여 출력될 것이다.
// socekt.id의 값은 user와 server 사이의 private한 room이라고 생각하면 된다.
// 즉, user와 기본적으로 들어가 있는 방의 이름.
/////////////////////////////////////////////////////////////

wsServer.on("connection", (socket) => {
  socket.onAny((event) => { // onAny함수는 socket에 온 모든  event를 argument로 받음.
    console.log(`Socket Event: ${event}`); 
  });
  socket.on("enter_room", (roomName, done) => {
    // socketIO는 기본적으로 Room 기능을 제공해주는데,
    // join함수를 통해 인자로 room의 이름을 적어주면 room에 참가하는 기능을 제공. 
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome"); // "welcome" event를 roomName에 있는 모든 사람들에게 emit   
                                        // front가 welcome event에 반응할 것이다.
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