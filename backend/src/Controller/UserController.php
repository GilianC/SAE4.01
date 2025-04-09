<?php
namespace App\Controller;

use App\Entity\User;
use App\Entity\Subscription;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Service\EmailSender;
use Doctrine\ORM\EntityManager;
use App\Entity\BlockedUser;

final class UserController extends AbstractController
{
    
    private $emailSender;

    public function __construct(EmailSender $emailSender) {
        $this->emailSender = $emailSender;
    }

    #[Route('/login', name: 'api_users_login', methods: ['POST'])]
    public function login(Request $request, UserRepository $userRepository, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordEncoder): JsonResponse
    {
       
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            return $this->json(['message' => 'Email ou mot de passe manquant'], Response::HTTP_BAD_REQUEST);
        }

        $email = $data['email'];
        $password = $data['password'];
        $user = $userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            return $this->json(['message' => 'Email ou mot de passe incorrect'], Response::HTTP_UNAUTHORIZED);
        }
        if (!$passwordEncoder->isPasswordValid($user, $password)) {
            return $this->json(['message' => 'Email ou mot de passe incorrect'], Response::HTTP_UNAUTHORIZED);
        }
        if (!$user->isValidated()) {
            return $this->json(['message' => 'Votre email n\'a pas été validé. Veuillez vérifier votre boîte de réception.'], Response::HTTP_FORBIDDEN);
        }
        if (!$user->getApiToken()) {
            $token = bin2hex(random_bytes(32));
            $user->setApiToken($token);
            $entityManager->persist($user);
            $entityManager->flush();
        } else {
            $token = $user->getApiToken();
        }
        return $this->json([
            'message' => 'Authentification réussie',
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'avatar' => $user->getAvatar(),
            ],
            
        ]);
    }
    #[Route('/users', name: 'get_users', methods: ['GET'])]
    public function getUsers(UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        $usersData = array_map(function ($user) {
            return [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
            ];
        }, $users);

        return $this->json($usersData);
    }
    #[Route('/api/users/{id}', name: 'api_users_show', methods: ['GET', 'HEAD'])]
    public function getUserById(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse($user);
    }
    #[Route('/register', name: 'api_users_create', methods: ['POST'])]
    public function register(Request $request, UserRepository $userRepository, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): JsonResponse
    {

            $data = json_decode($request->getContent(), true);
            if (!isset($data['email']) || !isset($data['password']) || !isset($data['pseudo'])) {
                return $this->json(['message' => 'Email, mot de passe ou pseudo manquant'], Response::HTTP_BAD_REQUEST);
            }
    
            $email = $data['email'];
            $password = $data['password'];
            $pseudo = $data['pseudo'];  
            $existingUser = $userRepository->findOneBy(['email' => $email]);
            if ($existingUser) {
                return $this->json(['message' => 'Email déjà utilisé'], Response::HTTP_CONFLICT);
            }
            $user = new User();
            $user->setEmail($email);
            $user->setPseudo($pseudo);  
            $user->setPassword($passwordHasher->hashPassword($user, $password));
            $user->setIsValidated(false);  
            $user->setApiToken(bin2hex(random_bytes(32))); 
            $user->setIsBlocked(false);
            if (empty($user->getRoles())) {
                $user->setRoles(['ROLE_USER']);
            }

            $entityManager->persist($user);
            $entityManager->flush();
            $this->emailSender->sendValidationEmail($user->getEmail(), $user->getApiToken());
            return $this->json(['message' => 'Utilisateur créé avec succès'], Response::HTTP_CREATED);
    

    }
    #[Route('/profile/{id}', name: 'api_users_profile', methods: ['GET'])]
    public function profile(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json([
            'id'       => $user->getId(),
            'pseudo'   => $user->getPseudo(),
            'bio'      => $user->getBio(),
            'avatar'   => $user->getAvatar(),
            'banner'   => $user->getBanner(),
            'location' => $user->getLocation(),
            'website'  => $user->getWebsite(),
        ]);
    }
    #[Route('/upload', name: 'upload', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        if (!$file) {
            return new JsonResponse(['error' => 'Aucun fichier reçu'], 400);
        }

        // Vérification du type de fichier
        $mimeType = $file->getMimeType();
        if (!str_starts_with($mimeType, 'image/') && !str_starts_with($mimeType, 'video/')) {
            return new JsonResponse(['error' => 'Le fichier doit être une image ou une vidéo'], 400);
        }

        // Vérification de la taille selon le type de fichier
        $maxSize = str_starts_with($mimeType, 'video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB pour vidéos, 5MB pour images
        if ($file->getSize() > $maxSize) {
            $maxSizeMB = $maxSize / (1024 * 1024);
            return new JsonResponse(['error' => "Le fichier est trop volumineux (maximum {$maxSizeMB}MB)"], 400);
        }

        $uploadsDirectory = $this->getParameter('kernel.project_dir') . '/public/uploads';
        
        // Création du répertoire s'il n'existe pas
        if (!file_exists($uploadsDirectory)) {
            mkdir($uploadsDirectory, 0777, true);
        }

        $newFilename = uniqid() . '.' . $file->guessExtension();

        try {
            $file->move($uploadsDirectory, $newFilename);
            // Définir les permissions du fichier
            chmod($uploadsDirectory . '/' . $newFilename, 0644);
            
            return new JsonResponse([
                'filename' => $newFilename,
                'url' => '/uploads/' . $newFilename
            ]);
        } catch (FileException $e) {
            return new JsonResponse(['error' => 'Erreur lors du déplacement du fichier'], 500);
        }
    }
    #[Route('/profile/upload', name: 'profile_upload', methods: ['POST'])]
public function uploade(Request $request): JsonResponse
{
    $file = $request->files->get('file');
    
    if (!$file) {
        return new JsonResponse(['error' => 'Aucun fichier reçu'], 400);
    }

    $destination = $this->getParameter('kernel.project_dir') . '/public/uploads';
    $newFilename = uniqid() . '.' . $file->guessExtension();
    
    try {
        $file->move($destination, $newFilename);
    } catch (FileException $e) {
        return new JsonResponse(['error' => 'Erreur lors de l\'upload'], 500);
    }

    return new JsonResponse(['url' => '/uploads/' . $newFilename]);
}
    #[Route('/profile/edit', name: 'profile_edit', methods: ['POST'])]
    public function edit(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return new JsonResponse(['error' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
        }

        // Mise à jour des champs textuels
        if (isset($data['bio'])) {
            $user->setBio($data['bio']);
        }
        if (isset($data['website'])) {
            $user->setWebsite($data['website']);
        }
        if (isset($data['location'])) {
            $user->setLocation($data['location']);
        }
        if (isset($data['avatar'])) {
            $user->setAvatar($data['avatar']);
        }
        if (isset($data['banner'])) {
            $user->setBanner($data['banner']);
        }

        try {
            $entityManager->flush();
            return new JsonResponse([
                'message' => 'Profil mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'pseudo' => $user->getPseudo(),
                    'bio' => $user->getBio(),
                    'avatar' => $user->getAvatar(),
                    'banner' => $user->getBanner(),
                    'location' => $user->getLocation(),
                    'website' => $user->getWebsite(),
                ]
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Erreur lors de la mise à jour du profil'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    #[Route('/validate', name: 'api_users_validate', methods: ['GET'])]
    public function validateUser(Request $request, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $token = $request->query->get('token');  // Récupère le token depuis l'URL
    
        if (!$token) {
            return $this->json(['message' => 'Token manquant'], Response::HTTP_BAD_REQUEST);
        }
    
        // Recherche l'utilisateur par le token
        $user = $userRepository->findOneBy(['apiToken' => $token]);
    
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }
    
        // Marquer l'utilisateur comme validé
        $user->setIsValidated(true);
    
        // Persister les modifications et les sauvegarder dans la base de données
        $entityManager->persist($user);
        $entityManager->flush();  // Applique les changements dans la base de données
    
        return $this->json(['message' => 'Email validé avec succès'], Response::HTTP_OK);
    }
#[Route('/follow/{id}', methods: ['POST'])]
public function followUser(int $id, EntityManagerInterface $em) {
    $currentUser = $this->getUser();
    $userToFollow = $em->getRepository(User::class)->find($id);

    if (!$userToFollow || $currentUser === $userToFollow) {
        return $this->json(["message" => "Utilisateur invalide"], 400);
    }

    $subscriptionRepo = $em->getRepository(Subscription::class);
    $existingSubscription = $subscriptionRepo->findOneBy([
        'follower' => $currentUser,
        'following' => $userToFollow
    ]);

    if ($existingSubscription) {
        // Si déjà suivi, on supprime
        $em->remove($existingSubscription);
        $message = "Désabonné";
    } else {
        // Sinon, on ajoute
        $subscription = new Subscription();
        $subscription->setFollower($currentUser);
        $subscription->setFollowing($userToFollow);
        $em->persist($subscription);
        $message = "Suivi";
    }

    $em->flush();
    return $this->json(["message" => $message]);
}
#[Route('/followed', methods: ['GET'])]
public function getFollowedUsers( EntityManagerInterface $em) {
    $currentUser = $this->getUser();
    $subscriptions = $em->getRepository(Subscription::class)->findBy(['follower' => $currentUser]);

    $followedUsers = array_map(fn($sub) => $sub->getFollowing()->getId(), $subscriptions);

    return $this->json($followedUsers);
}

#[Route('/users/{id}/block', name: 'users.block', methods: ['POST'])]
public function blockUser(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
{
    $apiToken = str_replace('Bearer ', '', $request->headers->get('Authorization'));
    $currentUser = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $apiToken]);

    if (!$currentUser) {
        return new JsonResponse(['error' => 'Token API invalide ou expiré'], JsonResponse::HTTP_UNAUTHORIZED);
    }

    $userToBlock = $entityManager->getRepository(User::class)->find($id);
    if (!$userToBlock) {
        return new JsonResponse(['error' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
    }

    if ($currentUser->getId() === $userToBlock->getId()) {
        return new JsonResponse(['error' => 'Vous ne pouvez pas vous bloquer vous-même'], JsonResponse::HTTP_BAD_REQUEST);
    }

    // Vérifier si l'utilisateur est déjà bloqué
    $blockedUser = $entityManager->getRepository(BlockedUser::class)->findOneBy([
        'blocker' => $currentUser,
        'blocked' => $userToBlock
    ]);

    if ($blockedUser) {
        // Débloquer l'utilisateur
        $entityManager->remove($blockedUser);
        $entityManager->flush();
        return new JsonResponse(['message' => 'Utilisateur débloqué avec succès']);
    }

    // Bloquer l'utilisateur
    $blockedUser = new BlockedUser();
    $blockedUser->setBlocker($currentUser);
    $blockedUser->setBlocked($userToBlock);
    $blockedUser->setBlockedAt(new \DateTimeImmutable());

    // Supprimer l'abonnement s'il existe
    $subscription = $entityManager->getRepository(Subscription::class)->findOneBy([
        'follower' => $currentUser,
        'following' => $userToBlock
    ]);

    if ($subscription) {
        $entityManager->remove($subscription);
    }

    $entityManager->persist($blockedUser);
    $entityManager->flush();

    return new JsonResponse(['message' => 'Utilisateur bloqué avec succès']);
}
#[Route('/follow/status/{id}', name: 'follow_status', methods: ['GET'])]
public function getFollowStatus(int $id, EntityManagerInterface $em): JsonResponse
{
    $currentUser = $this->getUser();
    if (!$currentUser) {
        return new JsonResponse(['error' => 'Utilisateur non authentifié'], JsonResponse::HTTP_UNAUTHORIZED);
    }
    
    $userToCheck = $em->getRepository(User::class)->find($id);
    if (!$userToCheck) {
        return new JsonResponse(['error' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
    }
    
    $subscriptionRepo = $em->getRepository(Subscription::class);
    $subscription = $subscriptionRepo->findOneBy([
        'follower' => $currentUser,
        'following' => $userToCheck,
    ]);
    
    return new JsonResponse(['isFollowing' => $subscription !== null]);
}
#[Route('/users/blocked', name: 'users.blocked.list', methods: ['GET'])]
public function getBlockedUsers(Request $request, EntityManagerInterface $entityManager): JsonResponse
{
    $apiToken = str_replace('Bearer ', '', $request->headers->get('Authorization'));
    $currentUser = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $apiToken]);

    if (!$currentUser) {
        return new JsonResponse(['error' => 'Token API invalide ou expiré'], JsonResponse::HTTP_UNAUTHORIZED);
    }

    $blockedUsers = $entityManager->getRepository(BlockedUser::class)->findBy(['blocker' => $currentUser]);
    
    $data = array_map(function (BlockedUser $blockedUser) {
        $blocked = $blockedUser->getBlocked();
        return [
            'id' => $blocked->getId(),
            'pseudo' => $blocked->getPseudo(),
            'avatar' => $blocked->getAvatar(),
            'blockedAt' => $blockedUser->getBlockedAt()->format('Y-m-d H:i:s')
        ];
    }, $blockedUsers);

    return new JsonResponse($data);
}

#[Route('/users/{id}/is-blocked', name: 'users.is-blocked', methods: ['GET'])]
public function isUserBlocked(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
{
    $apiToken = str_replace('Bearer ', '', $request->headers->get('Authorization'));
    $currentUser = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $apiToken]);

    if (!$currentUser) {
        return new JsonResponse(['error' => 'Token API invalide ou expiré'], JsonResponse::HTTP_UNAUTHORIZED);
    }

    $userToCheck = $entityManager->getRepository(User::class)->find($id);
    if (!$userToCheck) {
        return new JsonResponse(['error' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
    }

    $isBlocked = $entityManager->getRepository(BlockedUser::class)->findOneBy([
        'blocker' => $currentUser,
        'blocked' => $userToCheck
    ]);

    return new JsonResponse(['isBlocked' => $isBlocked !== null]);
}
}