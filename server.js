import http from 'http';
import { spawn } from 'child_process';

// Start a persistent Python process
const pythonProcess = spawn('python', ['-i']);

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      // Send the received Python code to the Python process
      console.log('executing', body);
      pythonProcess.stdin.write(body + '\n');
      
      // Collect the output
      let output = '';
      pythonProcess.stdout.once('data', (data) => {
        output += data.toString();
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(output);
      });
    });
  } else {
    res.writeHead(405, {'Content-Type': 'text/plain'});
    res.end('Method Not Allowed');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Handle Python process closure
pythonProcess.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
});