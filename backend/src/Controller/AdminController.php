<?php
namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class AdminController extends AbstractController
{
    /**
     * @Route("/admin/users", name="admin_users", methods={"GET"})
     */
    public function getUsers(UserRepository $userRepository, AuthorizationCheckerInterface $authChecker): JsonResponse
    {
        // Vérifier si l'utilisateur est un admin
        if (!$authChecker->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['message' => 'Accès refusé'], 403);
        }

        // Récupérer les utilisateurs
        $users = $userRepository->findAll();
        return new JsonResponse($users);
    }
    #[Route('/admin/users/{id}', name: 'admin_update_user', methods: ['PUT'])]
    public function updateUser(
        int $id,
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Récupérer l'utilisateur
        $user = $userRepository->find($id);
        
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Vérifier si l'utilisateur est un administrateur
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès interdit'], JsonResponse::HTTP_FORBIDDEN);
        }

        // Décoder les données de la requête
        $data = json_decode($request->getContent(), true);

        // Mettre à jour les informations de l'utilisateur (sauf le mot de passe)
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        if (isset($data['username'])) {
            $user->setUsername($data['username']);
        }

        if (isset($data['roles'])) {
            // On peut éventuellement mettre à jour les rôles
            $user->setRoles($data['roles']);
        }

        // Sauvegarder les changements
        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json(['message' => 'Utilisateur mis à jour avec succès']);
    }
}