<?php

namespace App\Controller;

use App\Entity\Post;
use App\Entity\Like;
use App\Entity\Subscription;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Repository\PostRepository;
use App\Repository\LikeRepository;
use App\Repository\SubscriptionRepository;
use Symfony\Component\HttpFoundation\Request;

class PostController extends AbstractController
{
    #[Route('/posts', name: 'posts.list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $posts = $em->getRepository(Post::class)->findBy([], ['created_at' => 'DESC']);
        
        $data = array_map(function (Post $post) {
            $user = $post->getUser();
            if ($user->isBlocked()) {
                return new JsonResponse(['error' => 'Ce compte a été bloqué pour non-respect des conditions d\'utilisation'], JsonResponse::HTTP_FORBIDDEN);
            }
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'author' => $user ? $user->getPseudo() : 'Utilisateur inconnu',
                'authorId' => $user->getId(),
                'avatar' => $user->getAvatar(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'likes' => count($post->getLikes()),
                'liked' => $this->getUser() && $post->getLikes()->exists(function ($key, $like) {
                    return $like->getUser() === $this->getUser();
                }),
                'media' => $post->getMedia(),
            ];
        }, $posts);
        
        return new JsonResponse($data);
    }

    #[Route('/posts', name: 'posts.create', methods: ['POST'], format: 'json')]
    public function create(EntityManagerInterface $em, \Symfony\Component\HttpFoundation\Request $request): JsonResponse
    {
        $apiToken = str_replace('Bearer ', '', $request->headers->get('Authorization'));
        $user = $em->getRepository(\App\Entity\User::class)->findOneBy(['apiToken' => $apiToken]);

        if (!$user) {
            return new JsonResponse(['error' => 'Token API invalide ou expiré'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['content']) || empty($data['content'])) {
            if (!isset($data['media']) || empty($data['media'])) {
                return new JsonResponse(['error' => 'Le contenu du post ou un média est obligatoire'], JsonResponse::HTTP_BAD_REQUEST);
            }
        }

        $post = new Post();
        $post->setContent($data['content']);
        
        if (isset($data['media']) && !empty($data['media'])) {
            $post->setMedia($data['media']);
        }
        
        $post->setUser($user);
        $post->setCreatedAt(new \DateTime());

        $em->persist($post);
        $em->flush();

        return new JsonResponse(['message' => 'Post créé avec succès'], JsonResponse::HTTP_CREATED);
    }

    #[Route('/posts/{id}', name: 'update_post', methods: ['PUT'])]
    public function updatePost(int $id, Request $request, PostRepository $postRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $post = $postRepository->find($id);
        if (!$post) {
            return new JsonResponse(['message' => 'Post non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $apiToken = str_replace('Bearer ', '', $request->headers->get('Authorization'));
        $currentUser = $entityManager->getRepository(\App\Entity\User::class)->findOneBy(['apiToken' => $apiToken]);

        if (!$currentUser) {
            return new JsonResponse(['error' => 'Token API invalide ou expiré'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        if ($post->getUser() !== $currentUser) {
            return new JsonResponse(['message' => 'Non autorisé'], JsonResponse::HTTP_FORBIDDEN);
        }

        // Récupérer le contenu soit depuis le corps JSON soit depuis FormData
        $content = null;
        $contentFromJson = json_decode($request->getContent(), true);
        if ($contentFromJson && isset($contentFromJson['content'])) {
            $content = $contentFromJson['content'];
        } else {
            $content = $request->request->get('content');
        }

        if ($content !== null) {
            $post->setContent($content);
        }

        // Gérer le média
        if ($request->files->has('media')) {
            $file = $request->files->get('media');
            $fileName = uniqid() . '.' . $file->guessExtension();
            
            if ($post->getMedia()) {
                $oldMediaPath = $this->getParameter('uploads_directory') . '/' . $post->getMedia();
                if (file_exists($oldMediaPath)) {
                    unlink($oldMediaPath);
                }
            }
            
            $file->move($this->getParameter('uploads_directory'), $fileName);
            $post->setMedia($fileName);
        } elseif ($request->request->has('removeMedia') && $request->request->get('removeMedia') === 'true') {
            if ($post->getMedia()) {
                $mediaPath = $this->getParameter('uploads_directory') . '/' . $post->getMedia();
                if (file_exists($mediaPath)) {
                    unlink($mediaPath);
                }
                $post->setMedia(null);
            }
        }

        $entityManager->flush();

        $user = $post->getUser();
        return new JsonResponse([
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'author' => $user ? $user->getPseudo() : 'Utilisateur inconnu',
            'authorId' => $user ? $user->getId() : null,
            'avatar' => $user ? $user->getAvatar() : null,
            'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            'likes' => count($post->getLikes()),
            'liked' => $currentUser && $post->isLikedBy($currentUser),
            'media' => $post->getMedia(),
        ]);
    }

    #[Route('/posts/{id}/like', name: 'posts.like', methods: ['POST'])]
    public function likePost(int $id, PostRepository $postRepository, LikeRepository $likeRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $existingLike = $likeRepository->findOneBy(['post' => $post, 'user' => $user]);

        if ($existingLike) {
            $em->remove($existingLike);
            $em->flush();
            return new JsonResponse(['message' => 'Like supprimé'], JsonResponse::HTTP_OK);
        }

        $like = new Like();
        $like->setUser($user);
        $like->setPost($post);
        
        $em->persist($like);
        $em->flush();

        return new JsonResponse(['message' => 'Post liké'], JsonResponse::HTTP_OK);
    }

    #[Route('/posts/{id}', name: 'posts.delete', methods: ['DELETE'])]
    public function delete(int $id, PostRepository $postRepository, EntityManagerInterface $em): JsonResponse
    {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $em->remove($post);
        $em->flush();

        return new JsonResponse(['message' => 'Post supprimé avec succès'], JsonResponse::HTTP_OK);
    }

    #[Route('/post/followed', name: 'posts_feed_followed', methods: ['GET'])]
    public function feedFollowed(EntityManagerInterface $em, SubscriptionRepository $subscriptionRepository): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], JsonResponse::HTTP_UNAUTHORIZED);}
        $subscriptions = $subscriptionRepository->findBy(['follower' => $user]);
        if (empty($subscriptions)) {
            return $this->json([]); }
        $followedIds = array_map(function (Subscription $subscription) {
            return $subscription->getFollowing()->getId();
        }, $subscriptions);
        
        $posts = $em->getRepository(Post::class)->createQueryBuilder('p')
            ->join('p.User', 'u')
            ->where('u.id IN (:followedIds)')
            ->setParameter('followedIds', $followedIds)
            ->orderBy('p.created_at', 'DESC')
            ->getQuery()
            ->getResult();
        
        $data = array_map(function (Post $post) {
            $user = $post->getUser();
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'author' => $user ? $user->getPseudo() : 'Utilisateur inconnu',
                'authorId' => $user ? $user->getId() : null,
                'avatar' => $user ? $user->getAvatar() : null,
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'likes' => count($post->getLikes()),
                'liked' => $this->getUser() && $post->getLikes()->exists(function ($key, Like $like) {
                    return $like->getUser() === $this->getUser();
                }),
                'media' => $post->getMedia(),
            ];
        }, $posts);

        return new JsonResponse($data);
    }
}