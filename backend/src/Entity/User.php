<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    private ?string $email = null;

    #[ORM\Column(length: 150)]
    private ?string $pseudo = null;

    #[ORM\Column(length: 150)]
    private ?string $password = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $apiToken = null;

    #[ORM\Column]
    private ?bool $isValidated = false;

    #[ORM\Column]
    private array $roles = [];

    public function __construct()
{
    $this->roles = ['ROLE_USER']; // Définition par défaut
}
    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getPseudo(): ?string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo): static
    {
        $this->pseudo = $pseudo;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function getApiToken(): ?string
    {
        return $this->apiToken;
    }

    public function setApiToken(?string $apiToken): static
    {
        $this->apiToken = $apiToken;
        return $this;
    }

    // Méthodes requises par UserInterface et PasswordAuthenticatedUserInterface :

    /**
     * Utilisé comme identifiant unique (remplace getUsername() dans Symfony 5.3+)
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * Retourne les rôles de l'utilisateur
     *
     * @return string[]
     */
    public function getRoles(): array
    {
        $roles = $this->roles ?? []; // Si roles est null, on met []
        $roles[] = 'ROLE_USER'; // Toujours ajouter ROLE_USER
        return array_unique($roles); // Évite les doublons
    }
    /**
     * Supprimez les données sensibles, le cas échéant
     */
    public function eraseCredentials(): void
    {
        // Pas d'action particulière ici si vous ne stockez pas de données sensibles
    }

    public function isValidated(): ?bool
    {
        return (bool) $this->isValidated;

    }

    public function setIsValidated(bool $isValidated): static
    {
        $this->isValidated = $isValidated;

        return $this;
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles ?: ['ROLE_USER']; 
        return $this;
    }
}