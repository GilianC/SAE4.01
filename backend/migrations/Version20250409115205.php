<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250409115205 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE blocked_user (id INT AUTO_INCREMENT NOT NULL, blocker_id INT NOT NULL, blocked_id INT NOT NULL, blocked_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_718E1137548D5975 (blocker_id), INDEX IDX_718E113721FF5136 (blocked_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE `utf8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE blocked_user ADD CONSTRAINT FK_718E1137548D5975 FOREIGN KEY (blocker_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE blocked_user ADD CONSTRAINT FK_718E113721FF5136 FOREIGN KEY (blocked_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user_blocked_users DROP FOREIGN KEY FK_4D4C49451EBCBB63');
        $this->addSql('ALTER TABLE user_blocked_users DROP FOREIGN KEY FK_4D4C4945A76ED395');
        $this->addSql('DROP TABLE user_blocked_users');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_blocked_users (user_id INT NOT NULL, blocked_user_id INT NOT NULL, INDEX IDX_4D4C49451EBCBB63 (blocked_user_id), INDEX IDX_4D4C4945A76ED395 (user_id), PRIMARY KEY(user_id, blocked_user_id)) DEFAULT CHARACTER SET utf8mb3 COLLATE `utf8mb3_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE user_blocked_users ADD CONSTRAINT FK_4D4C49451EBCBB63 FOREIGN KEY (blocked_user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE user_blocked_users ADD CONSTRAINT FK_4D4C4945A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE blocked_user DROP FOREIGN KEY FK_718E1137548D5975');
        $this->addSql('ALTER TABLE blocked_user DROP FOREIGN KEY FK_718E113721FF5136');
        $this->addSql('DROP TABLE blocked_user');
    }
}
