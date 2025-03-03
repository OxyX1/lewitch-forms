const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/execute', (req, res) => {
    const { script } = req.body;

    if (!script) {
        return res.status(400).json({ error: 'No script provided' });
    }

    try {
        const result = executeOSFL(script);
        res.json({ message: 'Script executed successfully', result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Function to interpret and execute .osfl commands
function executeOSFL(script) {
    let result = '';
    const commands = script.split('\n');

    commands.forEach(command => {
        command = command.trim();
        if (command.startsWith('write(')) {
            const message = command.slice(6, -2);
            result += message + '\n';
        } else if (command.startsWith('http(')) {
            const color = command.slice(12, -2);
            result += `Changed color to: ${color}\n`;
        }
    });
    return result;
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
