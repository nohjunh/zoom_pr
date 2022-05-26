const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
// 1단계: 자신의 peerConnetion을 자신의 브라우저에 만든다.
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  socket.emit("join_room", input.value, startMedia);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code
// 다른 브라우저(B브라우저)가 접속하면 welcome event를 발생시킬것이고
// socket.on("welcom") 코드는 기존의 브라우저(A브라우저)들이 실행하게 된다.
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer(); // offer를 만든다.(자신의 브라우저가 어디에 있고 어떤 속성인지를 설명하는 offer값)
  myPeerConnection.setLocalDescription(offer); // mypeerConntion에 해당 offer값을 셋팅
  console.log("sent the offer");
  socket.emit("offer", offer, roomName); // roomName에 offer값을 인자로 보내는 용도의 event 발생 -> 서버가 이 emit event를 받는다.
});

// welcome event를 발생시킨 브라우저(B브라우저)가 기존의 브라우저(A브라우저)의 offer값을 해당 event를 통해 받는다.
socket.on("offer", (offer) => {
  // offer 값을 서버를 통해 주고 받고
  // 이 offer 값을 통해 이제 브라우저끼리 직접적으로 대화할 수 있게 된다.
  console.log(offer); // B브라우저에서 A브라우저의 offer값의 내용을 출력하는 것.
});

// RTC Code -> 실제로 연결을 만드는 함수들은 다음과 같다.

// 만약 A 브라우저가 "room" 에 먼저 들어가 있고
// B브라우저가 "room" 에 참가하면 B브라우저가 참가했다는 알림을 A브라우저가 받는다.
// 따라서, A브라우저가 offer를 만드는 행위를 시작하는 주체임.

//이 연결을 모든 곳에 공유한다-> 즉 자신의 stream을 공유한다. -> 누구나 stream에 접촉가능
function makeConnection() {
  myPeerConnection = new RTCPeerConnection(); // RTCPeerConnection을 만들고,
  // 방에 참가하면 오디오와 비디오 track이 만들어질것이며
  // 이 트랙들을 자신의 myPeerConnection stream에 추가한다.
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
    // 아직까지 이 함수를 통해서는  브라우저끼리 연결이 되지않은 상태
    // 각 자신들의 브라우저들을 구성만 함.
}