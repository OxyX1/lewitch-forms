const ws = new WebSocket('ws://localhost:8080'); // Ensure it matches your server port

ws.onopen = () => {
  console.log('Connected to the server');
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  displayMessage(msg.message, msg.user === getUser());
};

ws.onclose = () => {
  console.log('Disconnected from the server');
};

document.getElementById('sendButton').addEventListener('click', () => {
  sendMessage();
});

document.getElementById('messageInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  if (message) {
    const user = getUser();
    const server = getServer();
    ws.send(JSON.stringify({ type: 'chat message', data: { user, server, message } }));
    displayMessage(message, true);
    messageInput.value = '';
  }
}

function displayMessage(message, isSender = false) {
  const messagesDiv = document.getElementById('messages');
  const messageContainer = document.createElement('div');
  const messageElement = document.createElement('div');
  
  messageElement.textContent = message;
  messageContainer.classList.add('message-container');
  
  if (isSender) {
    messageContainer.classList.add('sender-message-container');
    messageElement.classList.add('message-bubble', 'sender-message-bubble');
  } else {
    messageElement.classList.add('message-bubble');
  }
  
  messageContainer.appendChild(messageElement);
  messagesDiv.appendChild(messageContainer);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function getUser() {
  const userNameInput = document.getElementById('userNameInput');
  return userNameInput ? userNameInput.value : 'Anonymous';
}

function getServer() {
  const serverNameInput = document.getElementById('serverNameInput');
  return serverNameInput ? serverNameInput.value : 'default';
}
