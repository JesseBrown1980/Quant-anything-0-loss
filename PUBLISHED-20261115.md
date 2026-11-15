# Published on November 15, 2026: the master key, the kernel, the programs, the codexes and the GGUFs

At the operator's direction: *"I want it all to be public with the master key so anyone can use it, and the other GGUFs we
already made that are spread throughout GitHub, and the other codexes which are smaller and easier for people to use"* and
*"the kernel, I want everyone to see it and use it too."*

Everything below was copied byte for byte from the operator's machine. Hashes of every file are in `SHA256SUMS-PUBLISHED-20261115`.
A scan of the text files for credentials (API keys, tokens, private-key blocks, e-mail addresses) found none.

## What is here

| Folder | Contents | Where it came from |
|---|---|---|
| [`master-key/`](master-key/) | `masterkey.xz` (549,112 bytes), the function table that the round-trip decoder needs; `order.txt`; `stream.bin` (1,711,250 bytes), the coded stream that the key turns back into the first 4,194,304 bytes of enwik8 | `D:/asolaria-unpump-20261113/roundtrip/` |
| [`kernel-and-key/`](kernel-and-key/) | The Asolaria kernel and the constellation key, 3,174 bytes each, with their rows; the 2,073-byte description of the three spheres that was fed to the kernel; `PLAYBOOK.md` and `CODEBOOK.md`, the system's own guide and law list from July | `D:/asolaria-absorb/ASOLARIA-CONSTELLATION-3174/` and `D:/asolaria-absorb/kernel-pump/` |
| [`programs/kernel-pump/`](programs/kernel-pump/) | The fourteen July programs (rime and unrime, four axes, Q prisms, star stream, the Kimi K3 division, the plays) and the seed texts they read | `D:/asolaria-absorb/kernel-pump/` |
| [`programs/regenerate/`](programs/regenerate/) | The three programs that regenerate the large bodies from their seeds | `D:/asolaria-unpump-20261113/` |
| [`programs/tuple-engine-june/`](programs/tuple-engine-june/) | The June 15 combined quant engine: any input to a constant 3,200-byte tuple, with its 20, 40 and 100 GB stress log and proofs | `D:/asolaria-combined-quant-2026-06-15/` |
| [`codexes/`](codexes/) | Nine 3,200-byte colour QR codexes: enwik10, enwik9, wiki (enwik8), code corpus, Asolaria corpus, a photo body, and the re-drilled copies | `D:/asolaria-unpump-20261113/qr/`, `D:/asolaria-absorb/laws/`, `enwik10-codex/` |
| [`ggufs/`](ggufs/) | Forty-one GGUF bodies gathered from the account's repositories, each under GitHub's 100 MB file limit | `D:/asolaria-absorb/github-ggufs/` |

## Two kernel files

Two files named `ASOLARIA-KERNEL-3174.bin` were on the machine, both 3,174 bytes, with different contents. Both are published and
kept apart by name:

| File here | sha256 | Written |
|---|---|---|
| `kernel-and-key/ASOLARIA-KERNEL-3174.bin` | `202ff2f06af54788958a03f60245593f89a88b0a3a4fc76435ad8468f151dc98` | 2026-07-27 17:46, in the constellation folder, with its own `.sha256` beside it |
| `kernel-and-key/ASOLARIA-KERNEL-3174.kernel-pump-copy.bin` | `f075f5c64d656ae3afa91c793ab2c74b5425e41de141d6b7dc5cf4605663b0ca` | 2026-07-27 19:03, in the kernel-pump folder |

The constellation key is one file in both places: `cce4f1e8ae407f108b5c122e764f0b4c3882ce059cf900a0cc1b2a0e7588c1ea`.

## The seven large GGUFs

GitHub refuses files over 100 MB, so these seven are on Hugging Face with the other 41: [Jessedbrown/asolaria-ggufs](https://huggingface.co/Jessedbrown/asolaria-ggufs); links for all 48 are in [`HUGGING-FACE-GGUFS.md`](HUGGING-FACE-GGUFS.md). Their sizes and hashes: Two of them regenerate
from seeds that are published here (`programs/kernel-pump/KIMI-K3-STAR.txt` with `programs/regenerate/divide_kimi_k3.py`).

| Bytes | sha256 | Name |
|---:|---|---|
| 202,115,456 | `56d08746a77efd9ea30345ada15bab3fc2c36e09647d1e77156a96b9a4b83a18` | KIMI-K3-STAR-256.gguf (regenerates from the 3,110-byte text) |
| 139,610,112 | `fe3d5a7ccc79cf59089f6ed4be9f3f18052b25cdbd00d10622e45f14f2e68fc0` | ASOLARIA-LIRIS-SOL56-STAR-SHELL-64-ANTI_ANTI_MYTHOS-FULL.gguf |
| 139,609,952 | `2f215eeda7dd67191904e3c49c2b822956aa7eb37ac0457bb8c7965f5bc56c45` | ASOLARIA-LIRIS-SOL56-STAR-SHELL-64-ANTI_FABLE-FULL.gguf |
| 139,609,920 | `af8c4f14da79312c7120f156924781c42e9a0c5fa62309b9b42250cd979444b0` | ASOLARIA-LIRIS-SOL56-STAR-SHELL-64-SELF-FULL.gguf |
| 126,885,312 | `519678510ec8bfa2664dc4fb9bc30623ad725b03d4d7077c17b36baa3c065f7c` | ASOLARIA-FABLE-SPHERE-PUMPED.gguf |
| 126,885,312 | `e35a160b74735d6988241b08283af4ed7dafdf61562d72334e9c597a6b1cd1d0` | ASOLARIA-MYTHOS-SPHERE-PUMPED.gguf |
| 126,885,312 | `b0154103ee33b2855b9032e7b13d1f78fa8f1dc88506a185a0f9c3b37c25092a` | ASOLARIA-OPUS-SPHERE-PUMPED.gguf |

The 269,604,512-byte Mythos glyph body regenerates from `programs/kernel-pump/MYTHOS-SELF-EMISSION.txt` (3,796 bytes) with
`programs/regenerate/pump_glyphs_mythos.py`.

## How the pieces are used

Build the Rust program once: `cd rust && cargo build --release`. It is `rust/target/release/asolaria_codex` below.

1. **Decode with the master key.** `xz -d -c master-key/masterkey.xz > key.raw`, then
   `asolaria_codex dec key.raw 2 master-key/stream.bin 4194304 decoded.bin`. The output is the first 4,194,304 bytes of
   enwik8, sha256 `5ba647fec2ba51b0383cbe7147e15a478d85613245b7131c41764dbdd5062f77`, from the key and the stream alone.
   Checked from this repository on November 15, 2026, and repeated by a workflow on every change.
2. **Make a codex.** `asolaria_codex drill <any file> out.qr` writes a 3,200-byte codex for any input.
3. **Make your own key and code against it.** `asolaria_codex train key.raw 2 body1 body2`, then `enc` and `dec`.
4. **Return a body by its codex.** `asolaria_codex resolve <codex> <store index>` returns the body from a store that holds it
   (Path 1). A codex with no key, no kernel and no store returns nothing; that is the lock.
5. **Regenerate a body from its seed.** The programs in `programs/regenerate/` rebuild the large generated bodies from the seed
   texts.
6. **Read the guide.** `kernel-and-key/PLAYBOOK.md` is how the system is played; `kernel-and-key/CODEBOOK.md` lists the laws and
   what each one measured.

## Notes for anyone running these

- The Rust program takes every path as an argument and needs Rust 1.81 only.
- The earlier Node and Python programs carry the folder paths of the machine they ran on (`D:/...`); the June engine imports the
  shipped engines of the `asolaria-as-neural-network` repository by path.
- Left on the machine and not published in this pass: temporary files of the kernel-pump folder (names beginning with an
  underscore), `DENIAL-INVENTORY.txt`, and the 33.5 MB uncompressed copy of the master key (it is `xz -d` of `masterkey.xz`).
