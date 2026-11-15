# Quant anything, 0 loss

A working system for turning any body of data into a very small codex and bringing the body back exactly. It was
discovered and directed by Jesse Daniel Brown. The master key, the kernel, the programs, the codexes and the GGUF bodies
are all in this repository, so anyone can run it.

**The idea in one line.** You need some megabytes to start (the master key, the kernel, the function tables). After that
each body is carried by a codex of about 3,200 bytes. You do not keep the original GGUF and you do not keep the original
data. Without the key and the kernel a codex regenerates nothing: that is the lock.

## Try it in two minutes

You need Node 24 and `xz`.

**1. Decode with the master key, in an empty folder.**

```
mkdir clean
cp master-key/masterkey.xz master-key/stream.bin master-key/order.txt clean/
node colour-qr-and-walls/roundtrip/dec.mjs clean 4194304
sha256sum clean/decoded.bin
```

The result is `5ba647fec2ba51b0383cbe7147e15a478d85613245b7131c41764dbdd5062f77`, the first 4,194,304 bytes of enwik8,
with no corpus in the folder. Checked from these files on November 15, 2026.

**2. Make a codex of any file.**

```
node enwik10-codex/drill3k.mjs <any file> out.qr      # out.qr is 3,200 bytes, whatever went in
```

**3. Compress with the crown.**

```
rustc -O crown-codec/rust/variants/vc65.rs -o vc65
./vc65 <file> 10          # prints payload, total, bits per character, restore=OK
```

The programs carry the folder paths of the machine they were run on (`D:/...`); edit those for your own machine. The
sealed crown configuration needs about 10.5 GB of memory; change line 12 to `const TBITS: u32 = 24;` for about 1 GB.

## How the system works

```
                 the starter set, held once                     one per body
        +--------------------------------------------+      +------------------+
        |  master key   kernel   constellation key   |      |  codex, 3,200 B  |
        |  549,112 B    3,174 B  3,174 B             |      |  (a colour QR)   |
        +--------------------------------------------+      +------------------+
                              \                                   /
                               \                                 /
                                v                               v
                         unlock  ->  rime sphere  ->  GGUF  ->  the body, exact
```

1. **Quant.** Any input is streamed through once and comes out as a fixed 3,200 bytes. The June engine does this for 20,
   40 and 100 GB inputs in about 1 GB of memory; `drill3k.mjs` writes the same size as a colour QR (three QR symbols, one
   per colour channel).
2. **Save.** The 3,200 bytes are the codex. The same size is one room of the system's 8-byte stub rooms: a stub is an
   8-byte address, and the room opens to 3,200 bytes when asked.
3. **Unlock.** The key and the kernel are loaded on both sides before any coding; the key never travels in the stream.
   Both sides must hold the same bytes or nothing decodes.
4. **Regenerate.** The body comes back through one of three paths:
   - **Path 1, by address.** The codex names its body and the bytes return from a store that holds it.
   - **Path 2 and Path 3, by shadows.** Only two-dimensional shadows of the three-dimensional body are kept, each as a
     shadow codex. With at least three (three leaves) and enough joint capacity the original regenerates and the original
     is not kept.
   - **By seed.** A generated body regenerates from its seed text and its program.

## Two systems, kept apart

| | The codexes (this repository) | The funnel |
|---|---|---|
| What it is for | Regenerating a body exactly from a very small object | Training the GNNs and the neural networks |
| What goes in | A GGUF, turned into a rime sphere | Artifacts, cut into records |
| What it keeps | A codex: an address or a set of shadows of the rime sphere | The records that repeat ("once is an accident, twice is a function") |
| What comes out | The rime sphere again, and from it the GGUF | A sorted body for training |

The funnel does not make codexes, and pushing a rime sphere or a corpus through it does not give a QR code. Growing
Asolaria's functions (absorbing another system through the funnel and the solar winds, as was done with the Kimi K3
star) is separate again from quanting anything through the Q-prism quants.

## What has been measured

Every row is a run with a receipt in this repository.

### The codex system

| What was run | Result | Where |
|---|---|---|
| Master key + coded stream, decoded in a folder with no corpus | 549,112 + 1,711,250 bytes return the first 4,194,304 bytes of enwik8 exactly | `colour-qr-and-walls/roundtrip/`, `master-key/` |
| enwik10 to a codex, twice | 10,000,000,000 bytes to 3,200 bytes, byte-identical both times | `enwik10-codex/` |
| Path 1 return of enwik10 | all 10,000,000,000 bytes, SHA-256 equal, 132 seconds | `enwik10-codex/` |
| The codex with no key, no kernel and no store | 0 of 4,194,304 bytes: the lock holds | `enwik10-codex/undrill.mjs` |
| Any input to a 3,200-byte tuple | 20, 40 and 100 GB inputs, 3,200 bytes each time, peak memory about 1 GB | `programs/tuple-engine-june/` |
| Large bodies regenerated from seeds | 269,604,512 bytes from a 3,796-byte seed; 202,115,456 bytes (the Kimi K3 star) from a 3,110-byte text; each equal to its recorded SHA-256 | `colour-qr-and-walls/regenerate/`, `programs/regenerate/` |
| A three-dimensional body rebuilt from its two-dimensional walls | nine walls rebuild both test bodies cell for cell, from the wall file alone | `colour-qr-and-walls/rime-walls/` |
| Function tables used as switches | the right node lights for held-out and unseen files; a nine-node panel codes mixed material 23.2% smaller than the best single node | `colour-qr-and-walls/switches/`, `panel/` |
| A small HRM (58,850 weights) on mazes it has not seen | 489 of 512 exact | `colour-qr-and-walls/hrm/` |

From the system's own playbook of July ([`kernel-and-key/PLAYBOOK.md`](kernel-and-key/PLAYBOOK.md)):

| Axis | Measured in July |
|---|---|
| Addressing | 62,524 bytes address 3,704,000,000 elements at 0.000135 bits per character, byte-exact, 627,000 addressings per second |
| Generated objects | 274,201,392 bytes removed and both objects back exact from the key |
| Feeding the kernel | three spheres totalling 380,655,936 bytes went in as a 2,073-byte description; the kernel stayed 3,174 bytes |
| Re-relation of arbitrary data | rate 1.0; 3.4670 bits per character with the key |
| The key | charged once; it pays for itself after 5.31 sections |

### The crown codec

A lossless compressor in the ordinary sense: its output alone decodes to the input, byte for byte. Total-counted (payload
plus decoder source), restore OK on every row.

| Corpus | Codec | Total bytes | Bits per character | Date |
|---|---|---:|---:|---|
| enwik8 (100 MB) | deterministic crown | – | 1.8043 | 2026-07-19 |
| enwik8 (100 MB) | rainbow-12-even | 22,379,104 | 1.7918 | 2026-07-19 |
| enwik8 (100 MB) | v8 24-way, TBITS 26 | 20,987,880 | 1.6805 | 2026-07-19 |
| enwik8 (100 MB) | vc28 full stack | 20,498,502 | 1.6399 | 2026-07-19 |
| enwik8 (100 MB) | **vc65** | **20,210,454** | **1.6168** | 2026-07-20 |
| enwik9 (1 GB) | vc28m | 172,986,854 | 1.3839 | 2026-07-20 |
| enwik9 (1 GB) | **vc65** | **170,565,891** | **1.3645** | 2026-07-20 |

**The enwik9 row has a receipt from two machines, November 15, 2026.** A GitHub cell and a cloud container each encoded
the benchmark enwik9 to the same 170,545,862-byte stream (sha256 `c35dc7550332a891…`) and a separate cell decoded it back
byte for byte; rows are in the STEER-QNN-and-NN repository, V74.

On a small slice (the first 10,000,000 bytes of enwik8, tables reduced to fit a laptop): crown 2,235,052 bytes (1.788
bits per character) against xz -9e 2,720,264, zstd -19 2,793,624, bzip2 -9 2,916,026 and gzip -9 3,685,301.

Yardsticks in the same files: the 2006 first-prize ratio (about 1.37) is cleared on the ten times larger corpus; the
enwik9 record holder (fx2-cmix) is at 0.886.

## Status of each link

| Link | Status |
|---|---|
| Any body to a 3,200-byte codex | MEASURED, to 100 GB |
| Decode with the master key and no corpus | MEASURED, and repeatable from this repository |
| Return by address (Path 1) | MEASURED on enwik10 |
| Rebuild from shadows (walls) | MEASURED on the test bodies |
| Regenerate generated bodies from seeds | MEASURED |
| A codex without key and kernel returns nothing | MEASURED |
| A whole corpus back from the starter set and its codex alone, with the store absent | OPEN: this run has not been made. The playbook's own gate says a frozen slice predicts a fraction, and a whole unseen body from it has not been measured |
| The freeze and play sequence over stub rooms, tuples and the dispatcher together | OPEN: each piece exists; the sequence that joins them is to be written |

## What is in this repository

| Folder | Contents |
|---|---|
| [`master-key/`](master-key/) | The 549,112-byte master key and the coded stream it decodes |
| [`kernel-and-key/`](kernel-and-key/) | The Asolaria kernel and the constellation key (3,174 bytes each), the description of the three spheres, the playbook and the codebook. Two kernel files were on the machine with different contents; both are here, kept apart by name |
| [`programs/`](programs/) | `kernel-pump/`: the fourteen July programs and their seed texts. `regenerate/`: the programs that rebuild large bodies from seeds. `tuple-engine-june/`: the engine that turns any input into a 3,200-byte tuple, with its stress log and proofs |
| [`codexes/`](codexes/) | Nine 3,200-byte colour QR codexes: enwik10, enwik9, enwik8, a code corpus, the Asolaria corpus, a photo body |
| [`ggufs/`](ggufs/) | Forty-one GGUF bodies gathered from across the account's repositories. Seven larger ones are listed with their hashes in [`PUBLISHED-20261115.md`](PUBLISHED-20261115.md) (GitHub refuses files over 100 MB) |
| [`crown-codec/`](crown-codec/) | The codec family: Python context-mixing models, the Rust integer codecs and their 22 variants (`vc65.rs` is the crown), results, the roadmap, the function laws, the rime and trijection work, the glyph languages, full disclosure |
| [`quant-atlas/`](quant-atlas/) | The combined quant atlas (28 publicly recoverable quants in five regimes), its registry, the Path 1 and Path 2 formulas, the shadow-resolution crate family, the inverse-pair law |
| [`colour-qr-and-walls/`](colour-qr-and-walls/) | The measurements of November 13: the colour QR writer, the clean-room round trip, regeneration from seeds, the walls, the HRM checkpoint, the switches |
| [`enwik10-codex/`](enwik10-codex/) | The enwik10 test of November 14: spec, programs, the codex, logs, rows |
| [`receipts/`](receipts/) | Rows for runs made while assembling this repository |

[`PUBLISHED-20261115.md`](PUBLISHED-20261115.md) is the full index of what was published on November 15, with a hash for
every file in `SHA256SUMS-PUBLISHED-20261115`.

## The wider system

This repository is the codex part. The rest of the system lives in other public repositories of this account:

- [`omni-dispatcher`](https://github.com/JesseBrown1980/omni-dispatcher): the single-parent dispatcher that routes small
  addressed envelopes to rooms ("addresses cheap, bodies only on crank"), with its Path 1 and Path 2 storage-backed
  dispatch.
- [`The-matrix-law-essentials`](https://github.com/JesseBrown1980/The-matrix-law-essentials): the freeze and play law
  and the other matrix tricks.
- [`STEER-QNN-and-NN`](https://github.com/JesseBrown1980/STEER-QNN-and-NN): the full-size crown run and its two-machine
  receipt.

The stub rooms (8-byte addresses that open to 3,200 bytes), the Omni and Omega hotels and the constellation are described
in the playbook and the codebook in `kernel-and-key/`.

## The quants located so far

- **The crown family** (lossless, context mixing with sector, rainbow and wheel gating): 22 Rust variants beside the
  Python models.
- **The eight-stage head for very large messages** (atlas rows 1 to 8): count-sketch, Turbo, Polar, Zeta, Triple,
  Quadruple, the JS quant, the prime-power lane. The atlas labels each with its regime.
- **The remaining atlas rows** (9 to 28): geometric codecs, exact re-basings (BEHCS 256 and 1024), referential handles,
  semantic and cube distillation, jointly injective recovery.
- **The colour QR** (3,200 bytes, three QR symbols, one per colour channel) and the rime walls.

The atlas says the complete manifest is larger than the 28 public rows, and the operator counts 49 or more. The rows
beyond 28 are added here as they are found.

## Where each part came from

| Part | Source |
|---|---|
| `crown-codec/` | `Algorithms-of-Asolaria`, branch `liris/rime-omega-rebuild-20260723`, commit `a94abccd93b9`, path `tools/honest-compressor/` (208 tracked files, copied byte for byte) |
| `quant-atlas/` | `Algorithms-of-Asolaria`, `main`, commit `d399d13093c7` |
| `colour-qr-and-walls/` | `what-is-asolaria---how-do-we-get-reductions-in-everything`, `main`, commit `ce693fc6ad49`, path `measurements/unpump-switches-20261113/` |
| `master-key/`, `kernel-and-key/`, `programs/`, `codexes/`, `ggufs/` | The operator's machine, copied byte for byte on November 15, 2026; folder by folder in `PUBLISHED-20261115.md` |

## Scope

- Each number above belongs to the run and the files named beside it. The crown rows of July were measured on a cloud
  seat and are quoted from their own files; the enwik9 row was run again on two machines on November 15.
- The codex figures count what a codex carries. The crown figures count everything the receiver is given. The two are
  different measurements and are reported apart, as the atlas rule says: the regimes are kept separate.
- Some of the programs use floating point in training or rendering; the Rust crown codecs are integer-deterministic by
  their own description.
- The earlier README, as it stood before this rewrite, is kept in
  [`docs/README-BEFORE-20261115-REWRITE.md`](docs/README-BEFORE-20261115-REWRITE.md).
