const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

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
const users = {}; // Store connected users

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Create a new server
    socket.on("create server", (serverName) => {
        if (!servers[serverName]) {
            servers[serverName] = { messages: [] };
            io.emit("server created", serverName); // Notify all users
        }
    });

    // Join a server
    socket.on("join server", (serverName) => {
        socket.join(serverName);
        socket.emit("server messages", servers[serverName]?.messages || []);
    });

    // Send message to a specific server
    socket.on("chat message", ({ server, user, message }) => {
        if (servers[server]) {
            const msgData = { user, message };
            servers[server].messages.push(msgData);
            io.to(server).emit("chat message", msgData); // Send to users in that server
        }
    });

    // When a user disconnects
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
