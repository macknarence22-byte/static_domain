const express = require('express');
const Unblocker = require('unblocker');
const app = express();

// 1. Setup the Unblocker engine configuration
const unblocker = new Unblocker({ 
    prefix: '/proxy/'
});

// 2. MIDDLEWARE FIX: Strip X-Frame-Options and fix CSP headers before they hit Chrome
app.use((req, res, next) => {
    // Intercept headers when they are being written out
    const originalWriteHeader = res.writeContinue || res.writeHead;
    
    res.writeHead = function(statusCode, headers) {
        if (headers) {
            // Delete the headers that force Chrome to show a white screen in iframes
            delete headers['x-frame-options'];
            delete headers['X-Frame-Options'];
            
            // Clean up Content-Security-Policy frame restrictions if they exist
            if (headers['content-security-policy']) {
                headers['content-security-policy'] = headers['content-security-policy']
                    .replace(/frame-ancestors\s+[^;]+(;|\$)/gi, '');
            }
            if (headers['Content-Security-Policy']) {
                headers['Content-Security-Policy'] = headers['Content-Security-Policy']
                    .replace(/frame-ancestors\s+[^;]+(;|\$)/gi, '');
            }
        }
        return originalWriteHeader.apply(this, arguments);
    };
    next();
});

// 3. Mount the proxy engine right after our header cleanup middleware
app.use(unblocker);

// 4. Render the clean parent control bar
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
                
                /* Layout Nav Bar */
                .nav-bar { width: 100%; height: 50px; background: #1e1e1e; display: flex; align-items: center; padding: 0 15px; border-bottom: 1px solid #2d2d2d; z-index: 999; position: relative; }
                .search-box { flex: 1; height: 32px; background: #2b2b2b; border: 1px solid #3a3a3a; border-radius: 6px; padding: 0 12px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s; }
                .search-box:focus { border-color: #007acc; }
                .go-btn { height: 32px; padding: 0 16px; background: #007acc; color: white; border: none; border-radius: 6px; margin-left: 10px; cursor: pointer; font-weight: 500; font-size: 14px; }
                .go-btn:hover { background: #0062a3; }
                
                /* Full View Sandbox */
                .view-container { width: 100%; height: calc(100% - 50px); position: relative; background: #fff; }
                iframe { width: 100%; height: 100%; border: none; background: #fff; }
            </style>
        </head>
        <body>

            <div class="nav-bar">
                <input type="text" id="targetUrl" class="search-box" placeholder="Enter target site address (e.g., example.com)" value="https://">
                <button onclick="launchSite()" class="go-btn">Go</button>
            </div>

            <div class="view-container">
                <iframe id="sandboxFrame" src="about:blank"></iframe>
            </div>

            <script>
                function launchSite() {
                    let input = document.getElementById('targetUrl').value.trim();
                    if (!input) return;
                    
                    if (!input.startsWith('http://') && !input.startsWith('https://')) {
                        input = 'https://' + input;
                    }
                    
                    // Route traffic seamlessly inside the modified server configuration
                    const proxiedPath = window.location.origin + '/proxy/' + input;
                    document.getElementById('sandboxFrame').src = proxiedPath;
                }

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

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Stealth workspace running on port ${port}`)).on('upgrade', unblocker.onUpgrade);
