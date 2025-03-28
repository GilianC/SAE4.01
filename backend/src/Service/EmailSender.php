<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class EmailSender
{
    private $mailer;

    public function __construct(MailerInterface $mailer)
    {
        $this->mailer = $mailer;
    }

    public function sendValidationEmail(string $email, string $token): void
    {
        $emailMessage = (new Email())
            ->from('no-reply@yourdomain.com')
            ->to($email)
            ->subject('Validation de votre email')
            ->html(
                '<p>Bonjour,</p><p>Merci de vous être inscrit. Pour valider votre compte, cliquez sur le lien suivant :</p>' .
                '<p><a href="http://localhost:8080/validate?token=' . $token . '">Valider mon email</a></p>'
            );

        $this->mailer->send($emailMessage);
    }
}