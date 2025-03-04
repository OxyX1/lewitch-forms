const socket = new WebSocket('ws://localhost:8080');

const chatList = document.getElementById('chat-list');
const chatArea = document.getElementById('chat-area');
const typeArea = document.getElementById('type-area');
const sendBtn = document.querySelector('.send-btn');
const serverContainer = document.getElementById('chat-list');

let currentServer = null;
let username = prompt("Enter your username:") || "User" + Math.floor(Math.random() * 1000);

// Send user identification to the server
socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'set user', data: { userID: username } }));
});

// Handle incoming messages
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'server created':
            addServerButton(data.serverName);
            break;

        case 'server messages':
            loadChatHistory(data.serverName, data.messages);
            break;

        case 'chat message':
            if (data.serverName === currentServer) {
                displayMessage(data.user, data.message);
            }
            break;

        case 'error':
            alert(data.message);
            break;
    }
});

// Function to create a new server
function createServer() {
    const serverName = prompt("Enter a server name:");
    if (serverName) {
        socket.send(JSON.stringify({ type: 'create server', data: { serverName } }));
        addServerButton(serverName);
    }
}

// Function to join a server
function joinServer(serverName) {
    currentServer = serverName;
    socket.send(JSON.stringify({ type: 'join server', data: { serverName } }));
}

// Function to send a message
sendBtn.addEventListener('click', () => {
    sendMessage();
});

typeArea.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = typeArea.value.trim();
    if (message && currentServer) {
        socket.send(JSON.stringify({ type: 'chat message', data: { user: username, message } }));
        typeArea.value = '';
    }
}

// Function to display a message in the chat area
function displayMessage(user, message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.innerHTML = `<strong>${user}:</strong> ${message}`;
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Function to load chat history when joining a server
function loadChatHistory(serverName, messages) {
    chatArea.innerHTML = `<h3>Server: ${serverName}</h3>`;
    messages.forEach(msg => {
        displayMessage(msg.user, msg.message);
    });
}

// Function to add a server button to the UI
function addServerButton(serverName) {
    if (!document.getElementById(`server-${serverName}`)) {
        const serverBtn = document.createElement('button');
        serverBtn.id = `server-${serverName}`;
        serverBtn.classList.add('server-btn');
        serverBtn.textContent = serverName;
        serverBtn.addEventListener('click', () => joinServer(serverName));
        serverContainer.appendChild(serverBtn);
    }
}

// Add "Create Server" button to UI
const createServerBtn = document.createElement('button');
createServerBtn.textContent = "Create Server";
createServerBtn.classList.add('create-server-btn');
createServerBtn.addEventListener('click', createServer);
serverContainer.appendChild(createServerBtn);
