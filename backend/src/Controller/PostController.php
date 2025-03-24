<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use App\Repository\PostRepository;
use App\Entity\Post;

final class PostController extends AbstractController
{
    #[Route('/posts', name: 'posts.index', methods: ['GET'])]
    public function index(Request $request, PostRepository $postRepository): Response
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = 50;
        $offset = ($page - 1) * $limit;

        $paginator = $postRepository->paginateAllOrderedByLatest($offset, $limit);
        $totalPostsCount = $paginator->count();

        $previousPage = $page > 1 ? $page - 1 : null;
        $nextPage = ($offset + $limit) < $totalPostsCount ? $page + 1 : null;

        return $this->json([
            'posts' => iterator_to_array($paginator),
            'previous_page' => $previousPage,
            'next_page' => $nextPage,
        ]);
    }
    #[Route('/api/posts/{id}', name: 'api_posts_show', methods: ['GET', 'HEAD'])]
    public function show(int $id, PostRepository $postRepository): JsonResponse
    {
        $post = $postRepository->find($id);
        if (!$post) {
            return $this->json([
                'message' => 'Post introuvable'
            ], 404);
        }

        return $this->json([
            'post' => $post
        ]);
    }

    #[Route('/api/posts/', name: 'api_posts_create', methods: ['POST'])]
    public function create(Request $request, SerializerInterface $serializer): JsonResponse
    {
        try {
            $post = $serializer->deserialize($request->getContent(), Post::class, 'json');
        } catch (\Exception $e) {
            return $this->json(['message' => 'Données JSON invalides'], 400);
        }

        if (!$post->getContent()) {
            return $this->json(['message' => 'Le champ "content" est manquant'], 400);
        }

        $post->setCreatedAt(new \DateTime());
        
        $jsonContent = $serializer->serialize($post, 'json');
        return JsonResponse::fromJsonString($jsonContent, 201);
    }
    // // PUT /api/posts/{id} : Remplacement complet d'une ressource
    // #[Route('/api/posts/{id}', name: 'api_posts_update', methods: ['PUT'])]
    // public function update(int $id, Request $request): JsonResponse
    // {
    //     // Logique pour remplacer complètement un post
    //     return $this->json([
    //         'message' => "Post {$id} mis à jour (remplacement complet)",
    //     ]);
    // }

    // // PATCH /api/posts/{id} : Mise à jour partielle d'une ressource
    // #[Route('/api/posts/{id}', name: 'api_posts_partial_update', methods: ['PATCH'])]
    // public function partialUpdate(int $id, Request $request): JsonResponse
    // {
    //     // Logique pour mettre à jour partiellement un post
    //     return $this->json([
    //         'message' => "Post {$id} mis à jour (partiellement)",
    //     ]);
    // }

    // // DELETE /api/posts/{id} : Suppression d'une ressource
    // #[Route('/api/posts/{id}', name: 'api_posts_delete', methods: ['DELETE'])]
    // public function delete(int $id): JsonResponse
    // {
    //     // Logique pour supprimer un post
    //     return $this->json([
    //         'message' => "Post {$id} supprimé",
    //     ]);
    // }
}
