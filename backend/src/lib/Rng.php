<?php

namespace App\lib;

class Rng
{
    private int $seed;

    public function __construct(string $seed)
    {
        // Use abs to handle negative values from crc32
        $this->seed = abs(crc32($seed)) % 1000000;
    }

    public function next(): float
    {
        $this->seed = ($this->seed * 9301 + 49297) % 233280;
        return $this->seed / 233280.0;
    }
}