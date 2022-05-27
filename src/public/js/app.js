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
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

// B브라우저가 서버로 부터 A브라우저가 보낸 icecandidate를 받는다.
socket.on("ice", (ice) => {
  console.log("received candidate");
  // A브라우저가 보낸 icecandidate를 myPeerConnection에 추가함.
  myPeerConnection.addIceCandidate(ice);
  // 이후에 B브라우저는 자신이 icecandidate event를 실행할거고 이걸 A브라우저에게 보낼 것이다.
  // 그러면, A브라우저도 icecandidate를 추가하게 되고 그후에 icecandidate 셋팅과정이 끝난다.
});

// RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  // myPeerConection을 만들면, 그 즉시 icecandidate event를 listen한다.
  myPeerConnection.addEventListener("icecandidate", handleIce);
  // addstream event 등록
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

// icecandidate event callback
function handleIce(data) {
  console.log("sent candidate");
  // candidate들(서로 소통할 방법들의 후보들)을 다시 다른 브라우저로 보낸다.
  // 즉, A브라우저의 모든 icecandidate들을 B브라우저로 보낸다.!
  socket.emit("ice", data.candidate, roomName);
}

// 자신의 peer로부터 event를 받아 실행되는 adddstrem event callback
function handleAddStream(data) { // 인자로 들어오는 data는 상대방의 peer stream 정보
                                // A브라우저라면, B브라우저의 peer stream이 인자에 담길 것이고
                                // B브라우저라면, A브라우저의 peer stream이 인자에 담긴다.

  // home.pug에 peerFace div값을 가져와서, 상대방 peer stream정보를 넣는다.
  // peerFace 태그는 myFace 태그와 마찬가지로 video 정보를 구성함. 
  // 그러면 자신의 브라우저 화면에 상대방의 video 화면도 같이 띄울 수 있게 된다.
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream; // peerFace의 비디오 셋팅
}