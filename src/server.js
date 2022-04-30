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
// 유저가 해당 url로 가면, req와 res를 받고 response를 보냄

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


//websocket도 event가 있고 event가 발동될 때 사용할 function을 만들면 된다.
//websocket은 listen할 특정한 event명이 있고 추가적인 정보를 받을 function이 있다.

// on method에서는 event가 발동하는걸 기다린다. 여기서 event는 connection
// connection 이벤트 발생시 handleConnetion function 수행 -> 그러나, 익명함수를 통해 따로 handleConnetion function을 선언하지 않아도 on method안에서 다 처리 가능.
// on method는 socket을 통해 backend에 연결된 클라이언트의 정보를 제공함
// 익명함수를 통해 callback fuction을 on method문에서 바로 참조할 수 있도록 한다. -> socket이 어떤 상태인지 쉽게 파악할 수 있음
wss.on("connection", (socket) => { 
    //console.log(socket); => socket값을 인자로 받아서 console.log(socket)을 수행하는 익명함수를 포함한 on method
    console.log("Connected to browser"); // 브라우저가 서버에 연결된 클라이언트라고 생각하면 됨.
    socket.on("close", ()=>{ // backend에서 event를 listen할 때는 on method 사용. -> close event를 받고 익명함수 수행
        console.log("disconnected from the browser"); // 클라이언트의 web 브라우저가 꺼지면 이 문자열을 콘솔에 출력
    });
    socket.on("message", (message)=>{     // message event등록 // event를 발생시켜 전송받은 message인자값을 콘솔에 출력
        console.log(message);
    });
    socket.send("hello!!!"); // socket으로 data를 보냄.
});

server.listen(3000, handleListen);


