document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    let currentServer = null;
    let username = localStorage.getItem("username") || "Guest";
    let userId = localStorage.getItem("userId") || `user_${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem("userId", userId);

    document.getElementById("userId").innerText = userId;

    function sendMessage() {
        const messageInput = document.getElementById("messageInput");
        const message = messageInput.value.trim();
        if (message && currentServer) {
            socket.emit("chat message", { server: currentServer, user: username, message });
            messageInput.value = "";
        }
    }

    function handleKeyPress(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    }

    function createServer() {
        const serverName = document.getElementById("serverName").value.trim();
        if (serverName) {
            const serverId = `server_${Math.floor(Math.random() * 10000)}`;
            currentServer = serverId;
            document.getElementById("serverId").innerText = serverId;
            socket.emit("create server", { serverId, serverName, host: userId });
            closePopup("serverPopup");
        }
    }

    function joinServer() {
        const serverId = document.getElementById("serverIdInput").value.trim();
        if (serverId) {
            currentServer = serverId;
            document.getElementById("serverId").innerText = serverId;
            socket.emit("join server", { serverId, userId });
            closePopup("joinServerPopup");
        }
    }

    function openPopup(id) {
        document.getElementById(id).style.display = "block";
    }

    function closePopup(id) {
        document.getElementById(id).style.display = "none";
    }

    function openServerPopup() {
        openPopup("serverPopup");
    }

    function joinServerPopup() {
        openPopup("joinServerPopup");
    }

    function openAccountPopup() {
        openPopup("accountPopup");
    }

    function logout() {
        localStorage.clear();
        window.location.href = "/login";
    }

    socket.on("chat message", (data) => {
        if (data.server === currentServer) {
            const chatbox = document.getElementById("chatbox");
            const messageElement = document.createElement("div");
            messageElement.classList.add("chat-message");
            messageElement.innerHTML = `<strong>${data.user}:</strong> ${data.message}`;
            chatbox.appendChild(messageElement);
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    });

    document.getElementById("messageInput").addEventListener("keypress", handleKeyPress);

    window.createServer = createServer;
    window.joinServer = joinServer;
    window.openServerPopup = openServerPopup;
    window.joinServerPopup = joinServerPopup;
    window.openAccountPopup = openAccountPopup;
    window.closePopup = closePopup;
    window.logout = logout;
    window.sendMessage = sendMessage;
});
