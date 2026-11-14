// Path 1 unquant: the codex names its corpus; the bytes come back from the store.
// usage: node resolve_path1.mjs <codex.qr> <STORE-INDEX.hbp>
import fs from 'fs';
import crypto from 'crypto';
const codex = fs.readFileSync(process.argv[2]);
const name = crypto.createHash('sha256').update(codex).digest('hex');
console.log(`codex bytes=${codex.length} sha256=${name}`);
let hit = null;
for (const line of fs.readFileSync(process.argv[3], 'ascii').split('\n')) {
  const d = Object.fromEntries(line.split('|').filter(x => x.includes('=')).map(x => [x.slice(0, x.indexOf('=')), x.slice(x.indexOf('=') + 1)]));
  if (d.codex_sha256 === name) hit = d;
}
if (!hit) { console.log('RESOLVE=NOT_IN_STORE'); process.exit(0); }
const t = Date.now(); const h = crypto.createHash('sha256'); let n = 0;
for await (const chunk of fs.createReadStream(hit.path, { highWaterMark: 1 << 24 })) { h.update(chunk); n += chunk.length; }
console.log(`RESOLVE=${hit.corpus} returned_bytes=${n} expected_bytes=${hit.bytes} sha256=${h.digest('hex')} seconds=${((Date.now() - t) / 1000).toFixed(1)}`);
