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

use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Service\EmailSender;


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

        // Chercher l'utilisateur dans la base de données
        $user = $userRepository->findOneBy(['email' => $email]);

        // Vérifier si l'utilisateur existe
        if (!$user) {
            return $this->json(['message' => 'Email ou mot de passe incorrect'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier le mot de passe
        if (!$passwordEncoder->isPasswordValid($user, $password)) {
            return $this->json(['message' => 'Email ou mot de passe incorrect'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier si l'utilisateur a validé son email
        if (!$user->isValidated()) {
            return $this->json(['message' => 'Votre email n\'a pas été validé. Veuillez vérifier votre boîte de réception.'], Response::HTTP_FORBIDDEN);
        }

        // Générer un token API s'il n'existe pas encore
        if (!$user->getApiToken()) {
            // Générer un token sécurisé
            $token = bin2hex(random_bytes(32)); // Générer un token sécurisé
            $user->setApiToken($token);

            // Sauvegarder l'utilisateur avec le token en base de données
            $entityManager->persist($user);
            $entityManager->flush();
        } else {
            // Si un token existe déjà, on l'utilise
            $token = $user->getApiToken();
        }

        // Retourner la réponse avec le message de succès et le token
        return $this->json([
            'message' => 'Authentification réussie',
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
            ]
        ]);
    }
    #[Route('/users', name: 'get_users', methods: ['GET'])]
    public function getUsers(UserRepository $userRepository): JsonResponse
    {
        // Récupérer tous les utilisateurs
        $users = $userRepository->findAll();
        
        // Exclure les rôles des utilisateurs
        $usersData = array_map(function ($user) {
            return [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                // Ajoutez d'autres informations si nécessaire
            ];
        }, $users);

        // Renvoie les utilisateurs sans les rôles
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
    // #[Route('/uploadavatar', name: 'upload_avatar', methods: ['POST'])]
    // public function uploadAvatar(Request $request): JsonResponse
    // {

    //     $file = $request->files->get('avatar');

    //     if (!$file) {
    //         return $this->json(['error' => 'Fichier manquant'], JsonResponse::HTTP_BAD_REQUEST);
    //     }
    //     if (!in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/gif'])) {
    //         return $this->json(['error' => 'Le fichier doit être une image valide'], JsonResponse::HTTP_BAD_REQUEST);
    //     }

    //     $uploadDirectory = '/path/to/your/upload/directory';

    //     $newFilename = uniqid() . '.' . $file->guessExtension();

    //     try {
    //         $file->move($uploadDirectory, $newFilename);
    //     } catch (FileException $e) {
    //         return $this->json(['error' => 'Erreur lors de l\'upload de l\'image'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
    //     }
    //     return $this->json(['message' => 'Avatar mis à jour avec succès', 'filename' => $newFilename]);
    // }
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
}