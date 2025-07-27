#!/usr/bin/env node

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    // Remove query parameters and decode URL
    let pathname = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
    
    // Default to index.html
    if (pathname === '/') {
      pathname = '/index.html';
    }
    
    // Construct file path
    let filePath;
    if (pathname.startsWith('/dist/')) {
      // Serve from project root dist folder
      filePath = join(__dirname, '..', pathname);
    } else {
      // Serve from web folder
      filePath = join(__dirname, 'web', pathname);
    }
    
    // Get file extension for mime type
    const ext = extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Read and serve file
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
    
    console.log(`Served: ${pathname}`);
    
  } catch (err) {
    console.error(`Error serving ${req.url}:`, err.message);
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>404 - File Not Found</h1>
      <p>The requested file <code>${req.url}</code> was not found.</p>
      <a href="/">Go to Demo</a>
    `);
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 MMM Demo Server running at:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`\n📁 Serving files from:`);
  console.log(`   Web:     ${join(__dirname, 'web')}`);
  console.log(`   Dist:    ${join(__dirname, '..', 'dist')}`);
  console.log(`\n📖 Open http://localhost:${PORT} to view the demo\n`);
});