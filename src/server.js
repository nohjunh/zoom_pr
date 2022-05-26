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
  socket.on("join_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome");
  });
  // 서버는 offer event를 받으면 브라우저로부터 받은 그 브라우저의 offer값이랑 roomName을 인자로 받음
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer); // 그 방에 있는 모든 브라우저에게 해당 offer값을 다 보내줌.
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);  