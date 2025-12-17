/**
 * Simple seeded random number generator using Mulberry32 algorithm.
 * 
 * @param seed The numeric seed.
 * @returns A function that returns a number between 0 and 1.
 */
export function mulberry32(seed: number) {
    return function () {
        var t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

/**
 * Hash a string to a 32-bit integer.
 */
export function cyrb128(str: string) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

/**
 * Creates a seeded RNG function.
 * Combines a base seed string and an offset (e.g., page number or row index).
 */
export function createRNG(baseSeed: string, offset: number = 0) {
    const combined = `${baseSeed}_${offset}`;
    const seedNum = cyrb128(combined);
    return mulberry32(seedNum);
}
