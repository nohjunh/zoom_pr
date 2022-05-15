const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");


//  stream은 유저로부터 비디오와 오디오가 결합한 것
let myStream;
let muted = false; // 처음에는 소리가 나는 상태로 시작할거기에 false로 시작
let cameraOff = false; //마찬가지로 카메라off도 false로 시작

// getMedia() API
async function getMedia() {
  try {
    // navigator.mediaDevices.getUserMedia는 유저의 "유저미디어 string"을 줌
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true, // 내가 얻고 싶은 거 => audio
      video: true, // 내가 얻고 싶은 거 => video
    });
    // const myFace = document.getElementById("myFace");
    myFace.srcObject = myStream; // MyFace에 myStream에 저장된 값을 넣는다.
  } catch (e) {
    console.log(e);
  }
}

getMedia(); //

function handleMuteClick() { // "mute" == 음소거
  if (!muted) { // 음소거가 되어 있지 않다면,
    muteBtn.innerText = "Unmute"; // 음소거가 되어 있지 않으니까 버튼의 텍스트는 Unmute로 함.
                                  // 클릭하면 음소거가 되게 함.
    muted = true; // 음소거가 아닌 상태에서 버튼을 누르면 음소거가 됨.
  } else { // 음소거라면
    muteBtn.innerText = "Mute"; // 음소거가 되어있는 상태라면 버튼의 텍스트는 Mute
    muted = false;
  }
}
function handleCameraClick() {
  if (cameraOff) { // 카메라가 꺼져있다면, 버튼을 클릭할때 카메라가 켜지게 함.
    cameraBtn.innerText = "Turn Camera Off"; //버튼텍스트를 Off로 해서 카메라가 꺼져있음을 알려줌.
    cameraOff = false; // 카메라가 Off고 우리가 on을 하면 cameraOff 값은 false가 되어야 한다.
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}


//버튼을 클릭했다는 event인 click event가 발생하면 뒤에 callback 함수 실행
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);