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

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("user join", (username) => {
        console.log(`${username} joined the chat`);
    });

    socket.on("chat message", (data) => {
        io.emit("chat message", data); // Broadcast message
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
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
