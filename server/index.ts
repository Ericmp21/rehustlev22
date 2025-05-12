// This is a Next.js compatible server file
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Determine environment
const dev = process.env.NODE_ENV !== 'production';
// Use the hostname and port settings required by Replit
const hostname = '0.0.0.0';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log(`> Initializing Next.js app...`);

// Prepare the Next.js application
app.prepare()
  .then(() => {
    console.log(`> Next.js app initialized!`);
    
    // Create a simple HTTP server that forwards requests to Next.js
    const server = createServer((req, res) => {
      try {
        // Parse the URL
        const parsedUrl = parse(req.url || '', true);
        
        // Let Next.js handle the request
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Start the server
    server.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error preparing Next.js app:', err);
    process.exit(1);
  });