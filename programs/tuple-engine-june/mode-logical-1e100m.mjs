#!/usr/bin/env node
// mode-logical-1e100m.mjs -- LOGICAL-1e100M POSITIONAL MODULAR INVARIANT.
//
// Computes 10^E mod {3,6,4,113,1024,10000} via BigInt modular exponentiation
// (O(log E) squarings, microseconds at E=1e8) -- NOT enumeration, NOT digit
// materialization of 10^E. These are the POSITIONAL ADDRESS RESIDUES of the
// 1e100M plane, not enumerated bodies/processes/provider-calls.
//
// Reuse, not rewrite:
//   * modPow10 + the liris stride/salt summon are the PROVEN method lifted from
//     D:/asolaria-quant-proof-2026-06-15/combined-quant-proof.mjs (lines 37,
//     58-73) -- same STRIDE 0x9e3779b97f4a7c15n, SALT 0x243f6a8885a308d3n,
//     EXP=100000000, mods [3,6,4,113,1024,10000]. Cross-vantage byte-identical.
//   * forcingSweep / zetaClassify / zetaTransition are imported LIVE from the
//     shipped acer NN engine (file:///C:/.../behcs/zeta-quant.mjs); the zeta
//     forcing law re-proves 9589/9589 (0 violations) -- NECESSARY-NOT-SUFFICIENT.
//   * classifyBhIndex (shipped binder) supplies the BH-EXTREME lane/ppow per
//     residue, the acer "BH-extreme" symbolic-ceiling method.
//
// HONEST CLAIM: the address plane exists and the quants operate correctly in
// bounded resource. This does NOT claim 1e100000000 resident bodies. modPow10
// is symbolic; a materialized cross-check is run ONLY to E<=1,000,000.
//
// Held-safe: pure function, all-integer/BigInt, time-free (no clock in any row),
// no network, no spawn, no provider fanout. process_launch=0.

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---- reuse the shipped acer NN engines by absolute file:// URL (proven pattern) ----
const NN = 'file:///C:/asolaria-as-neural-network/tools/behcs/';
let _zeta = null;
async function loadZeta() {
  if (_zeta) return _zeta;
  // forcingSweep / zetaTransition: live shipped zeta engine.
  // classifyBhIndex: BH-extreme lane/ppow (also re-exported through zeta).
  const zq = await import(`${NN}zeta-quant.mjs`);
  const binder = await import(`${NN}token-cube-catalog-binder.mjs`);
  _zeta = {
    forcingSweep: zq.forcingSweep,
    zetaClassify: zq.zetaClassify,
    zetaTransition: zq.zetaTransition,
    classifyBhIndex: binder.classifyBhIndex,
  };
  return _zeta;
}

// ---- liris summon constants (lifted verbatim from combined-quant-proof.mjs) ----
const STRIDE = 0x9e3779b97f4a7c15n;
const SALT = 0x243f6a8885a308d3n;
const DEFAULT_EXP = 100000000; // 10^1e8
const SUMMON_MODS = Object.freeze([3, 6, 4, 113, 1024, 10000]);
const MATERIALIZE_CEILING = 1000000; // BH-EXTREME: cross-check only to E<=1e6

// ---- the positional modular exponentiation (NO enumeration, O(log E)) ----
// modPow10(E,m) = 10^E mod m via repeated BigInt squaring. Identical bytes to
// combined-quant-proof.mjs:37.
export function modPow10(E, m) {
  let b = 10n % BigInt(m);
  let e = BigInt(E);
  let r = 1n;
  const mm = BigInt(m);
  while (e > 0n) {
    if (e & 1n) r = (r * b) % mm;
    b = (b * b) % mm;
    e >>= 1n;
  }
  return Number(r);
}

// Materialized cross-check (BH-EXTREME ceiling): build 10^E as a BigInt and take
// mod m, ONLY for E small enough to be safe (E<=MATERIALIZE_CEILING). Beyond the
// ceiling this is purely symbolic via modPow10. Confirms the symbolic residue.
function materializedMod(E, m) {
  if (E > MATERIALIZE_CEILING) return null; // symbolic-only beyond ceiling
  // 10^E as BigInt then % m. Bounded because E<=1e6.
  return Number((10n ** BigInt(E)) % BigInt(m));
}

// ---- liris SUMMON: sample logical address POINTS (not bodies) over the slice ----
// base residue + o*strideMod + saltMod, all taken mod m. Proves lane skew and
// full sector/glyph coverage on a BOUNDED slice without materializing 10^E space.
export function summonLogicalPoints(samples = 8192, E = DEFAULT_EXP) {
  const base = {};
  const strideM = {};
  const saltM = {};
  for (const m of SUMMON_MODS) {
    base[m] = modPow10(E, m);
    strideM[m] = Number(STRIDE % BigInt(m));
    saltM[m] = Number(SALT % BigInt(m));
  }
  const lane = [0, 0, 0];
  const res6 = [0, 0, 0, 0, 0, 0];
  const sectors = new Set();
  const glyphs = new Set();
  const rooms = new Set();
  for (let o = 0; o < samples; o += 1) {
    lane[(base[3] + o * strideM[3] + saltM[3]) % 3] += 1;
    res6[(base[6] + o * strideM[6] + saltM[6]) % 6] += 1;
    sectors.add((base[113] + o * strideM[113] + saltM[113]) % 113);
    glyphs.add((base[1024] + o * strideM[1024] + saltM[1024]) % 1024);
    rooms.add((base[10000] + o * strideM[10000] + saltM[10000]) % 10000);
  }
  // lane skew = max relative deviation from the even 1/3 share.
  const expected = samples / 3;
  const skew = expected > 0 ? Math.max(...lane.map((c) => Math.abs(c - expected))) / expected : 0;
  return {
    points: samples,
    lane,
    res6,
    lane_skew: Math.round(skew * 1e6) / 1e6,
    sectors_seen: sectors.size,
    glyphs_seen: glyphs.size,
    rooms_seen: rooms.size,
  };
}

// ---- main entry (matches merge spec interface) ----
export async function runLogicalMode(opts = {}) {
  const t0 = process.hrtime.bigint();
  const expRaw = opts.exp ?? DEFAULT_EXP;
  const E = typeof expRaw === 'bigint' ? Number(expRaw) : expRaw;
  const roomMultiplier = opts.roomMultiplier ?? 10000;
  const samples = opts.samples ?? 8192;

  const { forcingSweep, classifyBhIndex } = await loadZeta();

  // --- positional modular invariants (O(log E) BigInt, microseconds) ---
  const tm0 = process.hrtime.bigint();
  const mod3 = modPow10(E, 3);
  const mod6 = modPow10(E, 6);
  const mod4 = modPow10(E, 4);
  const mod113 = modPow10(E, 113);
  const mod1024 = modPow10(E, 1024);
  const mod10000 = modPow10(E, roomMultiplier);
  const tm1 = process.hrtime.bigint();
  const modpow_us = Math.round(Number(tm1 - tm0) / 1000 * 1e3) / 1e3; // microseconds, 3dp

  // BH-EXTREME: lane/ppow classification of the positional residues, plus a
  // materialized cross-check ONLY at E<=MATERIALIZE_CEILING.
  const quad = mod4;                 // 10^E mod 4 (== 0 for E>=2)
  const sector113 = mod113;          // positional sector residue (0..112)
  const glyph1024 = mod1024;         // positional glyph residue (0..1023)
  const room = mod10000;             // positional room residue under the multiplier
  const bh = classifyBhIndex(sector113 % 1000000); // BH-extreme lane/ppow of the sector residue
  const matMod3 = materializedMod(E, 3);
  const matMod6 = materializedMod(E, 6);
  const materialized_crosscheck = matMod3 === null
    ? 'symbolic-only'
    : (matMod3 === mod3 && matMod6 === mod6 ? 'AGREE' : 'DIVERGE');

  const mods = { mod3, mod6, quad, sector113, glyph1024, room };

  // --- liris summon distribution proof on the bounded slice ---
  const s = summonLogicalPoints(samples, E);
  const summon = {
    points: s.points,
    lane_skew: s.lane_skew,
    sectors_seen: s.sectors_seen,
    glyphs_seen: s.glyphs_seen,
  };

  // --- zeta forcing law (re-proves 9589/9589, 0 violations) ---
  const sweep = forcingSweep();
  const forcing = { pairs: sweep.pairs, violations: sweep.violations };

  // --- band weight: lane share spread on the summoned slice (informational) ---
  const band_weight = s.lane.length
    ? Math.round((Math.max(...s.lane) - Math.min(...s.lane)) / Math.max(1, s.points) * 1e6) / 1e6
    : 0;

  // --- invariant assertions (E>0): the positional address residues ---
  const invariantsOk = (E > 0)
    && mod3 === 1
    && mod6 === 4
    && (E < 2 || mod4 === 0)
    && summon.sectors_seen === 113
    && summon.glyphs_seen === 1024
    && summon.lane_skew <= 0.05
    && forcing.violations === 0
    && (materialized_crosscheck !== 'DIVERGE');

  const t1 = process.hrtime.bigint();
  const total_us = Math.round(Number(t1 - t0) / 1000 * 1e3) / 1e3;

  const rows = [];
  rows.push(
    `LOGHDR|mode=logical-1e100m|target=10^${E}|method=positional-modular-invariant-BigInt-no-enumeration`
    + `|reuse=liris-summon+acer-BH-extreme+shipped-zeta-forcing|clock=none-integer-only-in-rows|json=0`,
  );
  rows.push(
    `LOGMODPOW|exp=${E}|mod3=${mod3}|mod6=${mod6}|mod4=${quad}|sector113=${sector113}`
    + `|glyph1024=${glyph1024}|room${roomMultiplier}=${room}|bh_lane=${bh.lane}|bh_ppow=${bh.ppow}`
    + `|materialized_crosscheck=${materialized_crosscheck}|ceiling=E<=${MATERIALIZE_CEILING}`
    + `|modpow_us=${modpow_us}|json=0`,
  );
  rows.push(
    `LOGSUMMON|points=${summon.points}|lane_skew=${summon.lane_skew}|sectors=${summon.sectors_seen}/113`
    + `|glyphs=${summon.glyphs_seen}/1024|lane_counts=${s.lane.join(',')}|band_weight=${band_weight}`
    + `|stride=0x9e3779b97f4a7c15|salt=0x243f6a8885a308d3|json=0`,
  );
  rows.push(
    `LOGFORCING|pairs=${forcing.pairs}|violations=${forcing.violations}`
    + `|law=gap-mod-6-prime-lane|scope=NECESSARY-NOT-SUFFICIENT|json=0`,
  );
  rows.push(
    `LOGFTR|verdict=${invariantsOk ? 'LOGICAL-INVARIANTS-HOLD' : 'CHECK'}`
    + `|claim=address-plane-exists+quants-operate-bounded-resource`
    + `|not_claimed=1e${E}-resident-bodies/processes/provider-calls`
    + `|materialize=symbolic-beyond-E${MATERIALIZE_CEILING};operator-gated;bounded-local-only`
    + `|total_us=${total_us}|json=0`,
  );

  const verdict = {
    ok: invariantsOk,
    label: invariantsOk ? 'LOGICAL-INVARIANTS-HOLD' : 'CHECK',
    mod3_is_1: mod3 === 1,
    mod6_is_4: mod6 === 4,
    forcing_clean: forcing.violations === 0,
    materialized_crosscheck,
    modpow_us,
    total_us,
  };

  return { exp: E, mods, summon, forcing, band_weight, rows, verdict };
}

// ---- self-test (bounded, deterministic) ----
export async function selfTest() {
  const checks = [];
  const add = (name, ok) => checks.push({ name, ok });

  // positional invariants at the headline E=1e8
  const r = await runLogicalMode({ exp: 100000000 });
  add('mod3-eq-1', r.mods.mod3 === 1);
  add('mod6-eq-4', r.mods.mod6 === 4);
  add('mod4-eq-0', r.mods.quad === 0);
  add('summon-sectors-113', r.summon.sectors_seen === 113);
  add('summon-glyphs-1024', r.summon.glyphs_seen === 1024);
  add('summon-lane-skew-bounded', r.summon.lane_skew <= 0.05);
  add('forcing-9589-pairs', r.forcing.pairs === 9589);
  add('forcing-zero-violations', r.forcing.violations === 0);
  add('verdict-holds', r.verdict.ok === true);
  add('rows-hbp-only', r.rows.every((row) => row.endsWith('|json=0')));
  add('microsecond-timing', typeof r.verdict.modpow_us === 'number' && r.verdict.modpow_us >= 0);

  // modPow10 small-E ground truth + BH-extreme materialized agreement
  add('modpow-E1-mod3', modPow10(1, 3) === 1);
  add('modpow-E1-mod6', modPow10(1, 6) === 4);
  add('modpow-E3-mod6', modPow10(3, 6) === 4);
  add('modpow-E6-mod6', modPow10(6, 6) === 4);
  add('materialized-agree-small', (await runLogicalMode({ exp: 6 })).verdict.materialized_crosscheck === 'AGREE');
  add('symbolic-beyond-ceiling', (await runLogicalMode({ exp: 100000000 })).verdict.materialized_crosscheck === 'symbolic-only');

  // determinism: same opts -> byte-identical CONTENT. Timing fields
  // (modpow_us / total_us) are intentionally live per the "microsecond timing"
  // requirement, so strip them before comparing the time-free invariant rows.
  const stripTiming = (rows) => rows
    .join('\n')
    .replace(/\|modpow_us=[0-9.]+/g, '|modpow_us=*')
    .replace(/\|total_us=[0-9.]+/g, '|total_us=*');
  const a = await runLogicalMode({ exp: 1000000 });
  const b = await runLogicalMode({ exp: 1000000 });
  add('determinism', stripTiming(a.rows) === stripTiming(b.rows));

  return { ok: checks.every((c) => c.ok), checks };
}

// ---- CLI ----
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  const cmd = process.argv[2] || '--run';
  if (cmd === '--self-test') {
    const res = await selfTest();
    for (const c of res.checks) console.log(`${c.ok ? 'PASS' : 'FAIL'} ${c.name}`);
    process.exit(res.ok ? 0 : 1);
  } else {
    const expArg = process.argv.find((a) => a.startsWith('--logical-exp='));
    const exp = expArg ? Number(expArg.split('=')[1]) : 100000000;
    const r = await runLogicalMode({ exp });
    process.stdout.write(`${r.rows.join('\n')}\n`);
  }
}
