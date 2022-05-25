const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];// videotracks이 첫 번째 track을 가져온다.
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId; // camera는 forEach 인자
      option.innerText = camera.label;
      // 만약 카메라 option이 현재 선택된 카메라와 같은 label을 가지고 있다면
      // 이게 현재 사용되고 있는 카메라이다.
      if (currentCamera.label === camera.label) { // currentCamera의 label이 camera의 label과 같다면
        option.selected = true; // 그 옵션은 선택된거
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
// 비디오를 다시 시작하게 하는 함수로 쓰임. -> getMedia를 한번 더 수행하면 됨.
// getMedia를 할 때 마다 카메라를 가져옴
async function getMedia(deviceId) { // getMedia가 argument를 하나 받도록 함.
  const initialConstrains = { // 초기constrains 설정 (deviceID없이 처음에 getMedia를 호출했을 때 실행)
                              // cameras를 만들기 전에 호출됨.
    audio: true,
    video: { facingMode: "user" },
  };
  // deviceID가 있을 때 cameraConstraints를 가진다.
  const cameraConstraints = {
    audio: true,
    // deviceID가 있고 exact: deviceId로 하면 브라우저가 이 deviceID만 사용하고 만약 찾지못하면
    // 비디오가 표시되지 않는다.
    // 유저로부터 getMedia함수의 인자로 deviceID를 받았기 때문.
    video: { deviceId: { exact: deviceId } },
  };
  try {
    // getUserMedia 함수를 호출할 때 마다 constraints를 보내야 한다.
    myStream = await navigator.mediaDevices.getUserMedia(
      // deviceID가 있다면 cameraConstraints를 사용, 없다면 초기 constraints를 사용
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) { // 만약 deviceID가 없다면 카메라값을 가져온다. 이건 처음에
                    // 실행할 때 딱 한번 실행됨.
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

getMedia(); // deviceID없이 getMedia를 호출

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
  // handleCameraChange를 할 때 getMedia function을 불러준다.
  // getMedia function으로 사용하려는 특정 카메라 Id를 전송한다.
  await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
//select에서 input이 변경됐는지 확인해야 됨.
//유저가 select를 변경할 때 getMedia를 다시 해줌.
camerasSelect.addEventListener("input", handleCameraChange);