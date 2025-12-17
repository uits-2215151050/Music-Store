<?php

namespace App\Controller\Api;

use App\Service\SongGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SongsController extends AbstractController
{
    #[Route('/api/songs', name: 'api_songs', methods: ['GET'])]
    public function getSongs(Request $request, SongGenerator $generator): JsonResponse
    {
        $seed = $request->query->get('seed', 'random');
        $region = $request->query->get('region', 'en-US');
        $likesAvg = (float) $request->query->get('likes', 5);
        $page = (int) $request->query->get('page', 1);
        $viewMode = $request->query->get('viewMode', 'table');

        $options = [
            'seed' => $seed,
            'region' => $region,
            'likesAvg' => $likesAvg,
            'page' => $page,
            'viewMode' => $viewMode,
        ];

        try {
            $songs = $generator->generateSongs($options);
            $response = $this->json([
                'songs' => $songs,
                'meta' => [
                    'page' => $page,
                    'seed' => $seed,
                    'region' => $region,
                    'likesAvg' => $likesAvg,
                ],
            ]);
            $response->headers->set('Access-Control-Allow-Origin', '*');
            return $response;
        } catch (\Exception $e) {
            $response = $this->json(['error' => 'Failed to generate data: ' . $e->getMessage()], 500);
            $response->headers->set('Access-Control-Allow-Origin', '*');
            return $response;
        }
    }
}