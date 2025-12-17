<?php

namespace App\Controller\Api;

use App\Service\AudioGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class MusicController extends AbstractController
{
    #[Route('/api/music/preview/{id}', name: 'api_music_preview', methods: ['GET'])]
    public function getPreview(string $id, Request $request, AudioGenerator $generator): Response
    {
        $genre = $request->query->get('genre', 'Electronic');

        $audioBuffer = $generator->generateWav($id);

        $response = new Response($audioBuffer, 200, [
            'Content-Type' => 'audio/wav',
            'Content-Length' => strlen($audioBuffer),
        ]);
        $response->headers->set('Access-Control-Allow-Origin', '*');
        return $response;
    }
}