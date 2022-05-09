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

wsServer.on("connection", (socket) => { // connection event 결과로 반환된 front와 연결된
                                        // socket을 인자로 
  socket.on("enter_room", (msg, done) => { // socket.on의 인자 event로 원하는 event를 적어주고
                                           // 두 번째 인자인 msg에 front로부터 JSON 객체({ payload: input.value }를 받고,
                                           // 세 번째 인자에는 front가 보낸 function이 done으로  들어감.
    console.log(msg); // 서버는 frone로부터 받은 JSON을 출력하고
    // 서버는 10초 후에 front-end에서 function을 실행시킬 것이다. -> 즉, 서버 back-end에서 해당 function을 호출하지만
    // 해당 function은 front-end에서 실행된다. 
    setTimeout(() => { // 10초후에 front에서 보낸 done() function 호출하면 frone-end에서 해당 function이 실행될 것이다.
      done();
    }, 10000);
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