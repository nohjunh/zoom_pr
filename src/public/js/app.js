const socket = io();

const welcome = document.getElementById("welcome");
// form을 가져옴
const form = welcome.querySelector("form");

function handleRoomSubmit(event) {
  event.preventDefault();

  const input = form.querySelector("input");// form 안에서 input을 가져옴
  // SOcketIO에서는 socket.send가 아니라 emit을 씀.
  // emit을 통해 특정한 event 즉, 어떤 이름이든 상관없이 event 명을 직접 정해서 emit해줄 숭 ㅣㅆ음
  // 이전과 달리 message event만을 통해 메세지를 보내는게 아니라,
  // "enter_room" 이라는 event를 emit해주는 것임.
  // argument는 object가 될 수 있음. -> object를 인자로 보냄
  // 이전에는 object를 string으로 변환시키고 그 다음에 string을 전송했지만,
  // SocketIO에서는 알아서 처리해줄테니 string으로 바꿀 필요 없이 그냥 바로 object를 보내면 됨.
  socket.emit("enter_room", { payload: input.value }, () => { // emit 함수의 세번째 인자에는 서버로부터 실행되는 
                                                              // 즉, 서버에서 호출하는 callback function을 넣어줌. 
    console.log("server is done!");
  });
  input.value = ""; // input.value를 비워둠.
}

// submit event 발생시 callback function 실행 
form.addEventListener("submit", handleRoomSubmit);