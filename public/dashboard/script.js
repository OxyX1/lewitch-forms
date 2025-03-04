const ws = new WebSocket('ws://localhost:8080');

let currentUserID = prompt("Enter your username:");
ws.send(JSON.stringify({ type: 'set user', data: { userID: currentUserID } }));

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
        case 'server created':
            console.log(`Server "${msg.serverName}" created.`);
            break;

        case 'server messages':
            console.log(`Messages in server:`, msg.messages);
            break;

        case 'chat message':
            console.log(`[${msg.user}]: ${msg.message}`);
            break;

        case 'direct message':
            console.log(`[DM from ${msg.from}]: ${msg.message}`);
            break;

        case 'error':
            console.error(`Error: ${msg.message}`);
            break;
    }
};

// Create a server
function createServer(serverName) {
    ws.send(JSON.stringify({ type: 'create server', data: { serverName } }));
}

// Join a server
function joinServer(serverName) {
    ws.send(JSON.stringify({ type: 'join server', data: { serverName } }));
}

// Send a message in a server
function sendMessage(serverName, message) {
    ws.send(JSON.stringify({ type: 'chat message', data: { user: currentUserID, server: serverName, message } }));
}

// Send a direct message
function sendDirectMessage(toUserID, message) {
    ws.send(JSON.stringify({ type: 'direct message', data: { fromUserID: currentUserID, toUserID, message } }));
}
