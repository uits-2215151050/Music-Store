<?php

namespace App\Service;

use App\lib\Rng;

class AudioGenerator
{
    public function generateWav(string $seedStr): string
    {
        // Hash seed
        $seedNum = 0;
        for ($i = 0; $i < strlen($seedStr); $i++) {
            $seedNum = (31 * $seedNum + ord($seedStr[$i])) | 0;
        }
        $rng = new Rng($seedStr);

        // Audio Constants
        $sampleRate = 44100;
        $duration = 8;
        $numSamples = $sampleRate * $duration;
        $numChannels = 1;
        $bytesPerSample = 2;
        $blockAlign = $numChannels * $bytesPerSample;
        $byteRate = $sampleRate * $blockAlign;
        $dataSize = $numSamples * $blockAlign;
        $fileSize = 36 + $dataSize;

        // Header
        $header = pack('a4Va4a4VvvVVvv', 'RIFF', $fileSize, 'WAVE', 'fmt ', 16, 1, $numChannels, $sampleRate, $byteRate, $blockAlign, $bytesPerSample * 8);
        $header .= pack('a4V', 'data', $dataSize);

        // Data
        $data = '';
        $bassFreq = 40 + $rng->next() * 20;
        $midFreq = 150 + $rng->next() * 100;
        $hiHatSpeed = 8 + floor($rng->next() * 4);
        $chordRoots = [110, 138, 165, 110];
        $chordDuration = 2;
        $melodyBaseFreq = 220 + $rng->next() * 220;
        $melodyScale = [1, 1.125, 1.25, 1.5, 1.75, 2];
        $currentMelodyFreq = $melodyBaseFreq;
        $nextMelodyChange = 0;
        $melodyDuration = 0.25 + $rng->next() * 0.35;

        for ($i = 0; $i < $numSamples; $i++) {
            $t = $i / $sampleRate;
            $beat = floor($t * 4) % 16;
            $beatPhase = fmod($t * 4, 1);

            $value = 0;

            // Bass
            $bassEnvelope = max(0, 1 - $beatPhase * 3);
            if ($beat % 4 === 0 || $beat % 4 === 2) {
                $value += sin(2 * M_PI * $bassFreq * $t) * 0.4 * $bassEnvelope;
            }

            // Mid-bass
            if ($beat % 8 === 0) {
                $value += sin(2 * M_PI * $midFreq * $t) * 0.25 * (1 - $beatPhase * 2);
            }

            // Snare
            if ($beat % 4 === 2 || $beat % 4 === 3) {
                $snareFreq = 300 + ($beat % 4) * 50;
                $snareDuration = 0.1;
                $snarePhase = $beatPhase / $snareDuration;
                if ($snarePhase < 1) {
                    $value += sin(2 * M_PI * $snareFreq * $t) * (1 - $snarePhase) * 0.2;
                    $value += ($rng->next() - 0.5) * (1 - $snarePhase) * 0.15;
                }
            }

            // Hi-hat
            $hiHatBeat = floor($t * $hiHatSpeed) % 32;
            if ($hiHatBeat % 2 === 0) {
                $hatPhase = fmod($t * $hiHatSpeed, 1 / $hiHatSpeed);
                $hatDuration = 0.05;
                if ($hatPhase < $hatDuration) {
                    $noiseValue = $rng->next() - 0.5;
                    $value += $noiseValue * (1 - $hatPhase / $hatDuration) * 0.08;
                }
            }

            // Melody
            if ($i >= $nextMelodyChange) {
                $scaleIndex = floor($rng->next() * count($melodyScale));
                $currentMelodyFreq = $melodyBaseFreq * $melodyScale[$scaleIndex];
                $nextMelodyChange = $i + floor($sampleRate * $melodyDuration);
                $melodyDuration = 0.15 + $rng->next() * 0.4;
            }

            $melodyProgress = ($i - ($nextMelodyChange - floor($sampleRate * $melodyDuration))) / ($sampleRate * $melodyDuration);
            $melodyEnvelope = $melodyProgress < 0.1 ? $melodyProgress / 0.1 : ($melodyProgress > 0.85 ? max(0, 1 - ($melodyProgress - 0.85) / 0.15) : 1);
            $value += sin(2 * M_PI * $currentMelodyFreq * $t) * $melodyEnvelope * 0.15;

            // Chords
            $chordIndex = floor($i / ($sampleRate * $chordDuration)) % count($chordRoots);
            $rootFreq = $chordRoots[$chordIndex];
            $chordFreqs = [$rootFreq, $rootFreq * 1.25, $rootFreq * 1.5];
            foreach ($chordFreqs as $freq) {
                $value += sin(2 * M_PI * $freq * $t) * 0.04;
            }

            // Clap
            if ($beat % 16 === 6) {
                $clapPhase = $beatPhase / 0.12;
                if ($clapPhase < 1) {
                    $value += ($rng->next() - 0.5) * (1 - $clapPhase) * 0.25;
                }
            }

            // Normalize
            $sample = max(-1, min(1, $value * 0.9));
            $intSample = $sample < 0 ? $sample * 32768 : $sample * 32767;
            $data .= pack('s', floor($intSample));
        }

        return $header . $data;
    }
}