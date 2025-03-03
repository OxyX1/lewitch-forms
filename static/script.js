const ws = new WebSocket("ws://localhost:8000/ws");

ws.onmessage = function(event) {
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p>${event.data}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
};

function sendMessage() {
    let input = document.getElementById("message");
    ws.send(input.value);
    input.value = "";
}