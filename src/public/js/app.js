const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// room Element를 hidden 함수를 통해 front에서 보여지는 것을 숨김.
room.hidden = true;

let roomName; 

function addMessasge(message){
  const ul= room.querySelector("ul");
  const li = document.createElement("li"); // li태그를 추가해줌.
  li.innerText = message;
  ul.appendChild(li);
}

function showRoom() {
  welcome.hidden = true; // welcome Element를 숨기고
  room.hidden = false; // room Element를 front에 띄움.
  const h3 = room.querySelector("h3"); // document에서 찾은 room의 첫번째 요소에서
                                       // h3 element를 찾음.
  h3.innerText = `Room ${roomName}`; // h3 element 안의 text 값에 roomName을 적음.
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  // input.value에 적은 room이름을 가지고 enter_room event를 호출하면 
  // showRoom callback 함수를 실행
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value; // input.value 값에 적은 room 이름을 roomName변수에 저장
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

// SocketIO를 사용하므로 addEventListenter 대신 on을 써도 됨.
socket.on("welcome", ()=>{
  addMessasge("someone joined!");
})