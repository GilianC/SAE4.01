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
class PostController extends AbstractController
{
    #[Route('/posts', name: 'posts.list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $posts = $em->getRepository(Post::class)->findBy([], ['created_at' => 'DESC']);
        
        $data = array_map(function (Post $post) {
            $user = $post->getUser();
            if ($user->isBlocked()) {
                return new JsonResponse(['error' => 'Ce compte a été bloqué pour non respect des conditions d’utilisation'], JsonResponse::HTTP_FORBIDDEN);
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
            ];
        }, $posts);
        
        return new JsonResponse($data);
    }
//     #[Route('/feed', methods: ['GET'])]
// public function getFeed( EntityManagerInterface $em) {
//     $currentUser = $this->getUser();
//     $subscriptions = $em->getRepository(Subscription::class)->findBy(['follower' => $currentUser]);

//     $followedIds = array_map(fn($sub) => $sub->getFollowing()->getId(), $subscriptions);
//     $postsRepo = $em->getRepository(Post::class);

//     $followedPosts = $postsRepo->createQueryBuilder('p')
//         ->where('p.author IN (:ids)')
//         ->setParameter('ids', $followedIds)
//         ->orderBy('p.createdAt', 'DESC')
//         ->getQuery()
//         ->getResult();

//     return $this->json($followedPosts);
// }
// #[Route('/posts/follow', name: 'post_list', methods: ['GET'])]
// public function listFollow(EntityManagerInterface $em): JsonResponse
// {
//     $user = $this->getUser();
//     if (!$user) {
//         return $this->json(['error' => 'Utilisateur non authentifié'], JsonResponse::HTTP_UNAUTHORIZED);
//     }
//     // if(!$user->getFollowing()) {
//     //     return $this->json([]);
//     // }
//     $posts = $em->getRepository(Post::class)->findBy([], ['created_at' => 'DESC']);
    
//     $data = array_map(function (Post $post) {
//         $user = $post->getUser();
//         return [
//         'id' => $post->getId(),
//         'content' => $post->getContent(),
//         'author' => $user ? $user->getPseudo() : 'Utilisateur inconnu',
//         'authorId' => $user->getId(),
//         'avatar' => $user->getAvatar(),
//         'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
//         'likes' => count($post->getLikes()),
//         'liked' => $this->getUser() && $post->getLikes()->exists(function ($key, Like $like) {
//             return $like->getUser() === $this->getUser();
//         }),
//         ];
//     }, $posts);
    
//     return new JsonResponse($data);
// }
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

    // #[Route('/posts/{id}', name: 'posts.update', methods: ['PUT'])]
    // public function update(int $id, EntityManagerInterface $em, PostRepository $postRepository, \Symfony\Component\HttpFoundation\Request $request): JsonResponse
    // {
    //     $post = $postRepository->find($id);

    //     if (!$post) {
    //         return new JsonResponse(['error' => 'Post non trouvé'], JsonResponse::HTTP_NOT_FOUND);
    //     }

    //     $data = json_decode($request->getContent(), true);
    //     if (!isset($data['content']) || empty($data['content'])) {
    //         return new JsonResponse(['error' => 'Le contenu du post est obligatoire'], JsonResponse::HTTP_BAD_REQUEST);
    //     }

    //     $post->setContent($data['content']);
    //     $em->flush();

    //     return new JsonResponse(['message' => 'Post mis à jour avec succès'], JsonResponse::HTTP_OK);
    // }
    #[Route('/posts/{id}/like', name: 'posts.like', methods: ['POST'])]
    public function likePost(int $id, PostRepository $postRepository, LikeRepository $likeRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Vérifie si l'utilisateur a déjà liké ce post
        $existingLike = $likeRepository->findOneBy(['post' => $post, 'user' => $user]);

        if ($existingLike) {
            // Si un like existe déjà, le supprimer
            $em->remove($existingLike);
            $em->flush();
            return new JsonResponse(['message' => 'Like supprimé'], JsonResponse::HTTP_OK);
        }

        // Sinon, créer un nouveau like
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
    // Vérifier si l'utilisateur est connecté
    $user = $this->getUser();
    if (!$user) {
        return $this->json(['error' => 'Utilisateur non authentifié'], JsonResponse::HTTP_UNAUTHORIZED);
    }

    // Récupérer les abonnements de l'utilisateur connecté
    $subscriptions = $subscriptionRepository->findBy(['follower' => $user]);

    // Si l'utilisateur n'a aucun abonnement, on retourne une liste vide
    if (empty($subscriptions)) {
        return $this->json([]);
    }
    
    // Récupérer les IDs des utilisateurs suivis
    $followedIds = array_map(function (Subscription $subscription) {
        return $subscription->getFollowing()->getId();
    }, $subscriptions);
    
    // Récupérer les posts des utilisateurs suivis
    $posts = $em->getRepository(Post::class)->createQueryBuilder('p')
    ->join('p.User', 'u')  // Rejoindre l'entité 'User'
    ->where('u.id IN (:followedIds)')  // Condition sur l'ID de l'utilisateur
    ->setParameter('followedIds', $followedIds)
    ->orderBy('p.created_at', 'DESC')  // Utilisation du bon champ 'created_at'
    ->getQuery()
    ->getResult();
    
    // Formater les données des posts pour la réponse JSON
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
        ];
    }, $posts);

    return new JsonResponse($data);
}
}