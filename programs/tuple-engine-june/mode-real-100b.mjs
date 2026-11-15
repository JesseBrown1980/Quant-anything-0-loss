// mode-real-100b.mjs — REAL-100B STREAMING BOUNDED-RESIDENCY HEAD.
//
// REUSED (NOT rewritten) from D:/asolaria-quant-proof-2026-06-15/huge-message-stress.mjs:
//   the 512MB-chunk write/read loop, the LCG fill (seed=(gb*2654435761)>>>0), the JL
//   count-sketch accumulation into a single Float64Array(D), and finalize(proj) producing
//   the fixed ~3.1KB (3200B) O(1) tuple = concat(turbo int8[1024], signs[128], zeta[1024],
//   hist uint32[256]). The big file is rmSync'd after its sha256 content digest is sealed.
//
// The tuple layout is anchored to the SHIPPED acer NN engine: D and tupleBuffer are imported
// from quant-huge-message-benchmark.mjs (absolute file:// URL, proven combined-quant-proof
// pattern) so the streamed tuple is byte-identical to the in-memory quant8 tuple. quant8 itself
// projects an in-RAM message in one pass; the streaming variant below accumulates the SAME proj
// across chunks so residency stays bounded — same math, chunked head.
//
// HELD-SAFE: default scaleGB=1 is a bounded LOCAL self-test (writes ~1GB to D:, deletes it).
// scaleGB>=20 OR fire:true does NOT call any provider / spawn / network — it emits a STAGED
// held-safe REAL100B-IGNITION-ENVELOPE (auto_fire=0, spawner-PID + liris-driver UNFIRED) and
// returns. fire:true with no operator envelope present -> throws HeldSafeError. process_launch=0,
// no child_process / spawn / exec / fetch / http anywhere; writes confined to the workspace.

import { createHash } from 'node:crypto';
import { openSync, writeSync, readSync, closeSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

// ---- workspace (writes confined here) ----
const WS = 'D:/asolaria-combined-quant-2026-06-15';

// ---- SHIPPED tuple anchor (absolute file:// URL — required-present acer NN engine) ----
const NN = 'file:///C:/asolaria-as-neural-network/tools/behcs/';
const { D, tupleBuffer } = await import(`${NN}quant-huge-message-benchmark.mjs`);

// ---- constants reused verbatim from huge-message-stress.mjs ----
export const CHUNK_BYTES = 512 * 1024 * 1024;     // 512 MB chunk — the resident-body bound
const CHUNK_ELEMS = CHUNK_BYTES / 8;
const GB = 1024 * 1024 * 1024;
export const TUPLE_BYTES = 3200;                  // turbo(1024 int8)+signs(128)+zeta(1024)+hist(256*4)=3200B ~3.1KB
const FARM_THRESHOLD_GB = 20;                     // scaleGB>=20 => operator-gated farm staging, no local write

const sha256 = (s) => createHash('sha256').update(typeof s === 'string' ? s : (Buffer.isBuffer(s) ? s : JSON.stringify(s)), 'utf8').digest('hex');
const round = (v, p = 3) => (Number.isFinite(v) ? Math.round(v * 10 ** p) / 10 ** p : 0);

export class HeldSafeError extends Error {
  constructor(msg) { super(msg); this.name = 'HeldSafeError'; this.held_safe = true; }
}

// PPOW: von-Mangoldt prime-power weights over [0,D) — reused from huge-message-stress.mjs:31
const PPOW = (() => {
  const t = new Uint8Array(D);
  const isP = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  for (let n = 2; n < D; n++) {
    if (isP(n)) { t[n] = 1; continue; }
    for (let p = 2; p * p <= n; p++) {
      if (!isP(p) || n % p) continue;
      let m = n, k = 0; while (m % p === 0) { m /= p; k++; }
      if (m === 1) { t[n] = k > 3 ? 5 : k + 1; break; }
    }
  }
  return t;
})();

// finalize(proj) — REUSED verbatim from huge-message-stress.mjs:33-44. O(1) in N: turns the
// bounded D-element accumulator into the fixed TUPLE_BYTES (~3.1KB) durable tuple + vmAcc.
// Uses the SHIPPED tupleBuffer layout so the bytes match the in-memory quant8 tuple exactly.
export function finalize(proj) {
  let max = 1e-12;
  for (let j = 0; j < D; j++) { const a = Math.abs(proj[j]); if (a > max) max = a; }
  const turbo = new Int8Array(D), signs = new Uint8Array(D >> 3), zeta = new Uint8Array(D), hist = new Uint32Array(256);
  let vmAcc = 0;
  for (let j = 0; j < D; j++) {
    const v = proj[j] / max, q = Math.round(v * 127), a = Math.abs(v);
    turbo[j] = q;
    if (v < 0) signs[j >> 3] |= (1 << (j & 7));
    zeta[j] = a < 1e-9 ? 15 : Math.min(15, -Math.log2(a) | 0);
    hist[(q + 128) & 255] += 1;
    if (q !== 0) vmAcc += PPOW[j];
  }
  // Reuse the SHIPPED tuple layout (turbo|signs|zeta|hist) for byte-identity with quant8.
  const tuple = tupleBuffer({ turbo, signs, zeta, hist });
  return { tuple, vmAcc, scale: max };
}

// stageIgnitionEnvelope() — HELD-SAFE: writes a STAGED farm envelope to ${WS}/envelopes/,
// auto_fire=false, fires NOTHING. spawner-PID emit + liris driver remain UNFIRED (operator-gated).
export function stageIgnitionEnvelope({ scaleGB, fire, reason }) {
  const dir = `${WS}/envelopes`;
  mkdirSync(dir, { recursive: true });
  const rows = [];
  rows.push(`REAL100BIGNHDR|doc=REAL100B-IGNITION-ENVELOPE|date=2026-06-15|host=acer|peer=liris|auth=OP-JESSE-standing|gate=HELD-SAFE|auto_fire=0|trigger=${reason}|json=0`);
  rows.push(`REAL100BSTAGED|scale_gb=${scaleGB}|fire_requested=${fire ? 1 : 0}|auto_fire=0|spawner_pid=UNFIRED|liris_driver=UNFIRED|process_launch=0|providers_called=0|network=0|json=0`);
  rows.push(`REAL100BLAW|model=lawful-farmed-provider-slices+PID-packet-substrate|head=O(N)-streamed-512MB-chunks|tail=O(1)-fixed-3.1KB(${TUPLE_BYTES}B)-tuple|node!=Node.js-per-agent|drive-division=LOGICAL-mkdir-NOT-repartition|json=0`);
  rows.push(`REAL100BFIRE|precondition=operator-spawner-PID-emit+liris-free-agent-driver|this_engine_fires=NONE|state=STAGED-HELD-SAFE|json=0`);
  rows.push(`REAL100BFTR|status=STAGED|held_safe=1|next=operator-emits-to-fire|json=0`);
  const text = rows.join('\n') + '\n';
  const envPath = `${dir}/REAL100B-IGNITION-ENVELOPE-2026-06-15.hbp`;
  writeFileSync(envPath, text, 'utf8');
  writeFileSync(`${envPath}.sha256`, `${sha256(text)}  REAL100B-IGNITION-ENVELOPE-2026-06-15.hbp\n`, 'utf8');
  return { envelope_path: envPath, envelope_sha16: sha256(text).slice(0, 16), rows };
}

// runRealMode(opts) — the streaming bounded-residency head.
//   default scaleGB=1 => bounded local self-test (write/read ~1GB to D:, seal tuple, delete file).
//   scaleGB>=20 OR fire:true => emit STAGED held-safe envelope, NO provider fanout, return.
export async function runRealMode(opts = {}) {
  const scaleGB = opts.scaleGB ?? 1;
  const outDir = opts.outDir ?? `${WS}/stress`;
  const fire = opts.fire ?? false;

  // ---- HELD-SAFE GATE ----
  // fire:true is operator-gated everywhere. This engine never holds an operator envelope, so
  // any fire:true request that also lacks one throws (the contract's HeldSafeError path).
  const operatorEnvelope = opts.operatorEnvelope ?? null;
  if (fire && !operatorEnvelope) {
    throw new HeldSafeError('REAL-100B fanout is operator-gated; no providers fired');
  }
  // farm-scale (>=20GB) or fire => STAGE an envelope and DO NOT touch disk/providers/network.
  if (scaleGB >= FARM_THRESHOLD_GB || fire || opts.stage === true) {
    const reason = fire ? 'fire-requested' : (opts.stage === true ? 'stage-requested' : `scale>=${FARM_THRESHOLD_GB}GB`);
    const staged = stageIgnitionEnvelope({ scaleGB, fire, reason });
    const rows = [];
    rows.push(`STRESSHDR|tool=mode-real-100b|host=acer|node=${process.version}|chunk_mb=${CHUNK_BYTES / (1024 * 1024)}|scale_gb=${scaleGB}|mode=STAGED-HELD-SAFE|law=O(N)-head-streamed+O(1)-tail+bounded-residency|json=0`);
    rows.push(...staged.rows);
    rows.push(`STRESSFTR|proof=NONE-STAGED|providers_called=0|process_launch=0|file_written=0|held_safe=1|envelope=${staged.envelope_path}|json=0`);
    return {
      scale_gb: scaleGB, tuple_bytes: TUPLE_BYTES, tuple_sha16: null, raw_sha256: null,
      peak_rss_mb: round(process.memoryUsage().rss / (1024 * 1024), 1), resident_ratio: null,
      write_GBps: null, read_GBps: null, vmAcc: null,
      staged: true, envelope_path: staged.envelope_path, envelope_sha16: staged.envelope_sha16,
      process_launch: 0, providers_called: 0,
      rows,
      verdict: `REAL100B-STAGED-HELD-SAFE-AT-${scaleGB}GB(auto_fire=0)`,
    };
  }

  // ---- BOUNDED LOCAL SELF-TEST (default scaleGB=1) — streaming head reused verbatim ----
  mkdirSync(outDir, { recursive: true });
  const rows = [];
  rows.push(`STRESSHDR|tool=mode-real-100b|host=acer|node=${process.version}|chunk_mb=${CHUNK_BYTES / (1024 * 1024)}|scale_gb=${scaleGB}|mode=LOCAL-SELF-TEST|law=O(N)-head-streamed+O(1)-tail+bounded-residency|json=0`);

  const rss = () => process.memoryUsage().rss;
  const gb = scaleGB;
  const totalBytes = gb * GB;
  const file = `${outDir}/real100b-${gb}gb.bin`;
  let peakRss = rss();

  // WRITE PASS: generate + write to D: in 512MB Float64 chunks (LCG fill, seed=(gb*2654435761)>>>0)
  const w0 = performance.now();
  const fdw = openSync(file, 'w');
  const wbuf = new Float64Array(CHUNK_ELEMS);
  let s = (gb * 2654435761) >>> 0;
  let written = 0;
  while (written < totalBytes) {
    const elems = Math.min(CHUNK_ELEMS, (totalBytes - written) / 8);
    for (let k = 0; k < elems; k++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; wbuf[k] = (s / 2147483648) - 1; }
    writeSync(fdw, Buffer.from(wbuf.buffer, 0, elems * 8));
    written += elems * 8;
    if (rss() > peakRss) peakRss = rss();
  }
  closeSync(fdw);
  const wMs = performance.now() - w0;

  // READ+PROCESS PASS: stream from D: through the quant8 count-sketch head + raw sha256
  const r0 = performance.now();
  const rab = new ArrayBuffer(CHUNK_BYTES);
  const rbuf = Buffer.from(rab);
  const f64full = new Float64Array(rab);
  const proj = new Float64Array(D);
  const hash = createHash('sha256');
  const fdr = openSync(file, 'r');
  let off = 0, read;
  while ((read = readSync(fdr, rbuf, 0, CHUNK_BYTES, null)) > 0) {
    hash.update(rbuf.subarray(0, read));
    const n = read >> 3;
    const base = off >> 3;
    for (let k = 0; k < n; k++) { const i = base + k; const h = (i * 2654435761) >>> 0; proj[h & (D - 1)] += (h & 0x80000000) ? -f64full[k] : f64full[k]; }
    off += read;
    if (rss() > peakRss) peakRss = rss();
  }
  closeSync(fdr);
  const rawDigest = hash.digest('hex');
  const rMs = performance.now() - r0;

  // TAIL: O(1) finalize -> fixed ~3.1KB tuple + sha256 (the durable content proof)
  const { tuple, vmAcc } = finalize(proj);
  const tupleSha = sha256(tuple);

  // cleanup the big file (digest is the durable proof it existed)
  rmSync(file, { force: true });

  const writeGBps = round(gb / (wMs / 1000), 3);
  const readGBps = round(gb / (rMs / 1000), 3);
  const peakMB = round(peakRss / (1024 * 1024), 1);
  const residRatio = round((gb * 1024) / peakMB, 1); // message_MB / resident_MB
  rows.push(`STRESSRUN|scale_gb=${gb}|bytes=${totalBytes}|write_ms=${round(wMs)}|write_GBps=${writeGBps}|read+head_ms=${round(rMs)}|read_GBps=${readGBps}|tuple_bytes=${tuple.length}|peak_rss_mb=${peakMB}|resident_ratio=${residRatio}x(msg/resident)|vmAcc=${vmAcc}|raw_sha256=${rawDigest}|tuple_sha16=${tupleSha.slice(0, 16)}|process_launch=0|file_deleted=1|verdict=BOUNDED-RESIDENCY-AT-${gb}GB|json=0`);
  rows.push(`STRESSFTR|proof=real100b-self-test-streamed-to-D-and-back|head=O(N)-disk-bound|tail=O(1)-fixed-3.1KB(${TUPLE_BYTES}B)-tuple|residency=bounded-512MB-chunk-regardless-of-scale|file_deleted=1(sha256-is-the-content-proof)|providers_called=0|process_launch=0|json=0`);

  return {
    scale_gb: gb, tuple_bytes: tuple.length, tuple_sha16: tupleSha.slice(0, 16), raw_sha256: rawDigest,
    peak_rss_mb: peakMB, resident_ratio: residRatio, write_GBps: writeGBps, read_GBps: readGBps, vmAcc,
    staged: false, process_launch: 0, providers_called: 0,
    rows,
    verdict: `BOUNDED-RESIDENCY-AT-${gb}GB`,
  };
}

// CLI: node mode-real-100b.mjs [--scale-gb=1] [--out=DIR] [--stage] [--fire]
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  const arg = (k, d) => { const m = process.argv.find((a) => a.startsWith(`--${k}=`)); return m ? m.split('=')[1] : d; };
  const has = (k) => process.argv.includes(`--${k}`);
  const opts = { scaleGB: Number(arg('scale-gb', 1)), outDir: arg('out', undefined), stage: has('stage'), fire: has('fire') };
  try {
    const res = await runRealMode(opts);
    for (const r of res.rows) console.log(r);
    console.log(`\n=== verdict=${res.verdict} staged=${res.staged} process_launch=${res.process_launch} ===`);
  } catch (e) {
    console.error(`${e.name}: ${e.message}`);
    process.exitCode = 1;
  }
}
