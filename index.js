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

const PORT = process.env.PORT || 3000;

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

const users = {}; // Store connected users

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a new user joins
    socket.on('user join', (username) => {
        users[socket.id] = username;
        io.emit('chat message', { user: 'System', message: `${username} has joined the chat!` });
        io.emit('update users', Object.values(users)); // Send updated user list
    });

    // Receiving and broadcasting messages
    socket.on('chat message', (msg) => {
        const user = users[socket.id] || 'Anonymous';
        io.emit('chat message', { user, message: msg });
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            io.emit('chat message', { user: 'System', message: `${username} has left the chat.` });
        }
        delete users[socket.id];
        io.emit('update users', Object.values(users));
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
