const socket = io();
let currentServer = null;

// Load saved username
document.addEventListener("DOMContentLoaded", () => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
        document.getElementById("username").value = savedUsername;
        document.getElementById("user-info").innerText = `Logged in as: ${savedUsername}`;
    }
});

// Handle Enter key for sending messages
document.getElementById("messageInput").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Function to send a message
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    if (message && currentServer) {
        socket.emit("chat message", { server: currentServer, message });
        messageInput.value = "";
    }
}

// Receive and display messages
socket.on("chat message", (data) => {
    if (data.server === currentServer) {
        const chatbox = document.getElementById("chatbox");
        const messageElement = document.createElement("div");
        messageElement.classList.add("chat-message");
        messageElement.innerText = `${data.user}: ${data.message}`;
        chatbox.appendChild(messageElement);
        chatbox.scrollTop = chatbox.scrollHeight;
    }
});

// Function to create a server
function createServer() {
    const serverName = document.getElementById("serverName").value.trim();
    if (serverName) {
        const serverId = Math.random().toString(36).substr(2, 8);
        socket.emit("create server", { name: serverName, id: serverId });
        addServerButton(serverName, serverId);
        closePopup("serverPopup");
    }
}

// Function to add a server button
function addServerButton(name, id) {
    const serverList = document.getElementById("serverList");
    const button = document.createElement("button");
    button.classList.add("server-button");
    button.innerText = name;
    button.onclick = () => joinServer(id);
    serverList.appendChild(button);
}

// Function to join a server
function joinServer(id) {
    currentServer = id;
    document.getElementById("chatbox").innerHTML = "";
    socket.emit("join server", id);
}

// Receive server creation event
socket.on("server created", (data) => {
    addServerButton(data.name, data.id);
});

// Function to save username
function saveUsername() {
    const username = document.getElementById("username").value.trim();
    if (username) {
        localStorage.setItem("username", username);
        document.getElementById("user-info").innerText = `Logged in as: ${username}`;
        closePopup("settingsPopup");
    }
}

// Function to log out
function logout() {
    localStorage.removeItem("username");
    window.location.reload();
}

// Function to handle popups
function openPopup(id) {
    document.getElementById(id).style.display = "block";
}

function closePopup(id) {
    document.getElementById(id).style.display = "none";
}
