<?php

namespace App\Service;

use App\lib\Rng;

class SongGenerator
{
    private const ITEMS_PER_PAGE = 20;
    private array $dataSets;

    public function __construct()
    {
        $dataPath = __DIR__ . '/../data';
        $this->dataSets = [
            'en-US' => $this->loadDataFile($dataPath . '/en-US.json'),
            'de-DE' => $this->loadDataFile($dataPath . '/de-DE.json'),
            'uk-UA' => $this->loadDataFile($dataPath . '/uk-UA.json'),
        ];
    }

    private function loadDataFile(string $filePath): array
    {
        if (!file_exists($filePath)) {
            throw new \Exception('Data file not found: ' . $filePath);
        }
        $content = file_get_contents($filePath);
        $data = json_decode($content, true);
        if ($data === null) {
            throw new \Exception('Failed to decode JSON from: ' . $filePath);
        }
        return $data;
    }

    public function generateSongs(array $options): array
    {
        $seed = $options['seed'] ?? 'random';
        $region = $options['region'] ?? 'en-US';
        $likesAvg = $options['likesAvg'] ?? 5.0;
        $page = $options['page'] ?? 1;

        $data = $this->dataSets[$region] ?? $this->dataSets['en-US'];

        $songs = [];
        $startIndex = ($page - 1) * self::ITEMS_PER_PAGE;

        for ($i = 0; $i < self::ITEMS_PER_PAGE; $i++) {
            $absoluteIndex = $startIndex + $i + 1;

            $contentRng = new Rng($seed . '-' . $region . '-' . $absoluteIndex);

            $title = $this->getRandomItem($data['titles'], $contentRng);
            $artist = $this->getRandomItem($data['artists'], $contentRng);
            $genre = $this->getRandomItem($data['genres'], $contentRng);

            $isSingle = $contentRng->next() > 0.5;
            $album = $isSingle ? 'Single' : $this->getRandomItem($data['albums'], $contentRng);

            $review = $this->getRandomItem($data['reviews'], $contentRng);
            $lyrics = $this->getRandomItem($data['lyrics'], $contentRng);

            $likesRng = new Rng($seed . '-likes-' . $absoluteIndex);
            $likes = $this->generateLikes($likesAvg, $likesRng);

            $songs[] = [
                'index' => $absoluteIndex,
                'id' => $seed . '-' . $region . '-' . $absoluteIndex,
                'title' => $title,
                'artist' => $artist,
                'album' => $album,
                'genre' => $genre,
                'coverParams' => $seed . '-' . $region . '-' . $absoluteIndex,
                'likes' => $likes,
                'review' => $review,
                'lyrics' => $lyrics,
            ];
        }

        return $songs;
    }

    private function getRandomItem(array $array, Rng $rng): string
    {
        $count = count($array);
        if ($count === 0) {
            return '';
        }
        $index = floor($rng->next() * $count);
        // Ensure index is within bounds
        $index = min($index, $count - 1);
        return $array[$index];
    }

    private function generateLikes(float $avg, Rng $rng): int
    {
        $r = $rng->next() + $rng->next() + $rng->next();
        $variation = $r - 1.5;
        $spread = 2.0;
        $val = $avg + ($variation * $spread);
        $likes = round($val);
        if ($likes < 0) $likes = 0;
        if ($likes > 10) $likes = 10;
        return $likes;
    }
}