// pug의 ul, form
const messageList = document.querySelector("ul");
const messageList = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

// handleOpen 함수 ~
// function handleOpen() {
//     console.log("Connected to Browser ^__^b ");
// }

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));   // backend로 message 전송
    const li = document.createElement("li");    // li 생성
    li.innerText = `You: ${input.value}`;
    messageList.append(li);
    input.value = "";   // input.value 초기화
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
}

// object to string : nickname과 message를 구분 
// webSocket API 때문 (백앤드에서는 다양한 프로그래밍 언어 사용할 수 있어서 API는 어떠한 판단도 하면 안 됨)
function makeMessage(type, payload) {
    const msg = {type, payload};    // object로 만들고
    return JSON.stringify(msg);     // string으로 넘김
}

// socket.addEventListener("open", handleOpen);
// connection이 open 일 때 사용하는 listener
socket.addEventListener("open", () => {
    console.log("Connected to Browser ^__^b ");
});

// message를 받았을 때 사용하는 listener
socket.addEventListener("message", (message) => {
    const li = document.createElement("li");    // li 생성
    li.innerText = message.data;
    messageList.append(li);
});

// server가 offline 됐을 때 사용하는 listener
socket.addEventListener("close", () => {
    console.log("Disconnected to Browser ㅠ__ㅠ ");
});

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

// message를 보내기까지 10초 기다리기
// setTimeout(() => {
//     socket.send("hello from the browser");
// }, 10000);
