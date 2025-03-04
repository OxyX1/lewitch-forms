const socket = io();

// Check authentication & retrieve username
let username = localStorage.getItem("username") || prompt("Enter your username:");
if (!localStorage.getItem("username")) {
    localStorage.setItem("username", username);
}
document.getElementById("user-info").textContent = `Welcome, ${username}!`;

socket.emit("user join", username);

// Send message function
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    if (message !== "") {
        socket.emit("chat message", { user: username, message });
        messageInput.value = "";
    }
}

// Send message with "Enter" key
document.getElementById("messageInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Receive & display messages
socket.on("chat message", (data) => {
    const chatbox = document.getElementById("chatbox");
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message");
    messageElement.textContent = `${data.user}: ${data.message}`;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
});

// Account Info Popup
function showAccountInfo() {
    const userId = `User ID: ${socket.id}`;
    document.getElementById("account-info-content").textContent = userId;
    document.getElementById("account-info-popup").style.display = "block";
}

function closeAccountInfo() {
    document.getElementById("account-info-popup").style.display = "none";
}

// Logout Function
function logout() {
    localStorage.removeItem("username");
    window.location.reload();
}

// Open Server Creation Popup
function openServerPopup() {
    document.getElementById("server-popup").style.display = "block";
}

// Close Server Popup
function closeServerPopup() {
    document.getElementById("server-popup").style.display = "none";
}

// Create Server Function
function createServer() {
    const serverName = document.getElementById("serverNameInput").value.trim();
    if (serverName !== "") {
        const serverButton = document.createElement("button");
        serverButton.classList.add("server-button");
        serverButton.textContent = serverName;
        document.getElementById("serverList").appendChild(serverButton);
        closeServerPopup();
    }
}

// Join Server with ID
function joinServer() {
    const serverId = document.getElementById("serverIdInput").value.trim();
    if (serverId !== "") {
        alert(`Joined server: ${serverId}`);
        closeServerPopup();
    }
}
