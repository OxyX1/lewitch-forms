const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard', 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const servers = {}; // Store servers and messages
const users = new Map(); // Store connected users (userID -> WebSocket)

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('A user connected');
    ws.userID = null;
    ws.serverName = null;

    ws.on('message', (message) => {
        try {
            const { type, data } = JSON.parse(message);

            switch (type) {
                case 'set user':
                    ws.userID = data.userID;
                    users.set(data.userID, ws);
                    break;

                case 'create server':
                    if (!servers[data.serverName]) {
                        servers[data.serverName] = { messages: [] };
                        broadcast(JSON.stringify({ type: 'server created', serverName: data.serverName }));
                        console.log(`Server created: ${data.serverName}`);
                    }
                    break;

                case 'join server':
                    if (servers[data.serverName]) {
                        ws.serverName = data.serverName;
                        ws.send(JSON.stringify({ 
                            type: 'server messages', 
                            serverName: data.serverName, 
                            messages: servers[data.serverName].messages 
                        }));
                        console.log(`User joined server: ${data.serverName}`);
                    } else {
                        ws.send(JSON.stringify({ type: 'error', message: 'Server does not exist' }));
                    }
                    break;

                case 'chat message':
                    if (ws.serverName && servers[ws.serverName]) {
                        const msgData = { 
                            type: 'chat message', 
                            serverName: ws.serverName, 
                            user: data.user, 
                            message: data.message 
                        };

                        servers[ws.serverName].messages.push(msgData);
                        broadcastToServer(ws.serverName, JSON.stringify(msgData));
                        console.log(`Message sent in ${ws.serverName}: ${data.user}: ${data.message}`);
                    } else {
                        ws.send(JSON.stringify({ type: 'error', message: 'You are not in a server' }));
                    }
                    break;

                case 'direct message':
                    if (users.has(data.toUserID)) {
                        const recipient = users.get(data.toUserID);
                        recipient.send(JSON.stringify({ type: 'direct message', from: data.fromUserID, message: data.message }));
                    } else {
                        ws.send(JSON.stringify({ type: 'error', message: 'User not found' }));
                    }
                    break;

                default:
                    ws.send(JSON.stringify({ type: 'error', message: 'Unknown request type' }));
            }
        } catch (err) {
            console.error('Invalid message format:', err);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        console.log('A user disconnected');
        if (ws.userID) users.delete(ws.userID);
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

function broadcastToServer(serverName, data) {
    wss.clients.forEach((client) => {
        if (client.serverName === serverName && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
