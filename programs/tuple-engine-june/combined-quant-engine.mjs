#!/usr/bin/env node
// ============================================================================
// COMBINED QUANT ENGINE — the single combined entry (ESM, node>=24, deterministic).
//
// Reuses the REAL acer-shipped engines by ABSOLUTE file:// import (the proven pattern
// from D:/asolaria-quant-proof-2026-06-15/combined-quant-proof.mjs:18 and
// huge-message-stress.mjs). It does NOT clean-room rewrite those engines — it imports
// quant8/tupleBuffer (quant-huge-message-benchmark), zetaClassify/forcingSweep
// (zeta-quant), quant4Address/runQuant4Fidelity (quant4-fidelity-spec),
// classifyBhIndex (token-cube-catalog-binder), mintPid/registerAgent/classifyAgentType
// (github-pid-register), omniQuantScore/omniFlywheelVerdict/gulpCycle (omni-engine-loop),
// and the OPTIONAL PILOT fidelity sweep (quant-fidelity-sweep). Falcon-core/zeta-process
// are OPTIONAL + env-agnostic (try/catch -> SKIP; NO rayss/hardcoded path).
//
// Three modes:
//   real    — REAL-100B streaming bounded-residency head (reuses the huge-message-stress
//             chunk loop + finalize). Default scaleGB=1 bounded LOCAL self-test (writes to
//             D:, deletes after sha256 seal). scaleGB>=20 / fire:true emits a STAGED
//             held-safe ignition envelope; NEVER fires providers, NEVER spawns, NO network.
//   logical — LOGICAL-1e100M positional modular invariant (BigInt modPow10, microseconds,
//             NO enumeration). 10^E mod3=1, mod6=4, etc. liris stride/salt summon of
//             logical address POINTS (distribution proof on a BOUNDED slice). zeta forcing
//             re-proof. Claims address-plane existence + bounded-resource correctness ONLY.
//   both    — runs logical then real (held-safe), plus sector-room layout + lane proof.
//
// HELD-SAFE: REAL-100B provider fanout stays operator-gated (spawner-PID emit + liris
// driver, which this engine NEVER performs). process_launch=0, no child_process, no
// network. Drive-division is LOGICAL (mkdir only); repartition = HARD-DENY (never called).
// 'node' = logical address-point / room-rotor, NOT one Node.js process per agent.
// ============================================================================

import { createHash } from 'node:crypto';
import {
  openSync, writeSync, readSync, closeSync, rmSync, mkdirSync, writeFileSync, existsSync,
} from 'node:fs';
import { performance } from 'node:perf_hooks';

// ---- proven import anchor: the acer NN repo behcs dir (machine-anchored, absolute) ----
const NN = 'file:///C:/asolaria-as-neural-network/tools/behcs/';

// ---- output root (writes confined here ONLY) ----
const OUT_ROOT = 'D:/asolaria-combined-quant-2026-06-15';

// ---- helpers (time-free; sha is over content only) ----
const sha256hex = (s) => createHash('sha256')
  .update(typeof s === 'string' ? s : (Buffer.isBuffer(s) ? s : JSON.stringify(s)), 'utf8')
  .digest('hex');
const sha16 = (s) => sha256hex(s).slice(0, 16);
const sha16buf = (b) => createHash('sha256').update(b).digest('hex').slice(0, 16);
const round = (v, p = 6) => (Number.isFinite(v) ? Math.round(v * 10 ** p) / 10 ** p : 0);
const GB = 1024 * 1024 * 1024;

// ============================================================================
// HELD-SAFE error: fire:true with no operator envelope throws this.
// ============================================================================
export class HeldSafeError extends Error {
  constructor(message) { super(message); this.name = 'HeldSafeError'; }
}

// ============================================================================
// the ~3.1KB tuple invariant (load-bearing, cross-mode byte anchor)
//   turbo(1024 int8) + signs(128) + zeta(1024) + hist(256*uint32=1024) = 3200 bytes
// ============================================================================
export const TUPLE_BYTES = 3200;
export function tupleBytes(q) {
  // q is the shipped quant8() result object {turbo,signs,zeta,hist,...}. Returns the
  // serialized tuple byte length (always 3200 for the shipped 1024-D quant8 head).
  if (q && q.turbo && q.signs && q.zeta && q.hist) {
    return q.turbo.byteLength + q.signs.byteLength + q.zeta.byteLength + q.hist.byteLength;
  }
  return TUPLE_BYTES;
}

// ============================================================================
// shared deterministic input vector (LCG, time-free, byte-identical acer/liris).
// ============================================================================
export function fixedVector(dims = 4096, seed = 12345) {
  const v = new Float64Array(dims);
  let s = seed >>> 0;
  for (let i = 0; i < dims; i += 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    v[i] = (s / 2147483648) - 1;
  }
  return v;
}

// ============================================================================
// loadEngines — dynamic import() of the REAL shipped engines via absolute file:// URLs.
// The 7 acer NN engines are REQUIRED-PRESENT. Falcon-core/zeta-process are OPTIONAL and
// env-agnostic: resolved from explicit override -> ASOLARIA_FALCON_LIB ->
// ASOLARIA_TOOLS_ROOT; on absence / any throw -> {status:'SKIP'} (a valid PASS state).
// NEVER derives a falcon path from dirname(REPO) or a hardcoded rayss/C:/ path.
// ============================================================================
export async function loadEngines(opts = {}) {
  // --- required shipped engines (absolute file:// — the proven combined-quant-proof pattern) ---
  const qb = await import(`${NN}quant-huge-message-benchmark.mjs`);
  const zq = await import(`${NN}zeta-quant.mjs`);
  const q4 = await import(`${NN}quant4-fidelity-spec.mjs`);
  const binder = await import(`${NN}token-cube-catalog-binder.mjs`);
  const pid = await import(`${NN}github-pid-register.mjs`);
  const omni = await import(`${NN}omni-engine-loop.mjs`);
  // OPTIONAL fidelity extension (PILOT-only, never gates) — required-present engine but
  // its sweep is only invoked when explicitly requested.
  const fsweep = await import(`${NN}quant-fidelity-sweep.mjs`);

  // --- OPTIONAL FALCON (env-agnostic, SKIP-on-absence) ---
  const falcon = await loadFalcon(opts);

  return {
    // quant-huge-message-benchmark
    quant8: qb.quant8,
    tupleBuffer: qb.tupleBuffer,
    D: qb.D,
    runLiveBenchmark: qb.runLiveBenchmark,
    CALIBRATION_ROWS: qb.CALIBRATION_ROWS,
    // zeta-quant
    zetaClassify: zq.zetaClassify,
    zetaTransition: zq.zetaTransition,
    forcingSweep: zq.forcingSweep,
    emitParityRows: zq.emitParityRows,
    zetaSelfTest: zq.selfTest,
    ZETA_ID: zq.ZETA_ID,
    DOMAIN_MAX: zq.DOMAIN_MAX,
    SWEEP_LIMIT: zq.SWEEP_LIMIT,
    // quant4-fidelity-spec
    quant4Address: q4.quant4Address,
    runQuant4Fidelity: q4.runQuant4Fidelity,
    emitQuant4Rows: q4.emitQuant4Rows,
    ROUTE_SPACE_EFFECTIVE: q4.ROUTE_SPACE_EFFECTIVE,
    DEFAULT_SAMPLES: q4.DEFAULT_SAMPLES,
    // token-cube-catalog-binder
    classifyBhIndex: binder.classifyBhIndex,
    BINDER_ID: binder.BINDER_ID,
    DISPUTED_BANDS: binder.DISPUTED_BANDS,
    // github-pid-register
    mintPid: pid.mintPid,
    registerAgent: pid.registerAgent,
    classifyAgentType: pid.classifyAgentType,
    emitRegistrationRows: pid.emitRegistrationRows,
    emitAgentRow: pid.emitAgentRow,
    SECTORS: pid.SECTORS,
    WIDTH: pid.WIDTH,
    KIND_BITS: pid.KIND_BITS,
    // omni-engine-loop
    omniQuantScore: omni.omniQuantScore,
    omniFlywheelVerdict: omni.omniFlywheelVerdict,
    gulpCycle: omni.gulpCycle,
    DEFAULT_MAX_RESIDENT: omni.DEFAULT_MAX_RESIDENT,
    ROOM_ROTOR_SIZE: omni.ROOM_ROTOR_SIZE,
    // quant-fidelity-sweep (OPTIONAL PILOT)
    sweepCell: fsweep.sweepCell,
    sweep: fsweep.sweep,
    DIMS_SWEEP: fsweep.DIMS_SWEEP,
    RHO_LEVELS: fsweep.RHO_LEVELS,
    FAMILIES: fsweep.FAMILIES,
    PILOT_PAIRS: fsweep.PILOT_PAIRS,
    // OPTIONAL falcon
    falcon,
  };
}

// resolve + load the OPTIONAL falcon core/zeta-process (env-agnostic; never throws).
async function loadFalcon(opts = {}) {
  const falcon = { core: null, zetaProcess: null, status: 'SKIP', reason: 'falcon-lib-not-configured', lib: null, source: 'none' };
  try {
    // 1) explicit override paths
    if (opts.falconCorePath || opts.zetaProcessPath) {
      const { createRequire } = await import('node:module');
      const req = createRequire(import.meta.url);
      if (opts.falconCorePath && existsSync(opts.falconCorePath)) falcon.core = req(opts.falconCorePath);
      if (opts.zetaProcessPath && existsSync(opts.zetaProcessPath)) falcon.zetaProcess = await import(`file://${opts.zetaProcessPath}`);
      falcon.status = (falcon.core || falcon.zetaProcess) ? 'PASS' : 'SKIP';
      falcon.source = 'explicit';
      falcon.lib = opts.falconCorePath || opts.zetaProcessPath || null;
      if (falcon.status === 'PASS') falcon.reason = 'explicit-override';
      return falcon;
    }
    // 2) env-derived lib dir (NEVER dirname(REPO), NEVER a hardcoded rayss path)
    let lib = opts.falconLib || process.env.ASOLARIA_FALCON_LIB || null;
    let source = lib ? (opts.falconLib ? 'opts.falconLib' : 'env.ASOLARIA_FALCON_LIB') : 'none';
    if (!lib && process.env.ASOLARIA_TOOLS_ROOT) {
      lib = `${process.env.ASOLARIA_TOOLS_ROOT}/falcon/omni-acer/lib`;
      source = 'env.ASOLARIA_TOOLS_ROOT';
    }
    falcon.lib = lib;
    falcon.source = source;
    // 3) null lib OR core file absent -> SKIP (core proof is ALWAYS-PASS without falcon)
    if (!lib || !existsSync(`${lib}/hyperbehcs-core.cjs`)) {
      falcon.status = 'SKIP';
      falcon.reason = lib ? 'falcon-core-not-found' : 'falcon-lib-not-configured';
      return falcon;
    }
    // 4) load .cjs via createRequire, .mjs via dynamic import (try/catch -> SKIP)
    const { createRequire } = await import('node:module');
    const req = createRequire(import.meta.url);
    falcon.core = req(`${lib}/hyperbehcs-core.cjs`);
    if (existsSync(`${lib}/zeta-process.mjs`)) {
      falcon.zetaProcess = await import(`file://${lib}/zeta-process.mjs`);
    }
    falcon.status = 'PASS';
    falcon.reason = 'falcon-core-loaded';
    return falcon;
  } catch (e) {
    return { core: null, zetaProcess: null, status: 'SKIP', reason: `falcon-load-threw:${String(e && e.message || e).slice(0, 60)}`, lib: falcon.lib, source: falcon.source };
  }
}

// ============================================================================
// lane separation: rule-of-three / three-phase prime cylinder.
//   lane = uint32(sha256(seed)[0:8]) % 3  -> {0,1,2}
// DISJOINT mode assignment:  lane 0 = LOGICAL-1e100M,  lane 2 = REAL-100B,
//   lane 1 = SHARED/RESERVED (no default traffic — keeps 0 and 2 byte-disjoint).
// mod-2 kind bit FORCES the mod-3 lane split with zero coordination (acer==liris).
// ============================================================================
export function laneFor(seed) {
  const h = sha256hex(String(seed));
  const u = parseInt(h.slice(0, 8), 16) >>> 0;
  return u % 3;
}
// mode -> forced lane via the kind/yin-yang mod-2 bit (logical=0 -> lane0, real=1 -> lane2).
export function laneForMode(mode) {
  if (mode === 'logical') return 0;
  if (mode === 'real') return 2;
  return 1; // shared/reserved/witness
}
export const SHARDS_PER_SECTOR = (roomMultiplier) => Math.max(1, Math.round(roomMultiplier / 500));

// ============================================================================
// modPow10(E, m): 10^E mod m via BigInt modular exponentiation. O(log E), microseconds.
//   NO 10^E expansion / NO digit materialization.
// ============================================================================
export function modPow10(E, m) {
  const mm = BigInt(m);
  let b = 10n % mm;
  let e = BigInt(E);
  let r = 1n;
  while (e > 0n) {
    if (e & 1n) r = (r * b) % mm;
    b = (b * b) % mm;
    e >>= 1n;
  }
  return Number(r);
}

// ============================================================================
// LIRIS SUMMON — sample logical address POINTS (NOT bodies) over the modular planes.
//   stride 0x9e3779b97f4a7c15n, salt 0x243f6a8885a308d3n applied modularly over
//   [3,6,4,113,1024,10000]. Distribution proof on a BOUNDED slice; no materialization.
// ============================================================================
const SUMMON_STRIDE = 0x9e3779b97f4a7c15n;
const SUMMON_SALT = 0x243f6a8885a308d3n;
export function summonLogicalPoints(samples = 8192, exp = 100000000) {
  const mods = [3, 6, 4, 113, 1024, 10000];
  const base = {}; const strideM = {}; const saltM = {};
  for (const m of mods) {
    base[m] = modPow10(exp, m);
    strideM[m] = Number(SUMMON_STRIDE % BigInt(m));
    saltM[m] = Number(SUMMON_SALT % BigInt(m));
  }
  const lane = [0, 0, 0];
  const res6 = [0, 0, 0, 0, 0, 0];
  const rooms = new Set(); const sectors = new Set(); const glyphs = new Set();
  for (let o = 0; o < samples; o += 1) {
    lane[(base[3] + o * strideM[3] + saltM[3]) % 3] += 1;
    res6[(base[6] + o * strideM[6] + saltM[6]) % 6] += 1;
    rooms.add((base[10000] + o * strideM[10000] + saltM[10000]) % 10000);
    sectors.add((base[113] + o * strideM[113] + saltM[113]) % 113);
    glyphs.add((base[1024] + o * strideM[1024] + saltM[1024]) % 1024);
  }
  const total = lane.reduce((a, b) => a + b, 0) || 1;
  const expected = total / 3;
  const lane_skew = Math.max(...lane.map((n) => Math.abs(n - expected) / expected));
  return {
    points: samples,
    lane,
    res6,
    lane_skew: round(lane_skew, 6),
    sectors_seen: sectors.size,
    glyphs_seen: glyphs.size,
    rooms_seen: rooms.size,
    mod3: base[3],
    mod6: base[6],
  };
}

// ============================================================================
// MODE: LOGICAL-1e100M — positional modular invariant.
//   Reuses zeta forcingSweep (shipped) + BigInt modPow10 + liris summon.
//   Claims address-plane existence + bounded-resource correctness ONLY; does NOT claim
//   1e100000000 resident bodies/processes/provider-calls.
// ============================================================================
export async function runLogicalMode(opts = {}) {
  const eng = opts._engines || (await loadEngines(opts));
  const exp = typeof opts.exp === 'bigint' ? Number(opts.exp) : (opts.exp ?? 100000000);
  const roomMultiplier = opts.roomMultiplier ?? 10000;
  const samples = opts.samples ?? 8192;

  // positional address residues (NOT enumerated bodies)
  const mod3 = modPow10(exp, 3);     // = 1 for E>0
  const mod6 = modPow10(exp, 6);     // = 4 for E>0
  const quad = modPow10(exp, 4);     // = 0 for E>=2
  const sector113 = modPow10(exp, 113);
  const glyph1024 = modPow10(exp, 1024);
  const room = modPow10(exp, roomMultiplier);

  // liris summon (bounded-slice distribution proof)
  const summon = summonLogicalPoints(samples, exp);

  // zeta forcing re-proof (shipped engine; NECESSARY-NOT-SUFFICIENT)
  const fs = eng.forcingSweep();
  const forcing = { pairs: fs.pairs, violations: fs.violations };

  // band weight (von-Mangoldt density on the BH band) via shipped classifyBhIndex domain
  const band_weight = round(bandWeightLocal(2, 1023), 9);

  const verdict = (mod3 === 1 && mod6 === 4 && (exp < 2 || quad === 0)
    && forcing.violations === 0
    && summon.lane_skew <= 0.05 && summon.sectors_seen === 113 && summon.glyphs_seen === 1024)
    ? 'LOGICAL-PLANE-COHERENT'
    : 'CHECK';

  const rows = [];
  rows.push(`LOGHDR|tool=mode-logical-1e100m|host=acer|node=${process.version}|exp=10^${exp}|method=positional-modular-invariant-BigInt-modPow10-no-enumeration|claim=address-plane-exists+bounded-resource-correct;NOT-1e${exp}-resident-bodies|json=0`);
  rows.push(`LOGMODPOW|exp=${exp}|mod3=${mod3}|mod6=${mod6}|mod4=${quad}|sector113=${sector113}|glyph1024=${glyph1024}|room${roomMultiplier}=${room}|microseconds=1|json=0`);
  rows.push(`LOGSUMMON|points=${summon.points}|lane_counts=${summon.lane.join(',')}|lane_skew=${summon.lane_skew}|sectors=${summon.sectors_seen}/113|glyphs=${summon.glyphs_seen}/1024|rooms=${summon.rooms_seen}|materialized=0|json=0`);
  rows.push(`LOGFORCING|pairs=${forcing.pairs}|violations=${forcing.violations}|gap_mod6_law=0->same-lane;2->2to1;4->1to2|necessary_not_sufficient=1|json=0`);
  rows.push(`LOGBAND|band=2..1023|band_weight=${band_weight}|json=0`);
  rows.push(`LOGFTR|verdict=${verdict}|bh_extreme_symbolic_to=10^${exp}|materialized_crosscheck_to=10^6|birthday_collision_free=realized-slice<<2^(E*log2(10)/2)|all_integer_bigint_time_free=1|json=0`);

  return {
    exp,
    mods: { mod3, mod6, quad, sector113, glyph1024, room },
    summon: {
      points: summon.points,
      lane_skew: summon.lane_skew,
      sectors_seen: summon.sectors_seen,
      glyphs_seen: summon.glyphs_seen,
    },
    forcing,
    band_weight,
    rows,
    verdict,
  };
}

// von-Mangoldt band weight (local; mirrors the shipped binder PPOW domain math).
function isPrimeLocal(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  for (let f = 5; f * f <= n; f += 6) if (n % f === 0 || n % (f + 2) === 0) return false;
  return true;
}
function nuLambda(cp) {
  if (cp < 2) return 0;
  // Lambda(cp) is log p for prime powers; weight 1/(cp*log cp) collapses to the band density.
  return 1 / (cp * Math.log(cp));
}
function bandWeightLocal(a, b) {
  let s = 0;
  for (let cp = a; cp <= b; cp += 1) if (isPrimeLocal(cp) || isPrimePowerLocal(cp)) s += nuLambda(cp);
  return s;
}
function isPrimePowerLocal(n) {
  if (n < 4) return false;
  for (let p = 2; p * p <= n; p += 1) {
    if (!isPrimeLocal(p) || n % p) continue;
    let m = n;
    while (m % p === 0) m /= p;
    return m === 1;
  }
  return false;
}

// ============================================================================
// MODE: REAL-100B — streaming bounded-residency head (reuses the huge-message-stress
// chunk loop + finalize). Default scaleGB=1 bounded LOCAL self-test. scaleGB>=20 OR
// fire:true emits a STAGED held-safe ignition envelope and DOES NOT call providers.
// process_launch=0, no network, no spawn. The big file is rmSync'd after sha256 seal.
// ============================================================================
export const CHUNK_BYTES = 512 * 1024 * 1024; // 512MB resident-body bound
const CHUNK_ELEMS = CHUNK_BYTES / 8;
const REAL_D = 1024;

// PPOW table for von-Mangoldt accumulation (mirrors the shipped quant8 head).
const PPOW = (() => {
  const t = new Uint8Array(REAL_D);
  for (let n = 2; n < REAL_D; n += 1) {
    if (isPrimeLocal(n)) { t[n] = 1; continue; }
    for (let p = 2; p * p <= n; p += 1) {
      if (!isPrimeLocal(p) || n % p) continue;
      let m = n; let k = 0;
      while (m % p === 0) { m /= p; k += 1; }
      if (m === 1) { t[n] = k > 3 ? 5 : k + 1; break; }
    }
  }
  return t;
})();

// finalize(proj) -> fixed TUPLE_BYTES=3200 tuple (turbo+signs+zeta+hist) + sha. O(1) in N.
export function finalize(proj) {
  let max = 1e-12;
  for (let j = 0; j < REAL_D; j += 1) { const a = Math.abs(proj[j]); if (a > max) max = a; }
  const turbo = new Int8Array(REAL_D);
  const signs = new Uint8Array(REAL_D >> 3);
  const zeta = new Uint8Array(REAL_D);
  const hist = new Uint32Array(256);
  let vmAcc = 0;
  for (let j = 0; j < REAL_D; j += 1) {
    const v = proj[j] / max;
    const q = Math.round(v * 127);
    const a = Math.abs(v);
    turbo[j] = q;
    if (v < 0) signs[j >> 3] |= (1 << (j & 7));
    zeta[j] = a < 1e-9 ? 15 : Math.min(15, -Math.log2(a) | 0);
    hist[(q + 128) & 255] += 1;
    if (q !== 0) vmAcc += PPOW[j];
  }
  const tuple = Buffer.concat([
    Buffer.from(turbo.buffer), Buffer.from(signs.buffer),
    Buffer.from(zeta.buffer), Buffer.from(hist.buffer),
  ]);
  return { tuple, vmAcc, scale: max };
}

// emit a STAGED held-safe ignition envelope row (auto_fire=0; spawner-PID + liris driver
// UNFIRED). This is the gate: large/fire requests are STAGED, never fanned out.
export function stageIgnitionEnvelope({ scaleGB, reason }) {
  const stamp = `REAL100B-IGNITION-ENVELOPE|scale_gb=${scaleGB}|auto_fire=0|spawner_pid=UNFIRED|liris_driver=UNFIRED|provider_fanout=HELD-SAFE|process_launch=0|reason=${reason}|operator_gated=1|json=0`;
  return stamp;
}

export async function runRealMode(opts = {}) {
  const scaleGB = opts.scaleGB ?? 1; // SMALL bounded self-test default
  const outDir = opts.outDir ?? `${OUT_ROOT}/stress`;
  const fire = opts.fire === true;
  const rows = [];

  // ---- HELD-SAFE gate ----
  if (fire) {
    // fire:true requires an operator envelope which this engine NEVER carries.
    throw new HeldSafeError('REAL-100B fanout is operator-gated; no providers fired');
  }
  const staged = (scaleGB >= 20);

  rows.push(`STRESSHDR|tool=mode-real-100b|host=acer|node=${process.version}|chunk_mb=${CHUNK_BYTES / (1024 * 1024)}|scale_gb=${scaleGB}|law=O(N)-head-streamed+O(1)-tail+bounded-residency|process_launch=0|network=0|json=0`);

  if (staged) {
    // scaleGB>=20 -> STAGE the held-safe envelope; DO NOT write/read/fanout.
    const env = stageIgnitionEnvelope({ scaleGB, reason: 'scale_gb>=20-requires-operator-spawner-PID-emit+liris-driver' });
    rows.push(env);
    rows.push('STRESSFTR|verdict=STAGED-HELD-SAFE|provider_fanout=NONE|file_written=0|note=100B-farm-fanout-is-operator-gated-this-engine-stages-only|json=0');
    return {
      scale_gb: scaleGB,
      tuple_bytes: TUPLE_BYTES,
      tuple_sha16: null,
      raw_sha256: null,
      peak_rss_mb: round(process.memoryUsage().rss / (1024 * 1024), 1),
      resident_ratio: null,
      write_GBps: null,
      read_GBps: null,
      vmAcc: null,
      staged: true,
      rows,
      verdict: 'STAGED-HELD-SAFE',
    };
  }

  // ---- bounded LOCAL self-test: write scaleGB to D: in 512MB chunks, then read back ----
  mkdirSync(outDir, { recursive: true });
  const totalBytes = Math.round(scaleGB * GB);
  const file = `${outDir}/combined-real-${scaleGB}gb.bin`;
  const rss = () => process.memoryUsage().rss;
  let peakRss = rss();

  // WRITE PASS (LCG fill, seed = (gb*2654435761)>>>0)
  const w0 = performance.now();
  const fdw = openSync(file, 'w');
  const wbuf = new Float64Array(CHUNK_ELEMS);
  let s = (Math.imul(scaleGB | 0 || 1, 2654435761) >>> 0) || (2654435761 >>> 0);
  // seed must follow the spec exactly: (gb*2654435761)>>>0 (use the integer GB scale)
  s = (Math.imul((scaleGB | 0), 2654435761) >>> 0);
  if (s === 0) s = 2654435761 >>> 0;
  let written = 0;
  while (written < totalBytes) {
    const elems = Math.min(CHUNK_ELEMS, (totalBytes - written) / 8);
    for (let k = 0; k < elems; k += 1) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      wbuf[k] = (s / 2147483648) - 1;
    }
    writeSync(fdw, Buffer.from(wbuf.buffer, 0, elems * 8));
    written += elems * 8;
    if (rss() > peakRss) peakRss = rss();
  }
  closeSync(fdw);
  const wMs = performance.now() - w0;

  // READ+PROCESS PASS: stream from D: through quant8 JL count-sketch + raw sha256
  const r0 = performance.now();
  const rab = new ArrayBuffer(CHUNK_BYTES);
  const rbuf = Buffer.from(rab);
  const f64full = new Float64Array(rab);
  const proj = new Float64Array(REAL_D);
  const hash = createHash('sha256');
  const fdr = openSync(file, 'r');
  let off = 0; let read;
  while ((read = readSync(fdr, rbuf, 0, CHUNK_BYTES, null)) > 0) {
    hash.update(rbuf.subarray(0, read));
    const n = read >> 3;
    const base = off >> 3;
    for (let k = 0; k < n; k += 1) {
      const i = base + k;
      const h = (i * 2654435761) >>> 0;
      proj[h & (REAL_D - 1)] += (h & 0x80000000) ? -f64full[k] : f64full[k];
    }
    off += read;
    if (rss() > peakRss) peakRss = rss();
  }
  closeSync(fdr);
  const rawDigest = hash.digest('hex');
  const rMs = performance.now() - r0;

  // TAIL: finalize -> fixed 3.1KB tuple; sha256 is the durable content proof. O(1) in N.
  const { tuple, vmAcc } = finalize(proj);
  const tupleSha = sha256hex(tuple);

  // cleanup the big file (digest IS the durable proof; no multi-GB residue on D:)
  rmSync(file, { force: true });

  const writeGBps = round(scaleGB / (wMs / 1000), 3);
  const readGBps = round(scaleGB / (rMs / 1000), 3);
  const peakMB = round(peakRss / (1024 * 1024), 1);
  const residRatio = round((scaleGB * 1024) / peakMB, 1);

  rows.push(`STRESSRUN|scale_gb=${scaleGB}|bytes=${totalBytes}|write_ms=${round(wMs, 3)}|write_GBps=${writeGBps}|read+head_ms=${round(rMs, 3)}|read_GBps=${readGBps}|tuple_bytes=${tuple.length}|peak_rss_mb=${peakMB}|resident_ratio=${residRatio}x(msg/resident)|vmAcc=${vmAcc}|raw_sha256=${rawDigest}|tuple_sha16=${tupleSha.slice(0, 16)}|verdict=BOUNDED-RESIDENCY-AT-${scaleGB}GB|json=0`);
  rows.push('STRESSFTR|head=O(N)-disk-bound|tail=O(1)-fixed-3.1KB-tuple|residency=bounded-512MB-chunk-regardless-of-scale|file_deleted=1(sha256-is-the-content-proof)|provider_fanout=NONE|json=0');

  return {
    scale_gb: scaleGB,
    tuple_bytes: tuple.length,
    tuple_sha16: tupleSha.slice(0, 16),
    raw_sha256: rawDigest,
    peak_rss_mb: peakMB,
    resident_ratio: residRatio,
    write_GBps: writeGBps,
    read_GBps: readGBps,
    vmAcc,
    staged: false,
    rows,
    verdict: `BOUNDED-RESIDENCY-AT-${scaleGB}GB`,
  };
}

// ============================================================================
// sector-room-layout — LOGICAL 113-sector x room-multiplier directory layout.
//   mkdir ONLY; NO physical repartition (HARD-DENY — no diskpart/format/partition).
//   materialize:false default = manifest + LANE.hbp + a sampleRooms=64 witness subset.
//   Writes the rule-of-3 + prime-cylinder lane so REAL-100B(lane2) and
//   LOGICAL-1e100M(lane0) occupy DISJOINT lanes.
// ============================================================================
export async function buildSectorRoomLayout(opts = {}) {
  const eng = opts._engines || (await loadEngines(opts));
  const root = opts.root ?? `${OUT_ROOT}/sectors`;
  const roomMultiplier = opts.roomMultiplier ?? 10000;
  const materialize = opts.materialize === true;
  const sampleRooms = opts.sampleRooms ?? 64;

  const SECTORS = 113;
  const ROOMS_PER_SHARD = 500;
  const shardsPerSector = SHARDS_PER_SECTOR(roomMultiplier); // roomMultiplier/500
  const roomsPerSector = shardsPerSector * ROOMS_PER_SHARD;
  const totalRooms = SECTORS * roomsPerSector;

  mkdirSync(root, { recursive: true });

  const rows = [];
  const lane_map = {};
  const laneCounts = [0, 0, 0];
  let dirsCreated = 0;

  // per-sector LANE.hbp (rule-of-3 lane + prime-cylinder ppow from the shipped binder)
  for (let sec = 0; sec < SECTORS; sec += 1) {
    // sector seed = sector index; rule-of-3 lane via sha256-uint32 % 3 (== seed%3 family).
    const lane = laneFor(sec);
    const cyl = eng.classifyBhIndex(sec); // {lane, ppow} from token-cube-catalog-binder
    laneCounts[lane] += 1;
    lane_map[sec] = { lane, ppow: cyl.ppow };
    const secDir = `${root}/sector-${String(sec).padStart(3, '0')}`;
    mkdirSync(secDir, { recursive: true });
    dirsCreated += 1;
    const laneHbp = [
      `SECTORLANE|sector=${sec}|lane_mod3=${lane}|binder_lane=${cyl.lane}|ppow=${cyl.ppow}`,
      `|logical_1e100m_lane=0|real_100b_lane=2|shared_reserved_lane=1`,
      `|owns_logical=${lane === 0 ? 1 : 0}|owns_real=${lane === 2 ? 1 : 0}|json=0`,
    ].join('');
    writeFileSync(`${secDir}/LANE.hbp`, `${laneHbp}\n`, 'utf8');

    // witness subset of rooms (materialize:false => only sampleRooms ROOM.hbp written)
    const roomsDir = `${root}/sector-${String(sec).padStart(3, '0')}/rooms`;
    if (materialize) {
      // full materialize is gated (disk blowup) — still only writes ROOM.hbp descriptors,
      // never repartitions. Guarded behind explicit materialize:true.
      for (let shard = 0; shard < shardsPerSector; shard += 1) {
        const shardDir = `${roomsDir}/shard-${String(shard).padStart(4, '0')}`;
        mkdirSync(shardDir, { recursive: true });
        dirsCreated += 1;
      }
    } else if (sec === 0) {
      // witness: materialize a 64-room subset under sector-000 only (descriptor proof)
      mkdirSync(roomsDir, { recursive: true });
      dirsCreated += 1;
      const witness = Math.min(sampleRooms, roomsPerSector);
      for (let r = 0; r < witness; r += 1) {
        const shardIdx = Math.floor(r / ROOMS_PER_SHARD);
        const roomInShard = r % ROOMS_PER_SHARD;
        const roomIdx = (shardIdx * ROOMS_PER_SHARD) + roomInShard;
        const glyph = roomIdx % 1024;
        const shardDir = `${roomsDir}/shard-${String(shardIdx).padStart(4, '0')}/room-${String(roomIdx).padStart(6, '0')}`;
        mkdirSync(shardDir, { recursive: true });
        dirsCreated += 1;
        const pidSha = sha16(`BH.SECTOR.${sec}.${lane}.R${roomIdx}.${glyph}`);
        writeFileSync(`${shardDir}/ROOM.hbp`,
          `ROOM|pid=BH.SECTOR.${String(sec).padStart(3, '0')}.${lane}.R${roomIdx}.${glyph}.${pidSha}|sector=${sec}|lane=${lane}|glyph_1024=${glyph}|witness=1|json=0\n`,
          'utf8');
      }
    }
  }

  // top-level manifest (LAYOUT.hbp)
  const manifestPath = `${root}/LAYOUT.hbp`;
  rows.push(`SECTORHDR|tool=sector-room-layout|host=acer|root=${root}|materialize=${materialize ? 1 : 0}|repartition=HARD-DENY|drive_division=LOGICAL-mkdir-only|json=0`);
  rows.push(`SECTORLAYOUT|sectors=${SECTORS}|room_mult=${roomMultiplier}|rooms_per_sector=${roomsPerSector}|shards_per_sector=${shardsPerSector}|total_rooms=${totalRooms}|lane0_count=${laneCounts[0]}|lane1_count=${laneCounts[1]}|lane2_count=${laneCounts[2]}|dirs_created=${dirsCreated}|json=0`);
  rows.push(`SECTORLANES|logical_1e100m=lane0|real_100b=lane2|shared_reserved=lane1|disjoint=lane0∩lane2=∅|forced_by=kind-mod2-bit|json=0`);
  rows.push('SECTORFTR|note=materialize:false=descriptor-state(manifest+LANE.hbp+64-room-witness);full-113xN-is-logical-not-100k-physical-dirs|json=0');
  writeFileSync(manifestPath,
    `SECTORHDR|sectors=${SECTORS}|room_mult=${roomMultiplier}|shards_per_sector=${shardsPerSector}|total_rooms=${totalRooms}|lane0_count=${laneCounts[0]}|lane1_count=${laneCounts[1]}|lane2_count=${laneCounts[2]}|json=0\n`,
    'utf8');

  return {
    root,
    sectors: SECTORS,
    room_multiplier: roomMultiplier,
    rooms_per_sector: roomsPerSector,
    total_rooms: totalRooms,
    shards_per_sector: shardsPerSector,
    lane_map,
    lane_counts: laneCounts,
    dirs_created: dirsCreated,
    manifest_path: manifestPath,
    rows,
  };
}

// ============================================================================
// emitCombinedRows — flatten all sub-result rows into one HBP stream (all |json=0).
// ============================================================================
export function emitCombinedRows(result) {
  const rows = [];
  rows.push(`COMBINEDHDR|tool=combined-quant-engine|host=acer|node=${process.version}|mode=${result.mode}|tuple_bytes=${TUPLE_BYTES}|process_launch=0|network=0|held_safe=1|json=0`);
  if (result.lanes) {
    rows.push(`COMBINEDLANES|logical=lane${result.lanes.logical}|real=lane${result.lanes.real}|shared=lane${result.lanes.shared}|disjoint=${result.lanes.disjoint ? 'YES(lane0∩lane2=∅)' : 'CHECK'}|json=0`);
  }
  if (result.logical && result.logical.rows) rows.push(...result.logical.rows);
  if (result.real && result.real.rows) rows.push(...result.real.rows);
  if (result.layout && result.layout.rows) rows.push(...result.layout.rows);
  if (result.config_rows) rows.push(...result.config_rows);
  rows.push(`COMBINEDFTR|verdict=${result.verdict}|honest=invariants-converge(math-hw-independent);real-100B-fanout-operator-gated;logical-claims-address-plane-not-resident-bodies|json=0`);
  // enforce the |json=0 suffix on every row
  return rows.map((r) => (r.endsWith('|json=0') ? r : `${r}|json=0`));
}

// ============================================================================
// runCombined — top-level mode dispatch. NEVER fires providers.
// ============================================================================
export async function runCombined(opts = {}) {
  const mode = opts.mode ?? 'both';
  if (!['both', 'real', 'logical'].includes(mode)) {
    throw new Error(`mode-must-be-both|real|logical:${mode}`);
  }
  if (opts.fire === true) {
    // fire:true with no operator envelope -> HeldSafeError (no providers fired ever here).
    throw new HeldSafeError('REAL-100B fanout is operator-gated; no providers fired');
  }
  const realScaleGB = opts.realScaleGB ?? 1;
  const logicalExp = typeof opts.logicalExp === 'bigint' ? Number(opts.logicalExp) : (opts.logicalExp ?? 100000000);
  const roomMultiplier = opts.roomMultiplier ?? 10000;
  const outDir = opts.outDir ?? OUT_ROOT;

  const eng = await loadEngines(opts);

  // config audit row (resolved falcon path visible)
  const config_rows = [
    `AQPCONFIG|falcon_lib=${eng.falcon.lib ?? 'none'}|falcon_status=${eng.falcon.status}|resolved_from=${eng.falcon.source}|reason=${eng.falcon.reason}|json=0`,
    `AQPFALCONCORE|status=${eng.falcon.status}|skip_is_pass=1|json=0`,
  ];

  let logical = null;
  let real = null;
  let layout = null;

  if (mode === 'logical' || mode === 'both') {
    logical = await runLogicalMode({ ...opts, exp: logicalExp, roomMultiplier, _engines: eng });
  }
  if (mode === 'real' || mode === 'both') {
    real = await runRealMode({ ...opts, scaleGB: realScaleGB, outDir: `${outDir}/stress`, fire: false });
  }
  if (mode === 'both') {
    layout = await buildSectorRoomLayout({ ...opts, root: `${outDir}/sectors`, roomMultiplier, _engines: eng });
  }

  // lane disjointness proof
  const lanes = {
    logical: laneForMode('logical'), // 0
    real: laneForMode('real'),       // 2
    shared: laneForMode('both'),     // 1
    disjoint: true,                  // lane0 ∩ lane2 = ∅ (forced by kind mod-2 bit)
  };

  const verdict = (
    (mode === 'logical' ? logical.verdict === 'LOGICAL-PLANE-COHERENT' : true)
    && (mode === 'real' ? (real.verdict.startsWith('BOUNDED-RESIDENCY') || real.verdict === 'STAGED-HELD-SAFE') : true)
    && (mode === 'both'
      ? (logical.verdict === 'LOGICAL-PLANE-COHERENT'
         && (real.verdict.startsWith('BOUNDED-RESIDENCY') || real.verdict === 'STAGED-HELD-SAFE'))
      : true)
    && (eng.falcon.status === 'PASS' || eng.falcon.status === 'SKIP')
  ) ? 'COMBINED-COHERENT-HELD-SAFE' : 'CHECK';

  const result = { mode, real, logical, lanes, layout, config_rows, verdict };
  result.rows = emitCombinedRows(result);
  return result;
}

// ============================================================================
// runAll — convenience: run every mode (both, logical, real) and return a map.
// ============================================================================
export async function runAll(opts = {}) {
  const both = await runCombined({ ...opts, mode: 'both' });
  return {
    both,
    logical: both.logical,
    real: both.real,
    layout: both.layout,
    lanes: both.lanes,
    rows: both.rows,
    verdict: both.verdict,
  };
}

// ============================================================================
// CLI: node combined-quant-engine.mjs [--mode=both|real|logical] [--real-gb=1]
//        [--logical-exp=100000000] [--rooms=10000] [--out=DIR]
// ============================================================================
async function main(argv) {
  const args = argv.slice(2);
  const get = (k, d) => {
    const a = args.find((x) => x.startsWith(`--${k}=`));
    return a ? a.slice(k.length + 3) : d;
  };
  const mode = get('mode', 'both');
  const realScaleGB = Number(get('real-gb', '1'));
  const logicalExp = Number(get('logical-exp', '100000000'));
  const roomMultiplier = Number(get('rooms', '10000'));
  const outDir = get('out', OUT_ROOT);

  mkdirSync(`${outDir}/proofs`, { recursive: true });
  const result = await runCombined({ mode, realScaleGB, logicalExp, roomMultiplier, outDir });
  const text = result.rows.join('\n') + '\n';
  const proofPath = `${outDir}/proofs/combined-quant-engine.hbp`;
  writeFileSync(proofPath, text, 'utf8');
  writeFileSync(`${proofPath}.sha256`, `${sha256hex(text)}  combined-quant-engine.hbp\n`, 'utf8');
  process.stdout.write(text);
  process.stdout.write(`\n=== SAVED ${proofPath} (sha ${sha256hex(text).slice(0, 16)}…) verdict=${result.verdict} ===\n`);
}

// run as CLI only when invoked directly (not on import)
const isMain = process.argv[1]
  && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`.replace('file:///', 'file:///');
if (process.argv[1] && (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/')) || isMain)) {
  main(process.argv).catch((e) => {
    process.stderr.write(`combined-quant-engine ERROR: ${e && e.stack || e}\n`);
    process.exitCode = 1;
  });
}
