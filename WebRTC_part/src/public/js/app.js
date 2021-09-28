const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open",() => {  // onLine server
    console.log("Connected to Server OOO");
});

socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data);
});

socket.addEventListener("close", () => {    // offLine server
    console.log("Disconnected from Server XXX");
});


setTimeout(() => {
    socket.send("hello from the browser!");
}, 10000);
