import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const requiredFiles = [
  'index.html',
  'docs.html',
  'blog.html',
  'changelog.html',
  'package.json',
  'server.js'
];

let failed = false;

for (const file of requiredFiles) {
  const fullPath = path.join(rootDir, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`Missing required file: ${file}`);
    failed = true;
  }
}

const readme = path.join(rootDir, 'README.md');
if (!fs.existsSync(readme)) {
  console.error('Missing README.md');
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log('Basic repository checks passed.');
