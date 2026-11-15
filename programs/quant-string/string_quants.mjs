#!/usr/bin/env node
// string_quants.mjs: every runnable quant on this machine, strung in one chain, forward and back.
// Each stage calls the existing program or function unchanged. This file only passes bytes along and counts.
//
//   node string_quants.mjs BODY WORKDIR
//
// Forward:  body -> hex (R-HEX) -> Omega floors 64/256/1024/4096 with the 40 operators (July codec)
//           -> seven coloured leaves (Path 2) -> Triple at 12 bits on three leaves (C-drive engine)
//           -> hybrid envelope: JL + Turbo + Polar + Triple (C-drive engine)
//           -> quant8: the eight June quants -> the 3,200-byte tuple
//           -> quant4 address, zeta class, 8-byte handle (Path 1 address)
// Back:     handle -> tuple (hash checked) -> Triple reverse -> leaves -> CRT (Path 2) -> Omega unpack -> hex -> body
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const core = require('C:/HyperBEHCS/lib/hyperbehcs-core.cjs');
const NN = 'file:///C:/asolaria-as-neural-network/tools/behcs/';
const { quant8, tupleBuffer } = await import(`${NN}quant-huge-message-benchmark.mjs`);
const { zetaClassify } = await import(`${NN}zeta-quant.mjs`);
const { quant4Address } = await import(`${NN}quant4-fidelity-spec.mjs`);
const OMEGA = 'C:/Users/acer/omega-hyper-codec-integration-v0/omega_hyper_codec_v0.exe';
const LEAVES = 'C:/tmp/opus55/quant-0-loss/rust-leaves/target/release/path2_driver.exe';

const [BODY, WORK] = process.argv.slice(2);
fs.mkdirSync(WORK, { recursive: true });
const sha = (b) => createHash('sha256').update(b).digest('hex');
const row = (tag, o) => console.log(tag + '|' + Object.entries(o).map(([k, v]) => `${k}=${v}`).join('|') + '|json=0');
const p = (n) => path.join(WORK, n).replace(/\\/g, '/');
const run = (exe, args) => execFileSync(exe, args, { encoding: 'utf8', maxBuffer: 1 << 26 });
const PICK = [2, 4, 6];
const BITS = 12;
const CHUNK = 99999; // the engine spreads arrays into Math.max, so a leaf goes through in pieces of this many bytes

// ---------------------------------------------------------------- forward
const body = fs.readFileSync(BODY);
const bodySha = sha(body);
row('STRING0', { stage: 'body', bytes: body.length, sha256: bodySha });

const hex = Buffer.from(body.toString('hex'), 'ascii');
fs.writeFileSync(p('1.hex'), hex);
row('STRING1', { stage: 'R-HEX', quant: 14, bytes: hex.length, exact_lane: 1 });

run(OMEGA, ['pack', p('1.hex'), p('2.omega'), 'raw']);
const omega = fs.readFileSync(p('2.omega'));
row('STRING2', { stage: 'Omega_floors_64_256_1024_4096_with_40_operators', quants: '17,18,19_and_the_July_operator_catalog', bytes: omega.length, exact_lane: 1 });

const black = run(LEAVES, ['black', p('2.omega'), p('3.leaves')]);
const leafBytes = fs.statSync(p('3.leaves/leaf-cylinder-0.u32')).size;
row('STRING3', { stage: 'Path_2_seven_coloured_leaves', quant: 23, leaf_bytes_each: leafBytes, kept: PICK.join(','), kept_bytes: leafBytes * PICK.length, exact_lane: 1 });
void black;

// Triple at 12 bits on each kept leaf. Codes are stored two bytes each, as the engine stores them.
const metas = {};
let tripleBytes = 0;
for (const i of PICK) {
  const leaf = fs.readFileSync(p(`3.leaves/leaf-cylinder-${i}.u32`));
  const out = [];
  const meta = [];
  for (let o = 0; o < leaf.length; o += CHUNK) {
    const piece = Array.from(leaf.subarray(o, Math.min(o + CHUNK, leaf.length)));
    const q = core.tripleQuant(piece, { bits: BITS });
    const codes = Buffer.alloc(q.codes_flat.length * 2);
    q.codes_flat.forEach((c, k) => codes.writeUInt16LE(c, k * 2));
    out.push(codes);
    meta.push({ n: piece.length, metadata: q.metadata });
  }
  const all = Buffer.concat(out);
  fs.writeFileSync(p(`4.triple-${i}.codes`), all);
  metas[i] = meta;
  tripleBytes += all.length;
}
const metaBuf = Buffer.from(JSON.stringify(metas));
fs.writeFileSync(p('4.triple.meta'), metaBuf);
row('STRING4', { stage: 'Triple_spherical_at_12_bits_on_three_leaves', quant: 12, code_bytes: tripleBytes, meta_bytes: metaBuf.length, exact_lane: 1 });

// Hybrid envelope (JL + Turbo + Polar + Triple-8 + payload hash) of each code file: the engine's own packet.
const envs = [];
for (const i of PICK) {
  const codes = fs.readFileSync(p(`4.triple-${i}.codes`));
  const h = core.buildHybridPacket({ text: codes.toString('base64') }, { dimension: 1536, bits: 8 });
  fs.writeFileSync(p(`5.envelope-${i}.hbh1`), h.envelope);
  envs.push({ env: h.envelope, codesSha: sha(codes) });
}
const envAll = Buffer.concat(envs.map((e) => e.env));
row('STRING5', { stage: 'HBH1_envelopes_JL_Turbo_Polar_Triple', quants: '9,10,11,12', envelopes: envs.length, bytes: envAll.length, sketch_lane: 1 });

// quant8: the eight June quants over the three envelopes -> the 3,200-byte tuple.
const msg = new Float64Array(envAll.length);
for (let k = 0; k < envAll.length; k++) msg[k] = (envAll[k] - 128) / 128;
const q8 = quant8(msg);
const tuple = tupleBuffer(q8);
fs.writeFileSync(p('6.tuple.3200'), tuple);
row('STRING6', { stage: 'quant8_tuple', quants: '1,2,3,4,5,6,7,8_and_21', bytes: tuple.length, vm_acc: q8.vmAcc, sketch_lane: 1 });

// quant4 address, zeta class, 8-byte handle.
const tupleSha = sha(tuple);
const q4 = quant4Address(tupleSha);
const z = zetaClassify(q4.sector113 * 1024 + q4.glyph1024);
const handle8 = tupleSha.slice(0, 16);
row('STRING7', { stage: 'quant4_address_zeta_class_handle8', quant: '22_and_the_address_quants', handle8, lane_mod3: q4.lane_mod3, quad_mod4: q4.quad_mod4, sector113: q4.sector113, glyph1024: q4.glyph1024, zeta_lane: z.lane, zeta_ppow: z.ppow, bytes: 8 });

// The index row the handle opens (HBP/HBI lane): what the store needs to find and check each piece.
const index = ['STRINGINDEX', `handle8=${handle8}`, `tuple_sha256=${tupleSha}`, `body_sha256=${bodySha}`, `body_bytes=${body.length}`,
  `omega_bytes=${omega.length}`, `leaves=${PICK.join(',')}`, `bits=${BITS}`,
  ...envs.map((e, k) => `codes_${PICK[k]}_sha256=${e.codesSha}`), 'json=0'].join('|');
fs.writeFileSync(p('7.index.hbp'), index + '\n');
row('STRING8', { stage: 'HBP_index_row', quants: '15,16', bytes: Buffer.byteLength(index) + 1 });

// ---------------------------------------------------------------- back
const f = Object.fromEntries(fs.readFileSync(p('7.index.hbp'), 'utf8').trim().split('|').slice(1).map((s) => s.split('=')));
const tupleBack = fs.readFileSync(p('6.tuple.3200'));
const okTuple = sha(tupleBack) === f.tuple_sha256 && sha(tupleBack).slice(0, 16) === f.handle8;
fs.mkdirSync(p('8.leaves-back'), { recursive: true });
let okCodes = true;
const metaBack = JSON.parse(fs.readFileSync(p('4.triple.meta'), 'utf8'));
for (const i of PICK) {
  const codes = fs.readFileSync(p(`4.triple-${i}.codes`));
  okCodes = okCodes && sha(codes) === f[`codes_${i}_sha256`];
  const parts = [];
  let o = 0;
  for (const m of metaBack[i]) {
    const triples = Math.ceil(m.n / 3);
    const cs = [];
    for (let t = 0; t < triples; t++) cs.push([codes.readUInt16LE(o), codes.readUInt16LE(o + 2), codes.readUInt16LE(o + 4)]), (o += 6);
    const rec = core.reconstructTriple({ codes: cs, metadata: m.metadata, dimension: m.n });
    parts.push(Buffer.from(rec.map((v) => Math.max(0, Math.min(255, Math.round(v))))));
  }
  fs.writeFileSync(p(`8.leaves-back/leaf-cylinder-${i}.u32`), Buffer.concat(parts));
}
let leavesSame = true;
for (const i of PICK) leavesSame = leavesSame && sha(fs.readFileSync(p(`8.leaves-back/leaf-cylinder-${i}.u32`))) === sha(fs.readFileSync(p(`3.leaves/leaf-cylinder-${i}.u32`)));
row('BACK1', { stage: 'handle_to_tuple_to_codes_to_leaves_by_Triple_reverse', tuple_hash_ok: okTuple ? 1 : 0, code_hashes_ok: okCodes ? 1 : 0, three_leaves_identical: leavesSame ? 1 : 0 });

const white = run(LEAVES, ['white', p('8.leaves-back'), ...PICK.map(String), String(f.omega_bytes), p('9.omega.back')]);
row('BACK2', { stage: 'Path_2_CRT_from_three_leaves', outcome: /outcome=RECOVERED/.test(white) ? 'RECOVERED' : 'HELD', omega_identical: sha(fs.readFileSync(p('9.omega.back'))) === sha(omega) ? 1 : 0 });

run(OMEGA, ['unpack', p('9.omega.back'), p('10.hex.back')]);
const bodyBack = Buffer.from(fs.readFileSync(p('10.hex.back')).toString('ascii'), 'hex');
fs.writeFileSync(p('11.body.back'), bodyBack);
row('BACK3', { stage: 'Omega_unpack_then_hex_to_bytes', body_bytes: bodyBack.length, body_sha256: sha(bodyBack), equals_body: sha(bodyBack) === f.body_sha256 ? 1 : 0 });

row('STRINGSUM', {
  body_bytes: body.length,
  handle_bytes: 8,
  tuple_bytes: tuple.length,
  index_row_bytes: Buffer.byteLength(index) + 1,
  pieces_read_on_the_way_back: 'tuple,index_row,three_triple_code_files,their_metadata',
  pieces_read_bytes: tuple.length + Buffer.byteLength(index) + 1 + tripleBytes + metaBuf.length,
  body_returned_exact: sha(bodyBack) === bodySha ? 1 : 0,
});
