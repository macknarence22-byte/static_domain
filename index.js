const express = require('express');
const Unblocker = require('unblocker');
const app = express();

const unblocker = new Unblocker({ prefix: '/proxy/' });

// Initialize the unblocker engine
app.use(unblocker);

// Set up a simple front-facing landing page 
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Web Mirror</title>
            <style>
                body { font-family: sans-serif; text-align: center; padding-top: 10%; background: #121212; color: white; }
                input { padding: 10px; width: 60%; max-width: 500px; border-radius: 4px; border: 1px solid #333; }
                button { padding: 10px 20px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer; }
            </style>
        </head>
        <body>
            <h1>Enter a URL to browse:</h1>
            <input type="text" id="url" placeholder="https://example.com" value="https://">
            <button onclick="browse()">Go</button>
            <script>
                function browse() {
                    let target = document.getElementById('url').value;
                    window.location.href = window.location.origin + '/proxy/' + target;
                }
            </script>
        </body>
        </html>
    `);
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`)).on('upgrade', unblocker.onUpgrade);
