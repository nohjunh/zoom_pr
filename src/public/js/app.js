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

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall(); // 자신 media 정보를 가져가서 연결을 만들어주는 함수
  socket.emit("join_room", input.value); // A브라우저에게 자신이 들어왔다는 걸 알림
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code
// welcome event 처리부분은 A브라우저가 처리하는 부분
// "B브라우저에게서 발생한 방금 들어왔다는 event"를 A브라우저가 받음
// A브라우저에서 offer를 만들었을 때, 자신의 localDescription을 셋팅함. 
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer(); // A브라우저가 offer를 만들고, 
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  // A브라우저가 B브라우저에게 offer를 전송
  socket.emit("offer", offer, roomName);
});

// offer event 처리부분은 B브라우저가 처리하는 부분
// A브라우저는 offer를 생성하고, B브라우저는 answer를 생성하게 된다.
// B브라우저가 그 offer를 받아서, (즉, B브라우저가 A브라우저의 description을 받아서)
socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer); // B브라우저가 remoteDescription을 설정
  // 여기서 B브라우저가 answer를 생성하게 됨.
  const answer = await myPeerConnection.createAnswer(); // B브라우저가 answer를 생성하고
  myPeerConnection.setLocalDescription(answer); // 자신의 localDescription으로 answer를 셋팅함.
  // B브라우저가 A브라우저로 보낼 answer가 있을 때,
  // A브라우저가 이 answer에 대해 응답해야되므로 B브라우저에서 answer event를 발생시킴.
  socket.emit("answer", answer, roomName); // room이름도 같이 보냄. => 룸에 있는 모든 사람에게 answer 정보를 알릴 것이기 때문 
});

// 서버로부터 answer event를 받으면,
// 즉, B브라우저의 answer description이 서버를 통해 룸에 있는 모두에게 전달되고
// 룸에 있는 각 브라우저가 해당 answer description을 remoteDescription으로 설정한다.
socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

// RTC Code

// track들을 개별적으로 추가해주는 함수
function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}