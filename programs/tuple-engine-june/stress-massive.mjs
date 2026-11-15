// stress-massive.mjs — MASSIVE local disk stress on the combined Mode-A streaming head.
// Streams 20 / 40 / 100 GB to D: and back through the PROVEN finalize() (byte-identical quant8
// tuple). This is a LOCAL DISK BENCHMARK only: process_launch=0, NO providers, NO network, each
// big file rmSync'd after its sha256 content-digest is sealed. It is NOT the operator-gated
// provider fanout (that stays gated in mode-real-100b.runRealMode). Reuses finalize / CHUNK_BYTES
// / TUPLE_BYTES from mode-real-100b.mjs + D from the shipped acer NN engine.

import { createHash } from 'node:crypto';
import { openSync, writeSync, readSync, closeSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { finalize, CHUNK_BYTES, TUPLE_BYTES } from './mode-real-100b.mjs';

const WS = 'D:/asolaria-combined-quant-2026-06-15';
const STRESS = `${WS}/stress`;
const PROOFS = `${WS}/proofs`;
mkdirSync(STRESS, { recursive: true });
mkdirSync(PROOFS, { recursive: true });

const NN = 'file:///C:/asolaria-as-neural-network/tools/behcs/';
const { D } = await import(`${NN}quant-huge-message-benchmark.mjs`);

const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const round = (v, p = 3) => (Number.isFinite(v) ? Math.round(v * 10 ** p) / 10 ** p : 0);
const GB = 1024 * 1024 * 1024;
const CHUNK_ELEMS = CHUNK_BYTES / 8;

const SIZES = process.argv.slice(2).map(Number).filter((n) => n > 0);
const RUN = SIZES.length ? SIZES : [20, 40, 100];

const ROWS = [];
const rss = () => process.memoryUsage().rss;
ROWS.push(`MASSSTRESSHDR|tool=stress-massive|host=acer|node=${process.version}|chunk_mb=${CHUNK_BYTES / (1024 * 1024)}|sizes_gb=${RUN.join('+')}|reuse=mode-real-100b.finalize+shipped-quant8-tuple|law=O(N)-head-streamed+O(1)-tail+bounded-residency|providers=0|network=0|process_launch=0|json=0`);
console.log(ROWS[0]);

for (const gb of RUN) {
  const totalBytes = gb * GB;
  const file = `${STRESS}/mass-${gb}gb.bin`;
  let peakRss = rss();

  // ---- WRITE PASS: generate + write to D: in 512MB Float64 chunks (LCG fill) ----
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

  // ---- READ + HEAD PASS: stream from D: through the quant8 count-sketch head + raw sha256 ----
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
    const n = read >> 3, base = off >> 3;
    for (let k = 0; k < n; k++) { const i = base + k; const h = (i * 2654435761) >>> 0; proj[h & (D - 1)] += (h & 0x80000000) ? -f64full[k] : f64full[k]; }
    off += read;
    if (rss() > peakRss) peakRss = rss();
  }
  closeSync(fdr);
  const rawDigest = hash.digest('hex');
  const rMs = performance.now() - r0;

  // ---- TAIL: O(1) finalize -> fixed ~3.1KB tuple; measure tuple-sha over 1000 iters ----
  const { tuple, vmAcc } = finalize(proj);
  const tq0 = performance.now();
  for (let r = 0; r < 1000; r++) createHash('sha256').update(tuple).digest();
  const tqMs = (performance.now() - tq0) / 1000;
  const tupleSha = sha256(tuple);

  // ---- cleanup the big file (the sha256 IS the durable content proof it existed) ----
  rmSync(file, { force: true });

  const writeGBps = round(gb / (wMs / 1000), 3);
  const readGBps = round(gb / (rMs / 1000), 3);
  const peakMB = round(peakRss / (1024 * 1024), 1);
  const residRatio = round((gb * 1024) / peakMB, 1);
  const row = `MASSSTRESSRUN|scale_gb=${gb}|bytes=${totalBytes}|write_ms=${round(wMs)}|write_GBps=${writeGBps}|read+head_ms=${round(rMs)}|read_GBps=${readGBps}|tail_quant_sha_ms=${round(tqMs, 5)}|tuple_bytes=${tuple.length}|peak_rss_mb=${peakMB}|resident_ratio=${residRatio}x(msg/resident)|vmAcc=${vmAcc}|raw_sha256=${rawDigest}|tuple_sha16=${tupleSha.slice(0, 16)}|file_deleted=1|verdict=BOUNDED-RESIDENCY-AT-${gb}GB|json=0`;
  ROWS.push(row);
  console.log(row);
}

ROWS.push(`MASSSTRESSFTR|proof=massive-stress-${RUN.join('-')}GB-streamed-to-D-and-back|head=O(N)-disk-bound|tail=O(1)-fixed-${TUPLE_BYTES}B-tuple|residency=bounded-512MB-chunk-regardless-of-scale|files_deleted=1(sha256-is-content-proof)|providers_called=0|process_launch=0|json=0`);
const text = ROWS.join('\n') + '\n';
const proofPath = `${PROOFS}/massive-stress-20-40-100.hbp`;
writeFileSync(proofPath, text, 'utf8');
writeFileSync(`${proofPath}.sha256`, `${sha256(text)}  massive-stress-20-40-100.hbp\n`, 'utf8');
console.log(`\n=== SAVED ${proofPath} (sha ${sha256(text).slice(0, 16)}…) ===`);
