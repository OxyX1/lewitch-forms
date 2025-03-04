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

const servers = {}; // Store servers and their messages

wss.on('connection', (ws) => {
    console.log('A user connected');

    ws.on('message', (message) => {
        const { type, data } = JSON.parse(message);
        
        switch (type) {
            case 'create server':
                if (!servers[data.serverName]) {
                    servers[data.serverName] = { messages: [] };
                    broadcast(JSON.stringify({ type: 'server created', serverName: data.serverName }));
                }
                break;
            
            case 'join server':
                ws.send(JSON.stringify({ type: 'server messages', messages: servers[data.serverName]?.messages || [] }));
                break;
            
            case 'chat message':
                if (servers[data.server]) {
                    const msgData = { user: data.user, message: data.message };
                    servers[data.server].messages.push(msgData);
                    broadcastToServer(data.server, JSON.stringify({ type: 'chat message', ...msgData }));
                }
                break;
        }
    });

    ws.on('close', () => {
        console.log('A user disconnected');
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
        // Assuming clients have a custom attribute `serverName` to track joined server
        if (client.serverName === serverName && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
