/**
 * KharchaKart Render Keep-Alive Script
 *
 * Render Free Tier services spin down after 15 minutes of inactivity.
 * This script sends a lightweight HTTP ping every 5 minutes (300,000 ms)
 * to keep the service warm and eliminate "Application loading..." cold starts.
 *
 * Usage:
 *   node scripts/keep-alive.js
 *   npm run keep-alive
 */

const https = require('https');
const http = require('http');

const TARGET_URL = process.env.PING_URL || 'https://kharchakart.onrender.com/health';
const INTERVAL_MINUTES = parseInt(process.env.INTERVAL_MINUTES || '5', 10);
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

console.log('='.repeat(60));
console.log('🚀 KharchaKart Render Keep-Alive Service Started');
console.log(`🎯 Target URL : ${TARGET_URL}`);
console.log(`⏱️ Interval   : Every ${INTERVAL_MINUTES} minutes (${INTERVAL_MS / 1000}s)`);
console.log('='.repeat(60));

const pingService = () => {
  const startTime = Date.now();
  const timeString = new Date().toLocaleTimeString('en-US', { hour12: true });
  const client = TARGET_URL.startsWith('https') ? https : http;

  const req = client.get(TARGET_URL, (res) => {
    const elapsed = Date.now() - startTime;
    let rawData = '';

    res.on('data', (chunk) => {
      rawData += chunk;
    });

    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[${timeString}] ✅ Server Active! HTTP ${res.statusCode} (${elapsed}ms)`);
      } else {
        console.warn(`[${timeString}] ⚠️ Server responded with HTTP ${res.statusCode} (${elapsed}ms)`);
      }
    });
  });

  req.on('error', (err) => {
    const elapsed = Date.now() - startTime;
    console.error(`[${timeString}] ❌ Ping failed (${elapsed}ms): ${err.message}`);
  });

  req.setTimeout(60000, () => {
    req.destroy(new Error('Request timeout after 60s (server may be waking up)'));
  });
};

// First immediate ping on startup
pingService();

// Recurring interval
setInterval(pingService, INTERVAL_MS);
