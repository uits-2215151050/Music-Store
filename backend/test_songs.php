<?php

$ch = curl_init('http://localhost:8000/api/songs?seed=test&region=en-US&likes=5&page=1');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";
$data = json_decode($response, true);
if ($data && isset($data['songs'])) {
    echo "Songs count: " . count($data['songs']) . "\n";
    echo "First song: " . $data['songs'][0]['title'] . "\n";
} else {
    echo "Response: " . $response . "\n";
}