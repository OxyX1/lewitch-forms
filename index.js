const express = require('express');
const http = require('http');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'url')));
app.use(express.static(path.join(__dirname, 'url', 'login')));
app.use(express.static(path.join(__dirname, 'url', 'callback')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'url', 'login', 'index.html'));
});

app.get('/authentication', (req, res) => {
    res.sendFile(path.join(__dirname, 'url', 'login', 'index.html'));
});

app.get('/callback', (req, res) => {
    res.sendFile(path.join(__dirname, 'url', 'callback', 'index.html'));
});

app.get('/logout', (req, res) => {
    res.sendFile(path.join(__dirname, 'url', 'logout', 'index.html'));
});



/*

ideas and thoughts:

use the oxyum server to handle local javascript files.

create a hosting app for advanced web handling.

finish credidential system.

add server creating and joining functions.

add personal dm functions for private conversations.


*/