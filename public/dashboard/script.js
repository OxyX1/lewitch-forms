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

document.getElementById('settingsButton').addEventListener('click', () => {
  toggleSettingsPopup();
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
  return document.getElementById('popupUserNameInput').value || 'Anonymous';
}

function getServer() {
  return document.getElementById('popupServerNameInput').value || 'default';
}

function toggleSettingsPopup() {
  const settingsPopup = document.getElementById('settingsPopup');
  settingsPopup.classList.toggle('visible');
}

function saveSettings() {
  const serverNameInput = document.getElementById('serverNameInput');
  const userNameInput = document.getElementById('userNameInput');
  const popupServerNameInput = document.getElementById('popupServerNameInput');
  const popupUserNameInput = document.getElementById('popupUserNameInput');

  serverNameInput.value = popupServerNameInput.value;
  userNameInput.value = popupUserNameInput.value;

  toggleSettingsPopup();
}
