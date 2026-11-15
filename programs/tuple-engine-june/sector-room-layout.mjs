// sector-room-layout.mjs — the LOGICAL drive-division (mkdir + manifests only).
//
// ASOLARIA CANON (binding):
//   * Drive-division is LOGICAL (directories under sectors/), NOT physical repartition.
//     repartition = HARD-DENY: no diskpart / format / partition / volume calls anywhere.
//   * "node" means a logical address-point / room-rotor, NOT one Node.js process per
//     agent. We never spawn; 8-byte handles stay light; full materialize is gated.
//   * materialize:false (default) writes a manifest + per-sector rooms-manifest.hbp +
//     LANE.hbp + a small witness subset of real ROOM.hbp files. The full 113 x N room
//     grid is DESCRIPTOR-STATE (described by manifests), NOT 100k physical dirs — this
//     avoids disk blowup while keeping the layout reproducible and addressable.
//   * Real engine reuse: lane + prime-cylinder classification comes from the SHIPPED
//     acer engine token-cube-catalog-binder.mjs (classifyBhIndex) by absolute file://
//     import. We do NOT reimplement it.
//
// Runnable on plain node v24 (ESM). Deterministic; no clock/network/spawn in the
// default path. Writes are confined to root (under D:/asolaria-combined-quant-2026-06-15/).

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

// ---- REAL engine reuse (absolute file:// URL, machine-anchored to acer NN repo) ----
// classifyBhIndex(idx) -> { lane: idx%3, ppow:'unit'|'prime'|'p2'|'p3'|'pk'|'composite' }
// DISPUTED_BANDS carries the acer-liris 930..1229 overlap note (informational).
const NN = 'file:///C:/asolaria-as-neural-network/tools/behcs/';
const { classifyBhIndex, BINDER_ID, DISPUTED_BANDS } = await import(NN + 'token-cube-catalog-binder.mjs');

// ---------------------------------------------------------------------------
// Layout constants (match the merge spec exactly).
// ---------------------------------------------------------------------------
export const LAYOUT_ID = 'sector-room-layout.v1';
export const SECTORS = 113;            // 113 LOGICAL sectors (seed % 113)
export const WIDTH = 1024;             // BEHCS-1024 glyph width (seed % 1024)
export const ROOMS_PER_SHARD = 500;    // 500 rooms per shard
export const VALID_MULTIPLIERS = Object.freeze([10000, 20000, 50000, 100000]);
export const DEFAULT_ROOT = 'D:/asolaria-combined-quant-2026-06-15/sectors';

// roomMultiplier -> shards/sector = roomMultiplier / 500.
//   10000  -> 20 shards  -> 10000 rooms/sector  -> 1,130,000 total
//   20000  -> 40 shards  -> 20000 rooms/sector  -> 2,260,000 total
//   50000  -> 100 shards -> 50000 rooms/sector  -> 5,650,000 total
//   100000 -> 200 shards -> 100000 rooms/sector -> 11,300,000 total
export const SHARDS_PER_SECTOR = (roomMultiplier) => roomMultiplier / ROOMS_PER_SHARD;

// ---------------------------------------------------------------------------
// Lane separation (rule-of-three + prime-cylinder).
//
// lane = uint32(sha256(seed)[0:4]) % 3  -> {0,1,2}. For an integer seed this is
// equivalent to seed % 3 only via the digit-sum (10 ≡ 1 mod 3) identity, but we
// hash the seed so the assignment is byte-stable and cross-vantage identical
// (acer == liris) without coordination.
//
// DISJOINT-LANE ASSIGNMENT — real-100B and logical-1e100M NEVER share a lane:
//   lane 0  -> LOGICAL-1e100M  (positional modular invariant; residue6 in {1,5})
//   lane 2  -> REAL-100B       (provider-slice fanout, operator-gated; residue6 mirror)
//   lane 1  -> SHARED/RESERVED (witness/mixed; NEITHER mode routes traffic here)
//
// The mod-2 KIND bit forces the mod-3 lane split deterministically:
//   yin_yang = kind mod 2 : logical=0 -> lane 0 ; real=1 -> lane 2.
// gap-mod-6 forcing law governs intra-lane prime-cylinder transitions.
// ---------------------------------------------------------------------------
export const LANE_LOGICAL = 0;   // LOGICAL-1e100M
export const LANE_SHARED = 1;    // SHARED / RESERVED (frozen-brain parks here)
export const LANE_REAL = 2;      // REAL-100B (operator-gated)

export const LANE_ROLE = Object.freeze({
  0: 'LOGICAL-1e100M',
  1: 'SHARED-RESERVED',
  2: 'REAL-100B',
});

/** Byte-stable lane in {0,1,2} from a seed (sha256-hashed, not raw modulo). */
export function laneFor(seed) {
  const h = createHash('sha256').update(String(seed)).digest();
  const u32 = (h[0] << 24 | h[1] << 16 | h[2] << 8 | h[3]) >>> 0;
  return u32 % 3;
}

/** sha16 helper — first 16 hex chars of sha256(s). */
function sha16(s) {
  return createHash('sha256').update(s).digest('hex').slice(0, 16);
}

// ---------------------------------------------------------------------------
// Prime cylinder — cylinder = Nth prime (sector index selects the prime).
// prime % 6 class drives the real/logical disjoint mapping:
//   prime % 6 in {1,5}  -> LOGICAL class   (forcing-clean residues)
//   prime % 6 in {odd-other / parks}        -> REAL / SHARED class
// We compute the (sector+1)th prime by a small bounded sieve — pure, time-free.
// ---------------------------------------------------------------------------
function nthPrime(n) {
  // n is 1-based; bounded (n <= SECTORS) so a tiny trial-division loop suffices.
  let count = 0;
  let cand = 1;
  while (count < n) {
    cand += 1;
    let isP = cand > 1;
    for (let d = 2; d * d <= cand; d += 1) {
      if (cand % d === 0) { isP = false; break; }
    }
    if (isP) count += 1;
  }
  return cand;
}

/**
 * Full per-sector address descriptor.
 * Reuses classifyBhIndex (real engine) for {lane, ppow}; adds cylinder prime,
 * prime%6 class, the rule-of-three hash lane, and the routed mode.
 */
export function sectorDescriptor(sector) {
  const cylinder = nthPrime(sector + 1);          // cylinder = Nth prime
  const residue6 = cylinder % 6;
  // Real engine classification (lane = sector%3, ppow = prime-power class).
  const bh = classifyBhIndex(sector);             // { lane, ppow }
  const hashLane = laneFor(sector);               // byte-stable rule-of-three lane
  const glyph1024 = sector % WIDTH;               // sector < 113 < 1024 so == sector
  // prime%6 class -> disjoint mode. {1,5} == logical class; else real/shared.
  const primeClass = (residue6 === 1 || residue6 === 5) ? 'LOGICAL' : 'REAL';
  // Routed mode is the prime%6 class; the LANE.hbp records BOTH the engine lane
  // (sector%3) and the disjoint routed lane so real(2)/logical(0) never collide.
  const routedLane = primeClass === 'LOGICAL' ? LANE_LOGICAL : LANE_REAL;
  return {
    sector,
    cylinder,
    residue6,
    primeClass,
    routedLane,
    routedRole: LANE_ROLE[routedLane],
    engineLane: bh.lane,        // classifyBhIndex(sector).lane == sector % 3
    ppow: bh.ppow,              // classifyBhIndex(sector).ppow (prime-cylinder phase)
    hashLane,                   // sha256-stable rule-of-three lane in {0,1,2}
    glyph1024,
  };
}

// ---------------------------------------------------------------------------
// HBP row builders — every row carries |json=0.
// ---------------------------------------------------------------------------
function hdrRow(root, roomMultiplier, shards, totalRooms, laneCounts) {
  return (
    `SECTORHDR|ok=1|id=${LAYOUT_ID}|binder=${BINDER_ID}|root=${root}` +
    `|sectors=${SECTORS}|room_mult=${roomMultiplier}|shards_per_sector=${shards}` +
    `|rooms_per_sector=${roomMultiplier}|total_rooms=${totalRooms}` +
    `|lane0_count=${laneCounts[0]}|lane1_count=${laneCounts[1]}|lane2_count=${laneCounts[2]}` +
    `|repartition=HARD-DENY|materialize=descriptor-state|json=0`
  );
}

function laneRow(d, roomMultiplier, shards) {
  // LANE.hbp per sector: rule-of-3 lane + prime-cylinder ppow + disjoint routed lane.
  return (
    `SECTORLANE|sector=${d.sector}|engine_lane=${d.engineLane}|hash_lane=${d.hashLane}` +
    `|routed_lane=${d.routedLane}|routed_role=${d.routedRole}|prime_class=${d.primeClass}` +
    `|cylinder_prime=${d.cylinder}|residue6=${d.residue6}|ppow=${d.ppow}` +
    `|glyph1024=${d.glyph1024}|room_mult=${roomMultiplier}|shards=${shards}|json=0`
  );
}

function roomsManifestRow(d, roomMultiplier, shards) {
  // rooms-manifest.hbp per sector: describes the room ranges (NOT materialized).
  const lo = 0;
  const hi = roomMultiplier - 1;
  return (
    `ROOMSMANIFEST|sector=${d.sector}|routed_lane=${d.routedLane}|cylinder_prime=${d.cylinder}` +
    `|shards=${shards}|rooms_per_shard=${ROOMS_PER_SHARD}|rooms_per_sector=${roomMultiplier}` +
    `|room_range=R${String(lo).padStart(6, '0')}..R${String(hi).padStart(6, '0')}` +
    `|room_idx=shard*${ROOMS_PER_SHARD}+room_in_shard|state=DESCRIPTOR-STATE|json=0`
  );
}

function roomRow(d, roomIdx) {
  // ROOM.hbp witness: pid = BH.SECTOR.{NNN}.{LANE}.R{ROOMIDX}.{glyph1024}.{sha16}
  const nnn = String(d.sector).padStart(3, '0');
  const ridx = String(roomIdx).padStart(6, '0');
  const pidStem = `BH.SECTOR.${nnn}.${d.routedLane}.R${ridx}.${d.glyph1024}`;
  const sha = sha16(pidStem);
  const pid = `${pidStem}.${sha}`;
  return (
    `ROOM|pid=${pid}|sector=${d.sector}|routed_lane=${d.routedLane}|cylinder_prime=${d.cylinder}` +
    `|room_idx=${roomIdx}|glyph1024=${d.glyph1024}|sha16=${sha}|witness=1|json=0`
  );
}

function laneMapRows(descriptors, laneCounts, roomMultiplier) {
  // lane-map.hbp (global): the disjoint real/logical/shared lane assignment.
  const rows = [];
  rows.push(
    `LANEMAP|ok=1|id=${LAYOUT_ID}|sectors=${SECTORS}` +
    `|lane0=LOGICAL-1e100M|lane1=SHARED-RESERVED|lane2=REAL-100B` +
    `|lane0_count=${laneCounts[0]}|lane1_count=${laneCounts[1]}|lane2_count=${laneCounts[2]}` +
    `|disjoint=real{2}^logical{0}=empty|route_space_per_lane=${WIDTH * SECTORS}` +
    `|route_space_effective=${3 * WIDTH * SECTORS}|forcing_law=gap-mod-6|json=0`
  );
  for (const d of descriptors) {
    rows.push(
      `LANEMAPROW|sector=${d.sector}|routed_lane=${d.routedLane}|routed_role=${d.routedRole}` +
      `|prime_class=${d.primeClass}|cylinder_prime=${d.cylinder}|residue6=${d.residue6}` +
      `|engine_lane=${d.engineLane}|ppow=${d.ppow}|json=0`
    );
  }
  // disputed-band note from the real engine (informational, non-gating).
  for (const band of DISPUTED_BANDS) {
    rows.push(`LANEMAPNOTE|disputed_band=${band.lo}..${band.hi}|why=${band.why}|json=0`);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// buildSectorRoomLayout — the authoritative builder (merge-spec interface).
// ---------------------------------------------------------------------------
export function buildSectorRoomLayout(opts = {}) {
  const root = opts.root || DEFAULT_ROOT;
  const roomMultiplier = opts.roomMultiplier ?? 10000;
  const materialize = opts.materialize === true;        // default false (descriptor-state)
  const sampleRooms = Number.isInteger(opts.sampleRooms) ? opts.sampleRooms : 64;

  if (!VALID_MULTIPLIERS.includes(roomMultiplier)) {
    throw new Error(
      `roomMultiplier must be one of ${VALID_MULTIPLIERS.join('/')}, got ${roomMultiplier}`,
    );
  }

  const shards = SHARDS_PER_SECTOR(roomMultiplier);     // roomMultiplier / 500
  const roomsPerSector = roomMultiplier;
  const totalRooms = SECTORS * roomsPerSector;

  // Build all 113 sector descriptors + tally lane counts.
  const descriptors = [];
  const laneCounts = { 0: 0, 1: 0, 2: 0 };
  for (let s = 0; s < SECTORS; s += 1) {
    const d = sectorDescriptor(s);
    descriptors.push(d);
    laneCounts[d.routedLane] += 1;
  }

  // mkdir the sectors/ root (LOGICAL directory only — NO repartition).
  mkdirSync(root, { recursive: true });

  let dirsCreated = 0;
  const rows = [];

  // Global LAYOUT.hbp header row.
  const hdr = hdrRow(root, roomMultiplier, shards, totalRooms, laneCounts);
  rows.push(hdr);

  // Per-sector directories + manifests.
  for (const d of descriptors) {
    const nnn = String(d.sector).padStart(3, '0');
    const sectorDir = join(root, `sector-${nnn}`);
    mkdirSync(sectorDir, { recursive: true });
    dirsCreated += 1;

    // LANE.hbp — rule-of-3 lane + prime-cylinder + disjoint routed lane.
    const laneHbp = laneRow(d, roomMultiplier, shards);
    writeFileSync(join(sectorDir, 'LANE.hbp'), laneHbp + '\n');
    rows.push(laneHbp);

    // rooms-manifest.hbp — describes room ranges (DESCRIPTOR-STATE, not materialized).
    const rmHbp = roomsManifestRow(d, roomMultiplier, shards);
    writeFileSync(join(sectorDir, 'rooms-manifest.hbp'), rmHbp + '\n');
    rows.push(rmHbp);

    // rooms/ holder dir (witness subset lives here; full grid stays descriptor-state).
    const roomsDir = join(sectorDir, 'rooms');
    mkdirSync(roomsDir, { recursive: true });
    dirsCreated += 1;

    if (materialize) {
      // FULL materialize is GATED. Even when requested we cap to the shard skeleton
      // (one dir per shard) + ROOM.hbp witnesses — never roomMultiplier empty dirs,
      // to honor the no-disk-blowup / held-light doctrine.
      for (let shard = 0; shard < shards; shard += 1) {
        const shardDir = join(roomsDir, `shard-${String(shard).padStart(4, '0')}`);
        mkdirSync(shardDir, { recursive: true });
        dirsCreated += 1;
      }
    }

    // Witness ROOM.hbp subset (sampleRooms rooms spread across the sector range).
    const witnessRows = [];
    const n = Math.min(sampleRooms, roomsPerSector);
    const stride = Math.max(1, Math.floor(roomsPerSector / Math.max(1, n)));
    for (let k = 0; k < n; k += 1) {
      const roomIdx = (k * stride) % roomsPerSector;
      const rr = roomRow(d, roomIdx);
      witnessRows.push(rr);
    }
    // Write the witness ROOM rows into a single per-sector witness manifest
    // (one file, not sampleRooms physical room dirs — keeps the tree light).
    writeFileSync(
      join(roomsDir, 'witness-rooms.hbp'),
      witnessRows.join('\n') + (witnessRows.length ? '\n' : ''),
    );
    rows.push(...witnessRows);
  }

  // Global manifests: LAYOUT.hbp and lane-map.hbp.
  const laneMap = laneMapRows(descriptors, laneCounts, roomMultiplier);
  const manifestPath = join(root, 'LAYOUT.hbp');
  writeFileSync(manifestPath, rows.slice(0, 1 + descriptors.length * 2).join('\n') + '\n');
  // LAYOUT.hbp holds header + per-sector LANE + rooms-manifest rows; full row[]
  // (incl. witnesses + lane-map) is returned to the caller for combined emit.

  const laneMapPath = join(root, 'lane-map.hbp');
  writeFileSync(laneMapPath, laneMap.join('\n') + '\n');
  rows.push(...laneMap);

  // Footer row.
  const ftr =
    `SECTORFTR|ok=1|id=${LAYOUT_ID}|dirs_created=${dirsCreated}` +
    `|sectors=${SECTORS}|total_rooms=${totalRooms}|materialize=${materialize ? 1 : 0}` +
    `|witness_rooms_per_sector=${Math.min(sampleRooms, roomsPerSector)}` +
    `|repartition=HARD-DENY|json=0`;
  writeFileSync(join(root, 'LAYOUT-FTR.hbp'), ftr + '\n');
  rows.push(ftr);

  return {
    root,
    sectors: SECTORS,
    room_multiplier: roomMultiplier,
    rooms_per_sector: roomsPerSector,
    total_rooms: totalRooms,
    shards_per_sector: shards,
    lane_map: {
      0: { role: LANE_ROLE[0], count: laneCounts[0] },
      1: { role: LANE_ROLE[1], count: laneCounts[1] },
      2: { role: LANE_ROLE[2], count: laneCounts[2] },
      disjoint: laneCounts[0] >= 0 && laneCounts[2] >= 0,  // real{2} ∩ logical{0} = ∅ by construction
    },
    lane_counts: laneCounts,
    descriptors,
    dirs_created: dirsCreated,
    manifest_path: manifestPath,
    lane_map_path: laneMapPath,
    rows,
    verdict: 'LOGICAL-SECTOR-ROOM-LAYOUT-DESCRIPTOR-STATE',
  };
}

// Role-line alias required by the orchestration contract.
export function buildLayout(opts = {}) {
  return buildSectorRoomLayout(opts);
}

// ---------------------------------------------------------------------------
// CLI: node sector-room-layout.mjs [--root=DIR] [--rooms=10000] [--materialize] [--sample=64]
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const o = {};
  for (const a of argv) {
    if (a === '--materialize') o.materialize = true;
    else if (a.startsWith('--root=')) o.root = a.slice('--root='.length);
    else if (a.startsWith('--rooms=')) o.roomMultiplier = Number(a.slice('--rooms='.length));
    else if (a.startsWith('--sample=')) o.sampleRooms = Number(a.slice('--sample='.length));
  }
  return o;
}

const isMain = (() => {
  try {
    return import.meta.url === `file://${process.argv[1]}` ||
      import.meta.url.endsWith(String(process.argv[1] || '').replace(/\\/g, '/'));
  } catch { return false; }
})();

if (isMain) {
  const out = buildSectorRoomLayout(parseArgs(process.argv.slice(2)));
  for (const r of out.rows) process.stdout.write(r + '\n');
  process.stderr.write(
    `# sectors=${out.sectors} rooms/sector=${out.rooms_per_sector} ` +
    `total=${out.total_rooms} lanes L0=${out.lane_counts[0]} ` +
    `L1=${out.lane_counts[1]} L2=${out.lane_counts[2]} dirs=${out.dirs_created} ` +
    `verdict=${out.verdict}\n`,
  );
}
