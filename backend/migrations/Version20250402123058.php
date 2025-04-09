<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250402123058 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE subscription (id INT AUTO_INCREMENT NOT NULL, follower_id INT NOT NULL, following_id INT NOT NULL, id_follow INT NOT NULL, INDEX IDX_A3C664D3AC24F853 (follower_id), INDEX IDX_A3C664D31816E3A3 (following_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE `utf8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_A3C664D3AC24F853 FOREIGN KEY (follower_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_A3C664D31816E3A3 FOREIGN KEY (following_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY FK_A3C664D3AC24F853');
        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY FK_A3C664D31816E3A3');
        $this->addSql('DROP TABLE subscription');
    }
}
