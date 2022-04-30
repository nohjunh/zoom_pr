const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) { // type은 메세지의 종류로 구분, payload는 메세지에 담겨있는 정보
  const msg = { type, payload };
  return JSON.stringify(msg);
}

socket.addEventListener("open", ()=>{ // callback function을 익명함수로 해서 프론트에서 소켓이 열렸다는 event를 받으면 다음 log를 띄움.
    console.log("connectd to server"); 
});

socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server");
});

function handleSubmit(event) { // chat을 백엔드로 보내는 부분
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  const li = document.createElement("li");
  li.innerText = `You: ${input.value}`;
  messageList.append(li);
  input.value = "";
}

function handleNickSubmit(event) { // nickname을 백엔드로 보내는 부분
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);