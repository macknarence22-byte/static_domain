const express = require('express');
const Unblocker = require('unblocker');
const app = express();

// 1. CRITICAL FIX: The custom homepage MUST be defined before app.use(unblocker)
// Otherwise, the proxy engine hijacks the root "/" path and breaks the layout script.
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Web Workspace</title>
            <style>
                * { box-sizing: border-box; }
                html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #121212; font-family: system-ui, sans-serif; overflow: hidden; }
                
                /* Top URL Navigation Bar */
                .nav-bar { width: 100%; height: 50px; background: #1e1e1e; display: flex; align-items: center; padding: 0 15px; border-bottom: 1px solid #2d2d2d; z-index: 999; position: relative; }
                .search-box { flex: 1; height: 32px; background: #2b2b2b; border: 1px solid #3a3a3a; border-radius: 6px; padding: 0 12px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s; }
                .search-box:focus { border-color: #007acc; }
                .go-btn { height: 32px; padding: 0 16px; background: #007acc; color: white; border: none; border-radius: 6px; margin-left: 10px; cursor: pointer; font-weight: 500; font-size: 14px; }
                .go-btn:hover { background: #0062a3; }
                
                /* Full Viewport Hidden Sandbox Window */
                .view-container { width: 100%; height: calc(100% - 50px); position: relative; background: #fff; }
                iframe { width: 100%; height: 100%; border: none; background: #fff; }
            </style>
        </head>
        <body>

            <div class="nav-bar">
                <input type="text" id="targetUrl" class="search-box" placeholder="Search web or enter address (example.com)" value="https://">
                <button onclick="launchSite()" class="go-btn">Go</button>
            </div>

            <div class="view-container">
                <iframe id="sandboxFrame" src="about:blank"></iframe>
            </div>

            <script>
                function launchSite() {
                    let input = document.getElementById('targetUrl').value.trim();
                    if (!input) return;
                    
                    // Format strings safely if the protocol was omitted
                    if (!input.startsWith('http://') && !input.startsWith('https://')) {
                        input = 'https://' + input;
                    }
                    
                    // Route directly through the configured engine prefix path 
                    const proxiedPath = window.location.origin + '/proxy/' + input;
                    
                    // Force the sandbox frame to render the destination
                    document.getElementById('sandboxFrame').src = proxiedPath;
                }

                // Bind the "Enter" keyboard layout for easy use
                document.getElementById('targetUrl').addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        launchSite();
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// 2. Initialize the backend engine down here so it handles incoming paths sequentially
const unblocker = new Unblocker({ prefix: '/proxy/' });
app.use(unblocker);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Stealth system operational on port ${port}`)).on('upgrade', unblocker.onUpgrade);
