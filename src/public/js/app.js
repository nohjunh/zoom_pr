const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  // document에서 찾은 첫번째 room element 위치에서
  // input element의 위치를 input 상수에 저장.
  const input = room.querySelector("input");
  const value = input.value;
  // new_message event를  백엔드에 발생시킴.
  // 첫번쨰 argument인 input.value와 함께 백엔드로 보냄
  // 마지막 argumnet에는 백엔드에서 실행하라고 지시할 수 있는 function을 넣어줌
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`); // 현재 내 front에 메세지를 띄어줌.
  });
  input.value = "";
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const form = room.querySelector("form");
  form.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
  addMessage("someone joined!");
});

socket.on("bye", () => { // bye event가 발생하면 누군가가 나갔다는 의미이므로 addMessage에 인자로 넣어서 front에 출력시킴.
  addMessage("someone left ㅠㅠ");
});

socket.on("new_message", addMessage); // 이 구문과 밑의 구문은 완전히 동일
//socket.on("new_messsage", (msg) => {addMessage(msg)});