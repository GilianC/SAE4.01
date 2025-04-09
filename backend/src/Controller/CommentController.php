<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Post;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class CommentController extends AbstractController
{
    #[Route('/posts/{id}/comments', name: 'comments.list', methods: ['GET'])]
    public function list(int $id, EntityManagerInterface $em): JsonResponse
    {
        $post = $em->getRepository(Post::class)->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $comments = $post->getComments();
        $data = array_map(function (Comment $comment) {
            $user = $comment->getUser();
            return [
                'id' => $comment->getId(),
                'content' => $comment->getContent(),
                'author' => $user ? $user->getPseudo() : 'Utilisateur inconnu',
                'authorId' => $user ? $user->getId() : null,
                'avatar' => $user ? $user->getAvatar() : null,
                'created_at' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $comments->toArray());

        return new JsonResponse($data);
    }

    #[Route('/posts/{id}/comments', name: 'comments.create', methods: ['POST'])]
    public function create(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $post = $em->getRepository(Post::class)->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $apiToken = str_replace('Bearer ', '', $request->headers->get('Authorization'));
        $user = $em->getRepository(User::class)->findOneBy(['apiToken' => $apiToken]);

        if (!$user) {
            return new JsonResponse(['error' => 'Token API invalide ou expiré'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['content']) || empty($data['content'])) {
            return new JsonResponse(['error' => 'Le contenu du commentaire est obligatoire'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $comment = new Comment();
        $comment->setContent($data['content']);
        $comment->setUser($user);
        $comment->setPost($post);
        $comment->setCreatedAt(new \DateTime());

        $em->persist($comment);
        $em->flush();

        return new JsonResponse([
            'id' => $comment->getId(),
            'content' => $comment->getContent(),
            'author' => $user->getPseudo(),
            'authorId' => $user->getId(),
            'avatar' => $user->getAvatar(),
            'created_at' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('/comments/{id}', name: 'comments.delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $comment = $em->getRepository(Comment::class)->find($id);
        if (!$comment) {
            return new JsonResponse(['error' => 'Commentaire non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $apiToken = str_replace('Bearer ', '', $request->headers->get('Authorization'));
        $user = $em->getRepository(User::class)->findOneBy(['apiToken' => $apiToken]);

        if (!$user) {
            return new JsonResponse(['error' => 'Token API invalide ou expiré'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        if ($comment->getUser() !== $user) {
            return new JsonResponse(['message' => 'Non autorisé'], JsonResponse::HTTP_FORBIDDEN);
        }

        $em->remove($comment);
        $em->flush();

        return new JsonResponse(['message' => 'Commentaire supprimé avec succès']);
    }
} 