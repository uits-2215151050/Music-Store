<?php

require 'd:\\Projects\\music-php\\backend\\vendor\\autoload.php';

try {
    $generator = new \App\Service\SongGenerator();
    $songs = $generator->generateSongs([
        'seed' => 'test',
        'region' => 'en-US',
        'likesAvg' => 5,
        'page' => 1
    ]);
    echo json_encode(['success' => true, 'count' => count($songs)]);
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
}