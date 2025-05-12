#!/usr/bin/env node
// This is a wrapper script to run next dev with the correct port and host settings
// Import the necessary modules
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Set the port from environment variable or default to 3000
const port = process.env.PORT || 3000;

// Run next dev command with the correct settings
const nextDev = spawn('npx', ['next', 'dev', '-p', port, '-H', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

// Handle process exit
nextDev.on('close', (code) => {
  process.exit(code);
});

// Handle errors
nextDev.on('error', (err) => {
  console.error('Failed to start Next.js development server:', err);
  process.exit(1);
});