const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const WebSocket = require("ws");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login", "index.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard", "index.html"));
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const servers = {}; // { serverId: { name, users, messages } }
const users = new Map(); // userID -> WebSocket

// WebSocket Handling
wss.on("connection", (ws) => {
    console.log("A user connected via WebSocket");
    ws.userID = null;
    ws.serverName = null;

    ws.on("message", (message) => {
        try {
            const { type, data } = JSON.parse(message);
            switch (type) {
                case "set user":
                    ws.userID = data.userID;
                    users.set(data.userID, ws);
                    break;
                case "create server":
                    if (!servers[data.serverName]) {
                        servers[data.serverName] = { messages: [] };
                        broadcast(JSON.stringify({ type: "server created", serverName: data.serverName }));
                    }
                    break;
                case "join server":
                    if (servers[data.serverName]) {
                        ws.serverName = data.serverName;
                        ws.send(JSON.stringify({
                            type: "server messages",
                            serverName: data.serverName,
                            messages: servers[data.serverName].messages
                        }));
                    } else {
                        ws.send(JSON.stringify({ type: "error", message: "Server does not exist" }));
                    }
                    break;
                case "chat message":
                    if (ws.serverName && servers[ws.serverName]) {
                        const msgData = {
                            type: "chat message",
                            serverName: ws.serverName,
                            user: data.user,
                            message: data.message
                        };
                        servers[ws.serverName].messages.push(msgData);
                        broadcastToServer(ws.serverName, JSON.stringify(msgData));
                    }
                    break;
                case "direct message":
                    if (users.has(data.toUserID)) {
                        users.get(data.toUserID).send(JSON.stringify({ type: "direct message", from: data.fromUserID, message: data.message }));
                    }
                    break;
                default:
                    ws.send(JSON.stringify({ type: "error", message: "Unknown request type" }));
            }
        } catch (err) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
        }
    });

    ws.on("close", () => {
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