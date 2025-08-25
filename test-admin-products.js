#!/usr/bin/env node

// Simple test script to check if admin products page loads
const http = require('http');

console.log('Testing admin products page...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/admin/products',
  method: 'GET',
  headers: {
    'User-Agent': 'Test-Script/1.0'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Admin products page loaded successfully');
      if (data.includes('Product Management')) {
        console.log('✅ Page contains expected content');
      } else {
        console.log('⚠️ Page content might be missing');
      }
    } else {
      console.log('❌ Failed to load admin products page');
      console.log('Response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
  console.log('Make sure the development server is running with: npm run dev');
});

req.end();
