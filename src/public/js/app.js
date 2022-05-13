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
  // #msg form 안에 있는 input을 찾아준다.
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event){
  event.preventDefault();
  // #name form 안에 있는 input을 찾아준다.
  const input = room.querySelector("#name input");
  const value = input.value;
  socket.emit("nickname", input.value);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  // handleMessageSubmit에서 #msg form안에 있는 input을 찾아준다.
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
  // handleNicknameSubmit에서 #name form 안에 있는 input을 찾아준다. 
  const nameForm = room.querySelector("#name");
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleNicknameSubmit(event){
  event.preventDefault();
  const input= room.querySelector("input");
  const value = input.value;
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
  addMessage(`${user} arrived!`);
});

socket.on("bye", (left) => {
  addMessage(`${left} left ㅠㅠ`);
});

socket.on("new_message", addMessage);
//socket.on("room_change", console.log) // //socket.on("room_change", (msg)=> console.log(msg));와 동일


socket.on("room_change", (rooms)=>{
  const roomList = welcome.querySelector("ul"); //welcome의 ul를 받아서 roomList로 만듬
  roomList.innerHTML = ""; // roomList의 모든 것을 비워줌
  
  if(rooms.length===0){ // rooms가 없는 상태로 오면, 내 어플리케이션에 room이 하나도 없을 때
    roomList.innerHTML = ""; // roomList의 모든 것을 비워줌
    return;
  }
  rooms.forEach(room => { // 각각의 room에
    const li = document.createElement("li"); // li element를 만들어주고
    li.innerText = room; // innerText로 li에 room을 넣어준다.
    roomList.append(li);// 새로운 li를 roomList에 append
  });
});
