const socket = new WebSocket("ws://localhost:8080"); // Adjust for deployment

const chatArea = document.getElementById("chat-area");
const typeArea = document.getElementById("type-area");
const sendBtn = document.querySelector(".send-btn");

let currentServer = null;
let userID = "User" + Math.floor(Math.random() * 1000); // Temporary user ID

// Handle WebSocket open connection
socket.addEventListener("open", () => {
    console.log("Connected to server");
    socket.send(JSON.stringify({ type: "set user", data: { userID } }));
});

// Handle incoming messages
socket.addEventListener("message", (event) => {
    const { type, user, message, messages, serverName } = JSON.parse(event.data);

    switch (type) {
        case "chat message":
            addMessage(message, user);
            break;

        case "server messages":
            chatArea.innerHTML = ""; // Clear previous messages
            messages.forEach(msg => addMessage(msg.message, msg.user));
            break;

        case "server created":
            console.log(`Server "${serverName}" created`);
            break;

        case "error":
            console.error(message);
            break;
    }
});

// Function to add a message to chat area
function addMessage(text, sender = "self") {
    if (!text.trim()) return; // Prevent empty messages

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.innerHTML = `<p><strong>${sender}:</strong> ${text}</p>`;
    chatArea.appendChild(messageDiv);

    chatArea.scrollTop = chatArea.scrollHeight; // Auto-scroll to latest message
}

// Send button event
sendBtn.addEventListener("click", () => sendMessage());

// Send message on Enter key press
typeArea.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

// Function to send message
function sendMessage() {
    const messageText = typeArea.value;
    if (!messageText.trim() || !currentServer) return;

    socket.send(JSON.stringify({
        type: "chat message",
        data: { user: userID, message: messageText }
    }));

    typeArea.value = ""; // Clear input field
}

// Function to create or join a server
function joinServer(serverName) {
    currentServer = serverName;
    socket.send(JSON.stringify({ type: "join server", data: { serverName } }));
}

// Example: Join a server (Replace with UI interaction)
joinServer("GeneralChat");
