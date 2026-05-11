// Dear Diary — backup merger.
// Merges every dear-diary-backup-*.json file in this folder field-by-field,
// writing the result to dear-diary-merged.json.
//
// Merge rules (per date):
//   strings  → if one empty, use the other; if both non-empty, use the longer one
//   booleans → true wins over false
//   numbers  → max value wins
//   missing keys → take from whichever file has them
//
// Re-run with:   node Data/merge.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function mergeValue(a, b) {
  // a is the current merged value, b is the incoming value from a new file
  if (a === undefined) return b;
  if (b === undefined) return a;

  // Both objects → recurse field-by-field (union of keys)
  if (isPlainObject(a) && isPlainObject(b)) {
    const out = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) out[k] = mergeValue(a[k], b[k]);
    return out;
  }

  // Type-aware merge for scalars
  if (typeof a === 'boolean' && typeof b === 'boolean') return a || b;
  if (typeof a === 'number'  && typeof b === 'number')  return Math.max(a, b);

  // Strings (or anything else stringy): prefer non-empty, then longer
  const sa = (a == null) ? '' : String(a);
  const sb = (b == null) ? '' : String(b);
  if (sa.trim() === '' && sb.trim() !== '') return b;
  if (sb.trim() === '' && sa.trim() !== '') return a;
  if (sa.length >= sb.length) return a;
  return b;
}

function mergeEntries(target, incoming) {
  // target / incoming are objects keyed by ISO date.
  const out = { ...target };
  for (const date of Object.keys(incoming)) {
    out[date] = mergeValue(out[date], incoming[date]);
  }
  return out;
}

// --- main ---
const files = fs.readdirSync(__dirname)
  .filter(f => f.startsWith('dear-diary-backup-') && f.endsWith('.json'))
  .sort(); // chronological by filename

if (files.length === 0) {
  console.error('No dear-diary-backup-*.json files found in', __dirname);
  process.exit(1);
}

console.log('Merging', files.length, 'file(s):');
files.forEach(f => console.log('  -', f));

let merged = {};
let totalDatesIn = 0;
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8'));
  totalDatesIn += Object.keys(data).length;
  merged = mergeEntries(merged, data);
}

// Sort output keys chronologically for clean diffs
const sorted = {};
Object.keys(merged).sort().forEach(k => { sorted[k] = merged[k]; });

const outPath = path.join(__dirname, 'dear-diary-merged.json');
fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2), 'utf8');

console.log('\nResult:');
console.log('  Unique dates:', Object.keys(sorted).length);
console.log('  Total entries read (with overlaps):', totalDatesIn);
console.log('  Written to:', outPath);
