import fs from 'node:fs';
import path from 'node:path';
import { generateClientOutputs } from './generate-clients.mjs';

const out = generateClientOutputs();
let drifted = false;

for (const [filePath, expected] of [
  [out.tsPath, out.tsContent],
  [out.dartPath, out.dartContent],
]) {
  const actual = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
  if (actual !== expected) {
    console.error(`OpenAPI client drift detected: ${path.relative(process.cwd(), filePath)}`);
    drifted = true;
  }
}

if (drifted) {
  console.error('Run `pnpm openapi:export && pnpm openapi:generate` to sync clients.');
  process.exit(1);
}

console.log('OpenAPI TS and Dart clients are up to date.');
