const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

// emit함수의 마지막 인자인 backendDone() 함수를 backend에 보냄.
function backendDone(msg) { // back-end에서 넣어준 인자를 msg로 받음
  console.log(`The backend says: `, msg);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  // 또한 emit은 보낼 수 있는 인자의 수에
  // 상관없이, type에도 상관없이 여러 개를 보낼 수 있다.
  // 단, 끝날 때 실행되는 function을 보내고 싶으면 마지막 인자에
  // function 값을 넣어줘야 된다.
  // emit호출 결과, 백엔드는 2개의 argument(방 이름, call 할 function)를 받는다.
  socket.emit("enter_room", input.value, backendDone);
  input.value = ""; // input.value 값은 방의 이름.
}

form.addEventListener("submit", handleRoomSubmit);