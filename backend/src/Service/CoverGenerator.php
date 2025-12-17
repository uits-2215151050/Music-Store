<?php

namespace App\Service;

use App\lib\Rng;

class CoverGenerator
{
    public function generateCoverSvg(string $seedStr, string $title, string $artist): string
    {
        // Hash seed
        $seedNum = 0;
        for ($i = 0; $i < strlen($seedStr); $i++) {
            $seedNum = (31 * $seedNum + ord($seedStr[$i])) | 0;
        }
        $rng = new Rng($seedStr);

        // Random colors
        $hue = floor($rng->next() * 360);
        $sat = 50 + floor($rng->next() * 50);
        $light = 40 + floor($rng->next() * 40);
        $bgColor = "hsl({$hue}, {$sat}%, {$light}%)";

        // Pattern
        $shapes = '';
        $numShapes = 5 + floor($rng->next() * 10);
        for ($i = 0; $i < $numShapes; $i++) {
            $x = floor($rng->next() * 200);
            $y = floor($rng->next() * 200);
            $size = 10 + floor($rng->next() * 50);
            $sHue = ($hue + floor($rng->next() * 60)) % 360;
            $opacity = 0.2 + $rng->next() * 0.5;
            $isCircle = $rng->next() > 0.5;

            if ($isCircle) {
                $shapes .= "<circle cx=\"{$x}\" cy=\"{$y}\" r=\"{$size}\" fill=\"hsl({$sHue}, {$sat}%, {$light}%)\" opacity=\"{$opacity}\" />";
            } else {
                $shapes .= "<rect x=\"{$x}\" y=\"{$y}\" width=\"{$size}\" height=\"{$size}\" fill=\"hsl({$sHue}, {$sat}%, {$light}%)\" opacity=\"{$opacity}\" />";
            }
        }

        $safeTitle = htmlspecialchars($title, ENT_XML1);
        $safeArtist = htmlspecialchars($artist, ENT_XML1);

        return <<<SVG
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="{$bgColor}" />
    {$shapes}
    <text x="100" y="80" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">{$safeTitle}</text>
    <text x="100" y="110" font-family="Arial, sans-serif" font-size="10" fill="white" text-anchor="middle" dominant-baseline="middle">{$safeArtist}</text>
</svg>
SVG;
    }
}