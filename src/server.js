import express from "express";
import { handle } from "express/lib/application";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug"); // pug로 view engine 설정
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));// home.pug를 render해주는 route handler
// 유저가 "홈"으로 get request를 보내면 (app.get("/")) template으로 반응(res.render("home"))

app.get("/*", (req,res) => res.redirect("/")); // 유저가 "/아무거나" 요청하면 "/"으로 리다이렉트
//유저가 어떤 페이지로 GET request를 보내도 redirect로 반응

const handleListen= () => console.log('Listening on http://localhoost:3000');

// 이건 http서버
const server = http.createServer(app); //express application으로부터 서버 만들기

//이건 webSOcket서버
const wss = new WebSocket.Server({ server });
// 위와 같이 하면 http서버랑 webSocket서버 둘 다 작동 가능 // 2개가 같은 port에 있게 됨.
// 즉, http서버 위에 websocket 서버를 만드는거 -> localhost는 2개의 프로토콜을 동일한 port에서 http, ws request 둘 다 처리가능
// "http://localhoost:3000" + "ws://localhoost:3000"


function handleConnetion(socket){ // socket은 서버(나)와 브라우저의 연결
    console.log(socket);
}

wss.on("connection", handleConnetion); // on method에서는 event가 발동하는걸 기다린다. 여기서 event는 connection
                                       // connection 이벤트 발생시 handleConnetion function 수행
                                       // on method는 socket을 통해 backend에 연결된 클라이언트의 정보를 제공함
server.listen(3000, handleListen);


