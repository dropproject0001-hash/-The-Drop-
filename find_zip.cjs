const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
// Note: This is an extremely basic and probably insufficient unzip script for a full project,
// but for viewing purposes I might just want to list files in it.
// Actually, I'll use 'adm-zip' if I can.
console.log('Listing files in /:');
fs.readdirSync('/').forEach(file => {
  if (file.includes('.zip')) console.log('FOUND ZIP:', file);
});
