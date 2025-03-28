<?php

namespace App\Controller;

use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class PostController extends AbstractController
{
    #[Route('/posts', name: 'post_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $posts = $em->getRepository(Post::class)->findAll();
    
        $data = array_map(function (Post $post) {
            $user = $post->getUser(); // On récupère l'utilisateur associé
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'author' => $user ? $user->getPseudo() : 'Utilisateur inconnu',
                'createdAt' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $posts);
    
        return new JsonResponse($data);
    }
    #[Route('/posts', name: 'posts.create', methods: ['POST'], format: 'json')]
    public function create(EntityManagerInterface $em, \Symfony\Component\HttpFoundation\Request $request): JsonResponse
    {
        // Récupérer le token depuis l'en-tête Authorization
        $apiToken = str_replace('Bearer ', '', $request->headers->get('Authorization'));
        $user = $em->getRepository(\App\Entity\User::class)->findOneBy(['apiToken' => $apiToken]);

        if (!$user) {
            return new JsonResponse(['error' => 'Token API invalide ou expiré'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['content']) || empty($data['content'])) {
            return new JsonResponse(['error' => 'Le contenu du post est obligatoire'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $post = new Post();
        $post->setContent($data['content']);
        $post->setUser($user);
        $post->setCreatedAt(new \DateTime());

        $em->persist($post);
        $em->flush();

        return new JsonResponse(['message' => 'Post créé avec succès'], JsonResponse::HTTP_CREATED);
    }
}