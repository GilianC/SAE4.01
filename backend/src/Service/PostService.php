<?php

namespace App\Service;

use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;

class PostService
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function create(Post $post): void
    {
        $this->entityManager->persist($post);
        $this->entityManager->flush();
    }
}