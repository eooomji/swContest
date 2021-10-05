const socket = io();    // socket_io를 써주기 위함

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
  if(myPeerConnection){
    const videoSender = myPeerConnection.getSenders().
    find((sender) => sender.track.kind === "vdi");
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

// app.js welcome div에서 form을 가져옴
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
  const input = welcomeForm.querySelector("input"); // form 안에서 input을 가져옴
  await initCall();
  socket.emit("join_room", input.value);    // webSocket에서 socket.send 느낌. 메세지 보낼 필요 없고 원하는 거 emit만 해주면 됨
  // emit하면 argument를 보낼 수 있음. argument는 object가 될 수 있음 (webSocket에서 쓴 nickname 등과 같은)
  // 1. 특정한 event를 emit 해줄 수 있음. 어떤 이름이든 상관X
  // 2. object를 전송할 수 있음. 전처럼 string만 전송할 필요 없음
  // (1)event (2)payload (3)function
  roomName = input.value;
  input.value = ""; // input.value 비워주기
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
    console.log("receive the offer");
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

socket.on("ice", ice => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
});

// RTC Code

function makeConnection() {
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddstream);
    myStream
        .getTracks()
        .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data){
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
}

function handleAddstream(data){
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}
// const socket = io();

// const myFace = document.getElementById("myFace");
// const muteBtn = document.getElementById("mute");
// const cameraBtn = document.getElementById("camera");
// const camerasSelect = document.getElementById("cameras");
// const call = document.getElementById("call");

// call.hidden = true;

// let myStream;
// let muted = false;
// let cameraOff = false;
// let roomName;
// let myPeerConnection;

// async function getCameras(){
//     try {
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         const cameras = devices.filter(device => device.kind === "videoinput");
//         const currentCamera = myStream.getVideoTracks() [0];
//         cameras.forEach(camera => {
//             const option = document.createElement("option");
//             option.value = camera.deviceId;
//             option.innerText = camera.label;
//             if(currentCamera.label === camera.label){
//                 option.selected = true;
//             }
//             camerasSelect.appendChild(option);
//         });
//     }catch(e){
//         console.log(e);
//     }
// }

// async function getMedia(deviceId){
//     const initialConstrains = {
//         audio: true, 
//         video: { facingMode: "user" },
//     };
//     const cameraConstraints = {
//         audio: true,
//         video: {deviceId : { exact: deviceId } },
//     };
//     try {
//         myStream = await navigator.mediaDevices.getUserMedia(
//             deviceId? cameraConstraints : initialConstrains
//         );
//         myFace.srcObject = myStream;
//         if(!deviceId){
//             await getCameras();
//         }
//     } catch(e) {
//         console.log(e);
//     }
// }

// function handleMuteClick () {
//     myStream
//         .getAudioTracks()
//         .forEach((track => track.enabled = !track.enabled));
//     if(!muted){
//         muteBtn.innerText = "Unmute";
//         muted =true;
//     } else {
//         muteBtn.innerText = "Mute";
//         muted = false;
//     }
// }
// function handleCameraClick () {
//     myStream
//         .getVideoTracks()
//         .forEach((track => track.enabled = !track.enabled));
//     if(cameraOff){
//         cameraBtn.innerText = "Turn Camera Off";
//         cameraOff = false;
//     } else {
//         cameraBtn.innerText = "Turn Camera On";
//         cameraOff = true;
//     }
// }

// async function handleCameraChange(){
//     await getMedia(camerasSelect.value);
// }

// muteBtn.addEventListener("click", handleMuteClick);
// cameraBtn.addEventListener("click", handleCameraClick);
// camerasSelect.addEventListener("input", handleCameraChange);

// //Welcome Form (join a room)

// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");

// async function startMedia() {
//     welcome.hidden = true;
//     call.hidden = false;
//     await getMedia();
//     makeConnection();
// }

// function handleWelcomeSubmit(event) {
//     event.preventDefault();
//     const input = welcomeForm.querySelector("input");
//     socket.emit("join_room", input.value, startMedia);
//     roomName = input.value;
//     input.value = "";
// }

// welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// //Socket Code

// socket.on("welcome", async () => {
//     const offer = await myPeerConnection.createOffer();
//     myPeerConnection.setLocalDescription(offer);
//     console.log("sent the offer");
//     socket.emit("offer", offer, roomName);
// });

// socket.on("offer", (offer) => {
//     console.log(offer);
//   });
  
// // RTC Code
  
// function makeConnection() {
//     myPeerConnection = new RTCPeerConnection();
//     myStream
//       .getTracks()
//       .forEach((track) => myPeerConnection.addTrack(track, myStream));
// }
