<?php

namespace App\Controller\Api;

use App\Service\CoverGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class CoverController extends AbstractController
{
    #[Route('/api/cover/{id}', name: 'api_cover', methods: ['GET'])]
    public function getCover(string $id, Request $request, CoverGenerator $generator): Response
    {
        $title = $request->query->get('title', 'Unknown');
        $artist = $request->query->get('artist', 'Unknown');

        $svg = $generator->generateCoverSvg($id, $title, $artist);

        $response = new Response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
        ]);
        $response->headers->set('Access-Control-Allow-Origin', '*');
        return $response;
    }
}