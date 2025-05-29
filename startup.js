const { spawn } = require('child_process');
const path = require('path');

// Start the main application
const app = spawn('node', ['server.js'], {
    stdio: 'inherit'
});

app.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
}); 