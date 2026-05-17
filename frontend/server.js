const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const BUILD_DIR = path.join(__dirname, 'build');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let filePath = path.join(BUILD_DIR, urlPath === '/' ? 'index.html' : urlPath);
  if (!filePath.startsWith(BUILD_DIR)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      fs.createReadStream(path.join(BUILD_DIR, 'index.html')).pipe(res);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`[frontend] Serving build/ on http://0.0.0.0:${PORT}`));
