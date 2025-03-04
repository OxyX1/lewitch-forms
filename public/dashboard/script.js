const socket = io(); // Connect to server

document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const messagesDiv = document.getElementById("messages");

    let username = localStorage.getItem("username") || prompt("Enter your username:");
    localStorage.setItem("username", username);
    socket.emit("user join", username);

    // Send message when clicking the button
    sendBtn.addEventListener("click", sendMessage);

    // Send message when pressing Enter
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message !== "") {
            socket.emit("chat message", { user: username, message });
            chatInput.value = ""; // Clear input
        }
    }

    // Receive messages
    socket.on("chat message", (data) => {
        const msgElement = document.createElement("p");
        msgElement.innerHTML = `<strong>${data.user}:</strong> ${data.message}`;
        messagesDiv.appendChild(msgElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to latest message
    });
});
