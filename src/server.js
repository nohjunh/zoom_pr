import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


const sockets = [];

//back-end에서는 front로부터 전송받은 string(Javascript object->string)을 다시 Javascript object(JSON object)로 바꿔야 된다. 
wss.on("connection", (socket) => {
  sockets.push(socket);
  // socket은 기본적으로 객체.
  socket["nickname"] = "Anon"; // socket에 익명닉네임을 부여하는 과정. nickname을 정하지 않은 유저를 고려해 anonymous라는  값을 넣어주는 것.
  console.log("Connected to Browser");

  socket.on("close", ()=>{
    console.log("Disconnected from the Browser");  
  });

  socket.on("message", (msg) => { // socket이 message를 보내면 message event가 발생하고
                                  // 그 결과, 인자로 받은 msg는 string(Javascript object->string) 형식이다.
    const message = JSON.parse(msg); // JSON.parse는 string -> JavaScript object 
    switch (message.type) { // message의 type을 기준으로 분기작성
      case "new_message": // message event를 일으킨 socket이 보낸 message를 sockets배열 안에 있는 다른 모든 브라우저클라이언트들에게도 전달
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`) // event를 일으킨 해당 socket 할당 유저의 닉네임과 messsage를 보냄. 
        );
      case "nickname":
        socket["nickname"] = message.payload;  // 닉네임을 payload값으로 변경
    }
  });
});

server.listen(3000, handleListen);