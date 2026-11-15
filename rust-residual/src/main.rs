//! The residual selector of the Path 2 library, run on a real body.
//! Shared context = the cylinder shadows. Wire = only the selector among the candidates the context leaves.
//! Uses the library's own `shadow`, `crt_many`, `residual_candidate_count_for`, `residual_selector_bits_for`.
//!
//!   residual_demo BODY P1,P2[,P3...]
use path2_two_shadow_recovery::{crt_many, residual_candidate_count_for, residual_selector_bits_for, shadow};

fn main() {
    let a: Vec<String> = std::env::args().collect();
    let body = std::fs::read(&a[1]).expect("body");
    let primes: Vec<u64> = a[2].split(',').map(|s| s.parse().expect("prime")).collect();
    let bb = 8usize;
    let cand = residual_candidate_count_for(bb, &primes).expect("count");
    let bits = residual_selector_bits_for(bb, &primes).expect("bits");
    let m: u128 = primes.iter().map(|&p| u128::from(p)).product();
    let (mut context_bits, mut wire_bits, mut ok, mut blocks, mut max_sel) = (0u64, 0u64, 0u64, 0u64, 0u128);
    let per_block_context: u64 = primes.iter().map(|&p| u64::from(64 - (p - 1).leading_zeros())).sum();
    let mut back = Vec::with_capacity(body.len());
    for chunk in body.chunks(bb) {
        let mut x = 0u128;
        for &b in chunk {
            x = (x << 8) | u128::from(b);
        }
        if chunk.len() < bb {
            x <<= 8 * (bb - chunk.len()) as u32;
        }
        // black side: the shadows go to the shared context, the selector goes on the wire
        let residues: Vec<(u64, u64)> = primes.iter().map(|&p| (shadow(x, p), p)).collect();
        let selector = x / m;
        max_sel = max_sel.max(selector);
        // white side: context + selector
        let base = crt_many(&residues).expect("crt");
        let y = base + selector * m;
        ok += u64::from(y == x);
        for i in (0..chunk.len()).rev() {
            back.push(((y >> (8 * (bb - chunk.len() + i) as u32)) & 0xFF) as u8);
        }
        blocks += 1;
        context_bits += per_block_context;
        wire_bits += u64::from(bits);
    }
    let same = back == body;
    println!(
        "RESIDUAL|body_bytes={}|blocks={blocks}|cylinders={}|candidates_left_by_the_context={cand}|selector_bits_per_block={bits}|largest_selector_seen={max_sel}|context_bytes={}|wire_bytes={}|wire_bits_per_character_x1000={}|blocks_exact={ok}|body_identical={}|json=0",
        body.len(),
        primes.len(),
        context_bits / 8,
        wire_bits.div_ceil(8),
        wire_bits * 1000 / body.len() as u64,
        u8::from(same)
    );
}
