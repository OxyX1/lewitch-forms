const socket = new WebSocket("ws://localhost:8080");

const usernameDisplay = document.getElementById("username-display");
const serverList = document.getElementById("server-list");
const chatArea = document.getElementById("chat-area");
const messageBox = document.getElementById("message-box");
const sendBtn = document.getElementById("send-btn");
const serverTitle = document.getElementById("server-title");

const modal = document.getElementById("server-modal");
const modalTitle = document.getElementById("modal-title");
const serverInput = document.getElementById("server-input");
const serverSubmit = document.getElementById("server-submit");
const closeModal = document.querySelector(".close");

let currentServer = null;
let userID = "User" + Math.floor(Math.random() * 1000);
usernameDisplay.innerText = userID;

socket.addEventListener("open", () => {
    console.log("Connected to server");
    socket.send(JSON.stringify({ type: "set user", data: { userID } }));
});

socket.addEventListener("message", (event) => {
    const { type, user, message, messages, serverName } = JSON.parse(event.data);

    switch (type) {
        case "chat message":
            if (serverName === currentServer) {
                addMessage(message, user);
            }
            break;

        case "server messages":
            if (serverName === currentServer) {
                chatArea.innerHTML = "";
                messages.forEach(msg => addMessage(msg.message, msg.user));
            }
            break;

        case "server created":
            addServerToSidebar(serverName);
            break;
    }
});

function addMessage(text, sender = "self") {
    if (!text.trim()) return;
    const messageDiv = document.createElement("div");
    messageDiv.innerHTML = `<p><strong>${sender}:</strong> ${text}</p>`;
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

sendBtn.addEventListener("click", () => sendMessage());
messageBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    const messageText = messageBox.value.trim();
    if (!messageText || !currentServer) return;

    socket.send(JSON.stringify({
        type: "chat message",
        data: { serverName: currentServer, user: userID, message: messageText }
    }));

    messageBox.value = "";
}

document.getElementById("create-server-btn").addEventListener("click", () => openModal("Create Server"));
document.getElementById("join-server-btn").addEventListener("click", () => openModal("Join Server"));

function openModal(action) {
    modal.style.display = "block";
    modalTitle.innerText = action;
    serverInput.value = "";
}

closeModal.addEventListener("click", () => { modal.style.display = "none"; });

serverSubmit.addEventListener("click", () => {
    const serverName = serverInput.value.trim();
    if (!serverName) return;
    modal.style.display = "none";
    if (modalTitle.innerText === "Create Server") createServer(serverName);
    else joinServer(serverName);
});

function createServer(serverName) {
    socket.send(JSON.stringify({ type: "create server", data: { serverName } }));
    joinServer(serverName);
}

function joinServer(serverName) {
    if (!serverName) return;

    currentServer = serverName;
    serverTitle.innerText = `Server: ${serverName}`;
    socket.send(JSON.stringify({ type: "join server", data: { serverName } }));

    // Prevent duplicate buttons
    if (!document.getElementById(`server-btn-${serverName}`)) {
        addServerToSidebar(serverName);
    }
}

function addServerToSidebar(serverName) {
    if (document.getElementById(`server-btn-${serverName}`)) return; // Prevent duplicate buttons

    const serverBtn = document.createElement("button");
    serverBtn.innerText = serverName;
    serverBtn.classList.add("server-btn");
    serverBtn.id = `server-btn-${serverName}`;
    serverBtn.addEventListener("click", () => joinServer(serverName));
    serverList.appendChild(serverBtn);
}
