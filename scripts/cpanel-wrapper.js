/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const fs = require('fs');

/**
 * Ishta Crafts — cPanel Entry Point Wrapper
 * This script ensures .env variables are loaded and then launches the Next.js standalone server.
 */

// 1. Manually load .env variables (cPanel Node.js Selector doesn't always handle them)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('> Loading environment variables from .env');
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const firstEqual = trimmedLine.indexOf('=');
      if (firstEqual !== -1) {
        const key = trimmedLine.substring(0, firstEqual).trim();
        let value = trimmedLine.substring(firstEqual + 1).trim();
        // Remove surrounding quotes
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    }
  });
}

// 2. Define Port
process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = 'production';

// 3. Launch Standalone Server
// Next.js standalone output contains its own server.js at .next/standalone/server.js
// But since our deployment script copies contents of standalone/ to the root, 
// the actual logic is often found in 'server.js' or we can require internal files.
const standaloneServer = path.join(__dirname, 'server.js');

// IMPORTANT: Avoid infinite loop if this script is named server.js
// If we are already running the standalone server's logic, we stop here.
// Instead, we will name this file 'app.js' or 'entry.js' for cPanel.

if (fs.existsSync(path.join(__dirname, '.next'))) {
    console.log(`> Starting Ishta Crafts on port ${process.env.PORT}...`);
    // If we are in the standalone folder, the real server is often handled by Next internally
    // We just need to ensure the environment is ready.
    require('./server.js'); 
} else {
    console.error('> Error: .next folder not found. Please run "npm run deploy:prep" first.');
    process.exit(1);
}
