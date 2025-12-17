<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class HealthController extends AbstractController
{
    #[Route('/api/health', name: 'api_health', methods: ['GET'])]
    public function health(): JsonResponse
    {
        $response = $this->json([
            'status' => 'ok',
            'message' => 'Backend API is running'
        ]);
        $response->headers->set('Access-Control-Allow-Origin', '*');
        return $response;
    }
}