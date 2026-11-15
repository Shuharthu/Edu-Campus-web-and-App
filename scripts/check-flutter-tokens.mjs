import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const featuresDir = path.join(repoRoot, 'apps', 'mobile', 'lib', 'features');

const rules = [
  {
    name: 'No raw Color(...) in feature code',
    pattern: /\bColor\s*\(/g,
  },
  {
    name: 'No raw Colors.* in feature code',
    pattern: /\bColors\.[a-zA-Z0-9_]+/g,
  },
  {
    name: 'No raw TextStyle(...) literals in feature code',
    pattern: /\bTextStyle\s*\(/g,
  },
  {
    name: 'No Material Icons in feature code (use PhosphorIcons)',
    pattern: /\bIcons\.[a-zA-Z0-9_]+/g,
  },
  {
    name: 'No raw numeric EdgeInsets in feature code (use AppSpacing)',
    pattern: /EdgeInsets\.(?:all|symmetric|only|fromLTRB)\([^)]*\b\d+(?:\.\d+)?\b/g,
  },
];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.dart')) acc.push(full);
  }
  return acc;
}

const files = walk(featuresDir);
let violations = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const rule of rules) {
    const matches = [...content.matchAll(rule.pattern)];
    for (const m of matches) {
      const line = content.slice(0, m.index).split('\n').length;
      console.error(
        `[flutter-token-lint] ${path.relative(repoRoot, file)}:${line}: ${rule.name} -> "${m[0]}"`,
      );
      violations++;
    }
  }
}

if (violations > 0) {
  process.exit(1);
}
console.log(`Checked ${files.length} Flutter feature file(s): 0 design-token violations.`);
