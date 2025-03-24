<?php
namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class UserController extends AbstractController
{
    #[Route('/login', name: 'users.index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        return $this->json($this->getUser());
    }

    #[Route('/api/users/{id}', name: 'api_users_show', methods: ['GET', 'HEAD'])]
    public function show(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json([
                'message' => 'User not found',
                'token' => bin2hex(random_bytes(16)),
            ], 404);
        }

        $data = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'pseudo' => $user->getPseudo(),
        ];

        $token = bin2hex(random_bytes(16));

        return $this->json([
            'user' => $data,
            'token' => $token,
        ]);
    }

    #[Route('/register', name: 'api_users_create', methods: ['POST'])]
    public function register(
        Request $request,
        SerializerInterface $serializer,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        try {
            // Désérialisation des données envoyées en JSON
            $user = $serializer->deserialize($request->getContent(), User::class, 'json');
        } catch (\Exception $e) {
            return $this->json(['message' => 'Invalid JSON data'], Response::HTTP_BAD_REQUEST);
        }
    
        // Vérification des champs obligatoires
        if (!$user->getEmail() || !$user->getPseudo() || !$user->getPassword()) {
            return $this->json(['message' => 'Missing required user fields'], Response::HTTP_BAD_REQUEST);
        }
    
        // Vérifier si l'utilisateur existe déjà (email unique)
        if ($userRepository->findOneBy(['email' => $user->getEmail()])) {
            return $this->json(['message' => 'Email already in use'], Response::HTTP_CONFLICT);
        }
    
        // Hachage du mot de passe
        $hashedPassword = $passwordHasher->hashPassword($user, $user->getPassword());
        $user->setPassword($hashedPassword);
    
        // Génération du token API (si l'entité User possède bien un setter pour apiToken)
        if (method_exists($user, 'setApiToken')) {
            $apiToken = bin2hex(random_bytes(32));
            $user->setApiToken($apiToken);
        } else {
            return $this->json(['message' => 'API Token method missing in User entity'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    
        // Sauvegarde en base de données
        $entityManager->persist($user);
        $entityManager->flush();
    
        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'pseudo' => $user->getPseudo(),
            'api_token' => $apiToken
        ], Response::HTTP_CREATED);
    }
}