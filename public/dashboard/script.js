const socket = io();
let currentServer = null;

function createServer() {
    const serverName = document.getElementById("serverName").value.trim();
    if (serverName) {
        socket.emit("create server", serverName);
        document.getElementById("serverName").value = "";
    }
}

socket.on("server created", (serverName) => {
    const serverList = document.getElementById("serverList");
    const li = document.createElement("li");
    li.textContent = serverName;
    li.classList.add("server-item");
    li.onclick = () => joinServer(serverName);
    serverList.appendChild(li);
});

function joinServer(serverName) {
    currentServer = serverName;
    document.getElementById("chatbox").innerHTML = "";
    socket.emit("join server", serverName);
}

socket.on("server messages", (messages) => {
    messages.forEach(({ user, message }) => addMessage(user, message));
});

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    if (message && currentServer) {
        socket.emit("chat message", { server: currentServer, user: "You", message });
        messageInput.value = "";
    }
}

socket.on("chat message", ({ user, message }) => {
    addMessage(user, message);
});

function addMessage(user, message) {
    const chatbox = document.getElementById("chatbox");
    const msgDiv = document.createElement("div");
    msgDiv.textContent = `${user}: ${message}`;
    msgDiv.classList.add("chat-message");
    chatbox.appendChild(msgDiv);
    chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll to latest message
}
