import fs from 'node:fs';
import path from 'node:path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const distDir = path.join(process.cwd(), 'dist');
fs.mkdirSync(distDir, { recursive: true });

fs.writeFileSync(
  path.join(distDir, 'health.json'),
  JSON.stringify({ status: 'UP' }, null, 2) + '\n',
);

fs.writeFileSync(
  path.join(distDir, 'info.json'),
  JSON.stringify({ version: pkg.version }, null, 2) + '\n',
);
