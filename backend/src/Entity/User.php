<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $bio = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $banner = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatar = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $location = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $website = null;

    /**
     * @var Collection<int, Subscription>
     */
    #[ORM\OneToMany(targetEntity: Subscription::class, mappedBy: 'follower')]
    private Collection $follower;

    #[ORM\Column]
    private ?bool $isBlocked = null;

    public function __construct()
{
    $this->roles = ['ROLE_USER']; // Définition par défaut
    $this->follower = new ArrayCollection();
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

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): static
    {
        $this->bio = $bio;

        return $this;
    }

    public function getBanner(): ?string
    {
        return $this->banner;
    }

    public function setBanner(?string $banner): static
    {
        $this->banner = $banner;

        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): static
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;

        return $this;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): static
    {
        $this->website = $website;

        return $this;
    }

    /**
     * @return Collection<int, Subscription>
     */
    public function getFollower(): Collection
    {
        return $this->follower;
    }

    public function addFollower(Subscription $follower): static
    {
        if (!$this->follower->contains($follower)) {
            $this->follower->add($follower);
            $follower->setFollower($this);
        }

        return $this;
    }

    public function removeFollower(Subscription $follower): static
    {
        if ($this->follower->removeElement($follower)) {
            // set the owning side to null (unless already changed)
            if ($follower->getFollower() === $this) {
                $follower->setFollower(null);
            }
        }

        return $this;
    }

    public function isBlocked(): ?bool
    {
        return $this->isBlocked;
    }

    public function setIsBlocked(bool $isBlocked): static
    {
        $this->isBlocked = $isBlocked;

        return $this;
    }
}