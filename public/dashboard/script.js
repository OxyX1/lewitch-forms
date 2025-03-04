const socket = io(); // Connect to server

document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const messagesDiv = document.getElementById("messages");

    let username = localStorage.getItem("username") || prompt("Enter your username:");
    localStorage.setItem("username", username);
    socket.emit("user join", username);

    // Send message on button click
    sendBtn.addEventListener("click", () => {
        sendMessage();
    });

    // Send message on Enter key press
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message !== "") {
            socket.emit("chat message", message);
            chatInput.value = ""; // Clear input field
        }
    }

    // Receive messages and display them
    socket.on("chat message", (data) => {
        const msgElement = document.createElement("p");
        msgElement.innerHTML = `<strong>${data.user}:</strong> ${data.message}`;
        messagesDiv.appendChild(msgElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to latest message
    });
});
