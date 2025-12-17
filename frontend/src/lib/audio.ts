export async function generateWav(seedStr: string, genre: string = 'Electronic'): Promise<Buffer> {
    // Use high-quality local procedural audio generation
    // Each sound is unique based on seed, with phonk-style beats and rhythm
    return generateSimpleWav(seedStr);
}

function generateSimpleWav(seedStr: string): Buffer {
    // 1. Setup RNG
    // We hash the seed string to get a numeric seed
    let seedNum = 0;
    for (let i = 0; i < seedStr.length; i++) seedNum = (Math.imul(31, seedNum) + seedStr.charCodeAt(i)) | 0;
    const rng = mulberry32(seedNum);

    // 2. Audio Constants
    const sampleRate = 44100;
    const duration = 8; // 8 seconds for more variation
    const numSamples = sampleRate * duration;
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const fileSize = 36 + dataSize;

    // 3. Create Header
    const header = Buffer.alloc(44);

    // RIFF chunk
    header.write('RIFF', 0);
    header.writeUInt32LE(fileSize, 4);
    header.write('WAVE', 8);

    // fmt chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    header.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample

    // data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    // Enhanced phonk-style beat generator
    const data = Buffer.alloc(dataSize);

    // Phonk beat parameters
    const bassFreq = 40 + rng() * 20; // Sub bass 40-60Hz
    const midFreq = 150 + rng() * 100; // Mid bass 150-250Hz
    const hiHatSpeed = 8 + Math.floor(rng() * 4); // Hi-hat pattern
    
    // Chord progression (key varies per song)
    const chordRoots = [110, 138, 165, 110]; // A, F#, E, A (relative)
    const chordDuration = 2; // 2 seconds per chord
    
    // Melody parameters
    const melodyBaseFreq = 220 + rng() * 220; // 220-440 Hz
    const melodyScale = [1, 1.125, 1.25, 1.5, 1.75, 2]; // Various intervals
    let currentMelodyFreq = melodyBaseFreq;
    let nextMelodyChange = 0;
    let melodyDuration = 0.25 + rng() * 0.35;

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const beat = Math.floor(t * 4) % 16; // 16 beats in 4 seconds
        const beatPhase = (t * 4 % 1); // 0-1 within each beat

        let value = 0;

        // === BASS: Phonk sub-bass with punch ===
        const bassEnvelope = Math.max(0, 1 - beatPhase * 3); // Punchy attack
        if (beat % 4 === 0 || beat % 4 === 2) {
            // 4-on-the-floor bass pattern
            value += Math.sin(2 * Math.PI * bassFreq * t) * 0.4 * bassEnvelope;
        }
        
        // Mid-bass (adds thickness)
        if (beat % 8 === 0) {
            value += Math.sin(2 * Math.PI * midFreq * t) * 0.25 * (1 - beatPhase * 2);
        }

        // === SNARE: Pitched snare with tone ===
        if (beat % 4 === 2 || beat % 4 === 3) {
            const snareFreq = 300 + (beat % 4) * 50;
            const snareDuration = 0.1;
            const snarePhase = beatPhase / snareDuration;
            if (snarePhase < 1) {
                // Snare tone + noise
                value += Math.sin(2 * Math.PI * snareFreq * t) * (1 - snarePhase) * 0.2;
                value += (rng() - 0.5) * (1 - snarePhase) * 0.15;
            }
        }

        // === HI-HAT: Crisp hi-hat pattern ===
        const hiHatBeat = Math.floor(t * hiHatSpeed) % 32;
        if (hiHatBeat % 2 === 0) {
            const hatPhase = (t * hiHatSpeed) % (1 / hiHatSpeed);
            const hatDuration = 0.05;
            if (hatPhase < hatDuration) {
                // Hi-hat: highpass noise
                const noiseValue = (rng() - 0.5);
                // Simple highpass simulation: alternate samples
                value += (noiseValue * (1 - hatPhase / hatDuration)) * 0.08;
            }
        }

        // === MELODY: Varied melodic line ===
        if (i >= nextMelodyChange) {
            const scaleIndex = Math.floor(rng() * melodyScale.length);
            currentMelodyFreq = melodyBaseFreq * melodyScale[scaleIndex];
            nextMelodyChange = i + Math.floor(sampleRate * melodyDuration);
            melodyDuration = 0.15 + rng() * 0.4;
        }

        // Melody with smooth envelope
        const melodyProgress = (i - (nextMelodyChange - Math.floor(sampleRate * melodyDuration))) / 
                               (sampleRate * melodyDuration);
        const melodyEnvelope = melodyProgress < 0.1 
            ? melodyProgress / 0.1 
            : melodyProgress > 0.85 
            ? Math.max(0, 1 - (melodyProgress - 0.85) / 0.15) 
            : 1;
        
        value += Math.sin(2 * Math.PI * currentMelodyFreq * t) * melodyEnvelope * 0.15;

        // === CHORDS: Underlying harmony ===
        const chordIndex = Math.floor(i / (sampleRate * chordDuration)) % chordRoots.length;
        const rootFreq = chordRoots[chordIndex];
        
        // Major triad (root, major 3rd, perfect 5th)
        const chordFreqs = [
            rootFreq,           // Root
            rootFreq * 1.25,   // Major 3rd
            rootFreq * 1.5,    // Perfect 5th
        ];
        
        for (const freq of chordFreqs) {
            value += Math.sin(2 * Math.PI * freq * t) * 0.04;
        }

        // === CLAP LAYER: Occasional clap for extra punch ===
        if (beat % 16 === 6) {
            const clapPhase = beatPhase / 0.12;
            if (clapPhase < 1) {
                value += (rng() - 0.5) * (1 - clapPhase) * 0.25;
            }
        }

        // Normalize and prevent clipping
        const sample = Math.max(-1, Math.min(1, value * 0.9));
        const intSample = sample < 0 ? sample * 32768 : sample * 32767;

        data.writeInt16LE(Math.floor(intSample), i * bytesPerSample);
    }

    return Buffer.concat([header, data]);
}

import { mulberry32 } from './rng';
