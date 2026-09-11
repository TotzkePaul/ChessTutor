const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../build');
const publicPath = '/ChessTutor';
if (!fs.existsSync(path.join(root, 'service-worker.js'))) {
  console.error('Build the offline app first: npm run build');
  process.exit(1);
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  // The production bundle uses the GitHub Pages project path. Serve that path
  // locally too, while keeping the root URL convenient for the desktop launcher.
  const relativeName = name === '/' ? '/index.html' :
    (name === publicPath || name === `${publicPath}/` ? '/index.html' :
      name.startsWith(`${publicPath}/`) ? name.slice(publicPath.length) : name);
  const file = path.resolve(root, '.' + relativeName);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(3000, '127.0.0.1', () => {
  console.log('Chess Tutor: http://127.0.0.1:3000 — works without internet. Keep this window open.');
  if (process.argv.includes('--open') && process.platform === 'win32') {
    require('child_process').execFile('cmd.exe', ['/c', 'start', '', 'http://127.0.0.1:3000']);
  }
});
