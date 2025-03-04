const socket = new WebSocket("ws://localhost:3000");
let currentServer = null;

// Elements
const serverList = document.getElementById("server-list");
const serverModal = document.getElementById("server-modal");
const serverNameInput = document.getElementById("server-name-input");
const serverSubmit = document.getElementById("server-submit");
const closeModal = document.querySelector(".close");
const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const serverTitle = document.getElementById("server-title");

// Open modal for server creation
document.getElementById("create-server-btn").addEventListener("click", () => {
  serverModal.style.display = "block";
});

// Close modal
closeModal.addEventListener("click", () => {
  serverModal.style.display = "none";
});

// Create a server
serverSubmit.addEventListener("click", () => {
  const serverName = serverNameInput.value.trim();
  if (serverName) {
    socket.send(JSON.stringify({ type: "create-server", name: serverName }));
    serverModal.style.display = "none";
    serverNameInput.value = "";
  }
});

// Select a server
function joinServer(serverId, serverName) {
  currentServer = serverId;
  serverTitle.textContent = serverName;
  chatMessages.innerHTML = "";
  socket.send(JSON.stringify({ type: "join-server", serverId }));
}

// Send message
sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message && currentServer) {
    socket.send(JSON.stringify({ type: "message", serverId: currentServer, content: message }));
    messageInput.value = "";
  }
});

// Handle incoming messages
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "server-list") {
    serverList.innerHTML = "";
    data.servers.forEach((server) => {
      const btn = document.createElement("button");
      btn.textContent = server.name;
      btn.addEventListener("click", () => joinServer(server.id, server.name));
      serverList.appendChild(btn);
    });
  } else if (data.type === "message" && data.serverId === currentServer) {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = `${data.sender}: ${data.content}`;
    chatMessages.appendChild(msgDiv);
  }
};
