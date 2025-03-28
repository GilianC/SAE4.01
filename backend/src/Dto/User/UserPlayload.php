<?php

namespace App\Dto\Payload;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateUserPayload
{
    #[Assert\NotBlank(message: "L'email ne peut pas être vide.")]
    #[Assert\Email(message: "L'email n'est pas valide.")]
    private string $email;

    #[Assert\NotBlank(message: "Le pseudo ne peut pas être vide.")]
    private string $pseudo;

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getPseudo(): string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo): self
    {
        $this->pseudo = $pseudo;
        return $this;
    }
}