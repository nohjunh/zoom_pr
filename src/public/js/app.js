const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
// carmerasSelect를 가져와서 많은 option들을 만들 것임.
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

// getCameras()함수는 async function으로 만듬
// 
async function getCameras() {
  try {
    // getCameras() 함수는 navigator.mediaDevices.enumerateDevices()를 호출해서 devices 변수에 저장
    // enumerateDevice() 함수는 백엔드에 연결된 클라이언트의 미디어장치를 포함한 모든 장치를 알려준다.
    // ex) 컴퓨터에 연결되거나 모바일이 가지고 있는 장치 정보들을 devices에 저장함.
    const devices = await navigator.mediaDevices.enumerateDevices();
    // filter함수는 각각의 device들을 filter해줄거고 videoinput이라는 kind를 가진 device만 찾아 cameras변수에 넣어준다.
    const cameras = devices.filter((device) => device.kind === "videoinput");
    // cameras들을 forEach로 돌면서 각각의 camera에 option을 만듬.
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      // 설정한 option값을 camerasSelect에 넣어줌.
      camerasSelect.appendChild(option);
      // 결과는, 우리에게 연결된 모든 video장치별 option값들을 camerasSelect변수에 저장해놓게 됨.
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    myFace.srcObject = myStream;
    await getCameras(); // getCameras() 호출
  } catch (e) {
    console.log(e);
  }
}

getMedia();

function handleMuteClick() {
  // Mute버튼 클릭 시 handleMuteClick 함수가 실행되고
  // stream을 가져올 수 있다.
  // Mystream.getAudioTracks()을 통해 Audio track을 가져옴
  // track.enable 값을 지금과 정반대로 만듬. -> track.enabled에 새로운 값 설정하는 과정
  myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  // Audio부분과 동일한 내용.
  myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);