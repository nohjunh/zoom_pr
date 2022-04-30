const socket = new WebSocket(`ws://${window.location.host}`); //Websocket이 프론트와 백엔드를 브라우저에서 연결해주는 것을 지원함. // 이렇게 써줌으로써 프론트와 백엔드가 연결됨
//const socket= new webSocket("ws://localhost:3000")와 동일 //ws는 프로토콜, localhost:3000은 url
// window.location하면 내가 어디에 있는지 알려줌 -> .host를 통해 localhost:3000 이 나오게 할 수 있다.
// new WebSocket의 반환값을 socket변수에 저장하고 이 socket변수를 통해 백엔드와 실시간 통신을 할 수 있게 된다.

socket.addEventListener("open", ()=>{ // callback function을 익명함수로 해서 프론트에서 소켓이 열렸다는 event를 받으면 다음 log를 띄움.
    console.log("connectd to server"); 
});

socket.addEventListener("message", (message) => { // message event를 받으면 message값을 인자로 넣어서 해당 값 출력
    console.log("New message: ", message.data, "from the Server"); // message의 data 값 출력
});

socket.addEventListener("close", ()=>{ // 서버와 연결 끊김.
    console.log("disconnected from server");
});

// 10초뒤에 브라우저에서 백엔드로 data전송
setTimeout( ()=> { //setTimeout 함수를 통해 첫번째 인자로 들어오는 함수를 두번째 인자값인 10초뒤에 수행.
    socket.send("hello from the browser!");
}, 10000); 