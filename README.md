# Quant anything, 0 loss

The quants of Asolaria in one public place: the lossless codec family ("the crown"), the quant
atlas, the colour QR and wall work, and the recovery paths. Discovered and directed by Jesse
Daniel Brown. Everything here was already public in other repositories of this account, mostly
on side branches where it was hard to find; this repository gathers it. Where each part came
from is listed at the end.

## What "0 loss" means here

Two different things in this work return data exactly, and they are kept apart:

1. **The crown codec** is a lossless compressor in the ordinary sense. Its output alone decodes
   to the input, byte for byte, with no store and nothing else on hand. Every sealed row passed a
   SHA-256 restore gate.
2. **The recovery paths** (Path 1 store, Path 2 two shadows, Path 3 three shadows with a
   watcher, black mouth to white mouth) return data exactly from a small carried object plus a
   store or enough shadows. The atlas rule applies: the regimes are not collapsed into one ratio.

## The programs in this repository

This repository holds working programs with measured results, beside the documents that describe
them. Each row below is a program that was run, with the number it gave. The operator's statement
of how the codex system is used: *"you do need some megabytes of data to start but you do not need
the original GGUF ... and you do not need the original data"*, and *"without the Asolaria KEY and
the Asolaria kernel, you will regenerate 0."*

| Program | What it does | Measured |
|---|---|---|
| [`crown-codec/rust/variants/vc65.rs`](crown-codec/rust/variants/vc65.rs) | Lossless compressor, output alone decodes | enwik9: 170,545,862 bytes, restored byte for byte on two machines on 2026-11-15 (1.3645 bits per character with the decoder charged) |
| [`colour-qr-and-walls/roundtrip/train.mjs`](colour-qr-and-walls/roundtrip/train.mjs) | Streams the bodies through, keeps only the extracted function table (the master key), discards every chunk | master key 549,112 bytes |
| [`colour-qr-and-walls/roundtrip/enc.mjs`](colour-qr-and-walls/roundtrip/enc.mjs), [`dec.mjs`](colour-qr-and-walls/roundtrip/dec.mjs), [`rc.mjs`](colour-qr-and-walls/roundtrip/rc.mjs) | Codes a body against the key; the decoder runs in a folder holding only the key, the stream and one small parameter file, with no corpus present | key + coded stream 1,711,250 bytes return the first 4,194,304 bytes of enwik8 exactly |
| [`enwik10-codex/drill3k.mjs`](enwik10-codex/drill3k.mjs) | Any stream to a fixed 3,200-byte colour QR codex | enwik10, 10,000,000,000 bytes, twice, byte-identical codex |
| [`enwik10-codex/resolve_path1.mjs`](enwik10-codex/resolve_path1.mjs) | Path 1: the codex names its body and the bytes return from the store | all 10,000,000,000 bytes, SHA-256 equal |
| [`enwik10-codex/undrill.mjs`](enwik10-codex/undrill.mjs) | The codex with no key, no kernel and no store | 0 of 4,194,304 bytes: the lock holds |
| [`colour-qr-and-walls/rime-walls/rime_walls_v29.py`](colour-qr-and-walls/rime-walls/rime_walls_v29.py) | Rebuilds a three-dimensional body from its two-dimensional walls | nine walls rebuild both test bodies cell for cell |
| [`colour-qr-and-walls/switches/switches_v30.mjs`](colour-qr-and-walls/switches/switches_v30.mjs), [`panel/panel_v31.mjs`](colour-qr-and-walls/panel/panel_v31.mjs) | Function tables used as switches | the right node lights for held-out and unseen files; a nine-node panel codes mixed material 23.2% smaller than the best single node |
| [`colour-qr-and-walls/hrm/hrm_v28.py`](colour-qr-and-walls/hrm/hrm_v28.py) | A small HRM (58,850 weights) on mazes it has not seen | 489 of 512 exact |

Regeneration of large bodies from seeds (269,604,512 bytes from a 3,796-byte seed; 202,115,456 bytes
from a 3,110-byte text; each equal to its recorded SHA-256) is recorded in
[`colour-qr-and-walls/regenerate/`](colour-qr-and-walls/regenerate/) as specs and logs; the
regenerating programs, the Asolaria KEY and the kernel are on the operator's machine and are not
in this repository.

Notes for anyone running these: the round-trip and codex programs carry the folder paths of the
machine they were run on and need those edited; the Node programs need Node 24; some programs use
floating point in training, as the scope section says.

## Two systems, kept apart

There are two separate systems in this work. They share laws and file formats and they do
different jobs. Mixing them gives wrong expectations, so this section states each one.

| | The funnel | The codexes |
|---|---|---|
| What it is for | Training the GNNs and the neural networks | Regenerating a body exactly from a very small object |
| What goes in | Artifacts, cut into records | A GGUF, turned into a rime sphere |
| What it keeps | The records that repeat ("once is an accident, twice is a function"); the rest is garbage-collected by rule | A codex: an address or a set of shadows of the rime sphere |
| What comes out | A sorted body for training | The rime sphere again, and from it the GGUF |
| Program | `project_gguf.py` in the constellation folder | The codex and regenerate programs under `colour-qr-and-walls/` and `enwik10-codex/`, and the recovery paths in `quant-atlas/` |

- **The funnel does not make codexes.** Its retention rule selects what a network should learn
  from. Pushing a rime sphere or a corpus through the funnel does not give a QR code, and a
  count of what the funnel keeps says nothing about what a codex needs.
- **The codexes do not train anything.** Path 1 returns a body by its address in a store.
  Paths 2 and 3 keep only shadows of the three-dimensional body, which are two-dimensional and
  can each be stored as a shadow codex; with at least three of them (three leaves) and enough
  joint capacity the original regenerates without the original being kept
  ([`quant-atlas/PATH2-DBBH-DBWH-ALGORITHMS-2026-07-11.md`](quant-atlas/PATH2-DBBH-DBWH-ALGORITHMS-2026-07-11.md)).
- Stated by the operator on November 15, 2026, after this seat proposed a funnel count on a
  corpus as a step toward a codex. That proposal was wrong and was not run.

## The crown: measured results

Total-counted (payload plus decoder source), restore OK on every row. From
[`crown-codec/RESULTS-cloud-seat.md`](crown-codec/RESULTS-cloud-seat.md) and
[`crown-codec/FULL-DISCLOSURE/`](crown-codec/FULL-DISCLOSURE/).

| Corpus | Codec | Total bytes | Bits per character | Date |
|---|---|---:|---:|---|
| enwik8 (100 MB) | deterministic crown | – | 1.8043 | 2026-07-19 |
| enwik8 (100 MB) | rainbow-12-even | 22,379,104 | 1.7918 | 2026-07-19 |
| enwik8 (100 MB) | v8 24-way, TBITS 26 | 20,987,880 | 1.6805 | 2026-07-19 |
| enwik8 (100 MB) | vc28 full stack | 20,498,502 | 1.6399 | 2026-07-19 |
| enwik8 (100 MB) | **vc65** | **20,210,454** | **1.6168** | 2026-07-20 |
| enwik9 (1 GB) | vc28m | 172,986,854 | 1.3839 | 2026-07-20 |
| enwik9 (1 GB) | **vc65** | **170,565,891** | **1.3645** | 2026-07-20 |

Yardsticks recorded in the same files: the 2006 first-prize ratio (about 1.37) is cleared on the
ten times larger corpus; the enwik9 record holder (fx2-cmix) is at 0.886.

### Rerun on a second machine, 2026-11-14

`vc65` with its tables reduced sixteen-fold (TBITS 24 in place of 28) so that it fits in memory
here, on the first 10,000,000 bytes of enwik8:

| Compressor | Bytes | Bits per character |
|---|---:|---:|
| gzip -9 | 3,685,301 | 2.948 |
| bzip2 -9 | 2,916,026 | 2.333 |
| zstd -19 --long=27 | 2,793,624 | 2.235 |
| xz -9e | 2,720,264 | 2.176 |
| **crown (vc65, reduced tables)** | **2,235,052** | **1.788** |

Restore OK. With the 20,029-byte decoder source charged: 2,255,081 bytes, 1.804. The crown is
17.8% smaller than xz on this slice. This is a small check, not a reproduction of the sealed
rows above. Receipt:
[`receipts/FABLE52-CROWN-VC65-REDUCED-TABLE-TEST-2026-11-14.hbp`](receipts/FABLE52-CROWN-VC65-REDUCED-TABLE-TEST-2026-11-14.hbp).

### enwik10 (10 GB) to a 3,200-byte codex and back, 2026-11-14

Spec sealed before the runs. Rows: [`enwik10-codex/RESULT-ENWIK10-CODEX-20261114.hbp`](enwik10-codex/RESULT-ENWIK10-CODEX-20261114.hbp).

| Step | Result |
|---|---|
| Quant (`drill3k.mjs`, whole file, 376 s) | 10,000,000,000 bytes to **3,200 bytes**, 3,125,000 to 1 |
| Quant again (365 s) | byte-identical codex |
| Unquant, Path 1 (codex names the corpus, bytes return from the store, 132 s) | **10,000,000,000 of 10,000,000,000 bytes**, SHA-256 equal; re-drilled, it gives the codex again |
| Unquant from the codex alone (`undrill.mjs`) | 0 of 4,194,304 bytes; 0 of 800 lanes close |

The exact return is Path 1: it needs the store that holds the corpus. The route through the
funnel, the GGUF and the smelted star has not been run on enwik10 here; status OPEN.

**Correction, November 15, 2026, beside the sentence above (which stays as written).** That
sentence names "the funnel" as a stage on the way to a codex. It is not one. The operator's
statement of the design: *"the funnel is for training the GNNs and the neural networks. It's
not for making the codexes."* The open item on enwik10 belongs to the codex system alone:
the corpus as a GGUF, the GGUF as a rime sphere, the codex of that rime sphere, and the rime
sphere regenerated from the codex. See "Two systems, kept apart" below.

### Run it

```
rustc -O crown-codec/rust/variants/vc65.rs -o vc65
./vc65 <file> 10          # prints payload, total, bits per character, restore=OK
```

The sealed configuration (TBITS 28) needs about 10.5 GB of memory whatever the input size. For a
smaller machine change line 12 to `const TBITS: u32 = 24;` (about 1 GB), as in the rerun above.
`crown-codec/rust/RUN-ENWIK9.md` has the notes for the full gigabyte.

## What is in this repository

| Folder | Contents |
|---|---|
| [`crown-codec/`](crown-codec/) | The codec family: Python context-mixing models, the Rust integer codecs and their variants (`rust/variants/`, 22 files, `vc65.rs` is the crown), results, the honest spec, the roadmap, the function laws, the rime and trijection work, the glyph languages, full disclosure |
| [`quant-atlas/`](quant-atlas/) | The combined quant atlas (28 publicly recoverable quants in five regimes), its machine-readable registry, the measured addendum, the Path 1 / Path 2 / black-to-white-hole formulas, the shadow-resolution crate family, the inverse-pair law |
| [`colour-qr-and-walls/`](colour-qr-and-walls/) | The 2026-11-13 measurements: the colour QR writer found and reproduced byte for byte, the clean-room round trip, regeneration of large bodies from seeds, exact rebuilding of 3D bodies from nine 2D walls, the HRM maze checkpoint, the codex switches |
| [`enwik10-codex/`](enwik10-codex/) | The 2026-11-14 enwik10 test: spec and addendum, programs, the codex, logs, result rows |
| [`receipts/`](receipts/) | Rows for runs made while assembling this repository |

## The quants located so far

- **The crown family** (lossless, context mixing with sector/rainbow/wheel gating): 22 Rust
  variants beside the Python models.
- **The eight-stage head for very large messages** (atlas rows 1 to 8): count-sketch, Turbo,
  Polar, Zeta, Triple, Quadruple, the JS quant, the prime-power lane. These are sketches; the
  atlas labels each with its regime.
- **The remaining atlas rows** (9 to 28): geometric codecs, exact re-basings (BEHCS 256 / 1024),
  referential handles, semantic and cube distillation, jointly injective recovery.
- **The colour QR** (3,200 bytes, three QR symbols, one per colour channel) and the rime walls.

**Not yet located:** the atlas says the complete private manifest is larger than the 28 public
rows, and the operator counts 49 or more. The rows beyond 28 are not in this repository yet.
They will be added as they are found; nothing is claimed for them here.

## Where each part came from

| Part | Source |
|---|---|
| `crown-codec/` | `Algorithms-of-Asolaria`, branch `liris/rime-omega-rebuild-20260723`, commit `a94abccd93b9`, path `tools/honest-compressor/` (208 tracked files, copied byte for byte) |
| `quant-atlas/` | `Algorithms-of-Asolaria`, `main`, commit `d399d13093c7` |
| `colour-qr-and-walls/` | `what-is-asolaria---how-do-we-get-reductions-in-everything`, `main`, commit `ce693fc6ad49`, path `measurements/unpump-switches-20261113/` |

## Scope

- The sealed crown rows were measured in July 2026 on a cloud seat and are quoted from their
  own files; the only run made on the assembling machine is the reduced-table rerun above.
- No row here claims compression below the entropy of the source, and none claims a Hutter
  Prize record.
- Some of the copied programs use floating point in training or rendering; the Rust crown
  codecs are integer-deterministic by their own description.
