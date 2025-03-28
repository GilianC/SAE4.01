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

            // Récupérer les données de la requête
            $data = json_decode($request->getContent(), true);
    
            // Vérifier que les données nécessaires sont présentes
            if (!isset($data['email']) || !isset($data['password']) || !isset($data['pseudo'])) {
                return $this->json(['message' => 'Email, mot de passe ou pseudo manquant'], Response::HTTP_BAD_REQUEST);
            }
    
            $email = $data['email'];
            $password = $data['password'];
            $pseudo = $data['pseudo'];  // Ajouter pseudo
    
            // Vérifier si l'email existe déjà
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
}