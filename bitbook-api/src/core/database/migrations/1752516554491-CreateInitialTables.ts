import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1752516554491 implements MigrationInterface {
    name = 'CreateInitialTables1752516554491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`profiles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`cpf\` varchar(255) NULL, \`birth_date\` date NULL, \`avatar\` varchar(255) NULL, \`cover\` varchar(255) NULL DEFAULT 'https://bitplus.s3.sa-east-1.amazonaws.com/default/cover-profile.png', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NULL, UNIQUE INDEX \`IDX_30d20cfa6967ffa3e3a9c55469\` (\`cpf\`), UNIQUE INDEX \`REL_9e432b7df0d182f8d292902d1a\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`premium\` tinyint NOT NULL DEFAULT 0, \`provider_id\` int NULL, \`role\` varchar(255) NOT NULL DEFAULT 'client', \`terms\` tinyint NOT NULL DEFAULT 0, \`biometricSecretHash\` varchar(255) NULL, \`isBiometricEnabled\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`books_sheets\` (\`id\` int NOT NULL AUTO_INCREMENT, \`author\` varchar(255) NOT NULL, \`genre\` varchar(255) NOT NULL, \`year\` int NOT NULL, \`ref\` varchar(255) NOT NULL, \`books_id\` int NULL, UNIQUE INDEX \`REL_5139deff6403868f55adc51723\` (\`books_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`ico\` varchar(255) NOT NULL, \`premium\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`books_tracks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`audio_url\` varchar(255) NOT NULL, \`duration\` varchar(255) NOT NULL DEFAULT '00:00:00', \`order\` int NOT NULL DEFAULT '0', \`description\` text NULL, \`cover_small\` text NULL, \`cover_medium\` text NULL, \`cover_large\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`media_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`books_media\` (\`id\` int NOT NULL AUTO_INCREMENT, \`file_url\` varchar(255) NULL, \`img_small\` varchar(255) NULL, \`img_medium\` varchar(255) NULL, \`img_large\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`books_id\` int NULL, UNIQUE INDEX \`REL_cda162d88534fe29f5b853a1f8\` (\`books_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`books\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`premium\` tinyint NOT NULL DEFAULT 0, \`high\` tinyint NOT NULL DEFAULT 0, \`type\` enum ('ebook', 'audiobook') NOT NULL DEFAULT 'ebook', \`description\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`category_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`readings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`current_page\` int NOT NULL DEFAULT '0', \`progress\` float NOT NULL DEFAULT '0', \`status\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NULL, \`book_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rate_history\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rating\` decimal(2,1) NOT NULL, \`comment\` text NULL, \`status\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`rate_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rates\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`premium_plans\` (\`id\` int NOT NULL AUTO_INCREMENT, \`recorrence\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`price_label\` varchar(255) NOT NULL, \`price\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`premium_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`premium\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` tinyint NOT NULL DEFAULT 1, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`benefits\` text NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`registration_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`failure_reason\` varchar(255) NULL, \`ip_address\` varchar(255) NOT NULL, \`user_agent\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_79cc8e4d772034741bb3377333\` (\`created_at\`), INDEX \`IDX_14a21c729a67644d6284f9a3a8\` (\`ip_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`logins_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL, \`login_at\` timestamp NOT NULL, \`ip_address\` varchar(255) NULL, \`user_agent\` text NULL, \`success\` enum ('success', 'failed') NOT NULL DEFAULT 'success', \`login_type\` enum ('email_password', 'biometric', 'social', 'refresh_token') NOT NULL DEFAULT 'email_password', \`failure_reason\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_f602f9fa7ba5f1a288b9631d33\` (\`success\`), INDEX \`IDX_ac749b5255a870415eb4d43039\` (\`ip_address\`), INDEX \`IDX_a20774717b3fe15fc4a20aec36\` (\`login_at\`), INDEX \`IDX_3f28f57c3f0f8ef12dbd8b0fd9\` (\`user_id\`, \`login_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`bookcases\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`book_id\` int NOT NULL, \`audiobook_id\` int NULL, \`status\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`banner_providers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`banner_id\` int NOT NULL, \`provider_id\` int NOT NULL, \`provider_name\` varchar(255) NULL DEFAULT 'provedor -', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`banners\` (\`id\` int NOT NULL AUTO_INCREMENT, \`banner\` varchar(255) NOT NULL, \`premium\` tinyint NOT NULL DEFAULT 0, \`action_internal\` varchar(255) NULL, \`action_external\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD CONSTRAINT \`FK_9e432b7df0d182f8d292902d1a2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`books_sheets\` ADD CONSTRAINT \`FK_5139deff6403868f55adc51723b\` FOREIGN KEY (\`books_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`books_tracks\` ADD CONSTRAINT \`FK_43a6f0c72f6eb0a910e6a3babc2\` FOREIGN KEY (\`media_id\`) REFERENCES \`books_media\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`books_media\` ADD CONSTRAINT \`FK_cda162d88534fe29f5b853a1f80\` FOREIGN KEY (\`books_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD CONSTRAINT \`FK_46f5b35b90175a660f99810bc97\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`readings\` ADD CONSTRAINT \`FK_0e3a7a8ef0c7f9ad758f4bc0e94\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`readings\` ADD CONSTRAINT \`FK_7fb6640d22c7483fa51cc39269a\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rate_history\` ADD CONSTRAINT \`FK_f80fe41c2ba50d0892f6f105d58\` FOREIGN KEY (\`rate_id\`) REFERENCES \`rates\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rates\` ADD CONSTRAINT \`FK_89adf0a54b6daa47d96cb435878\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` ADD CONSTRAINT \`FK_fa849f55646319a5efedb47e0bc\` FOREIGN KEY (\`premium_id\`) REFERENCES \`premium\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`logins_logs\` ADD CONSTRAINT \`FK_fa1f3df64373c21df440b1141b4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookcases\` ADD CONSTRAINT \`FK_c00b2021d7f1421345471169292\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookcases\` ADD CONSTRAINT \`FK_91ea58383c568b418ce8264f8c7\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`banner_providers\` ADD CONSTRAINT \`FK_d8cea7efda72270b699707c02db\` FOREIGN KEY (\`banner_id\`) REFERENCES \`banners\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`banner_providers\` DROP FOREIGN KEY \`FK_d8cea7efda72270b699707c02db\``);
        await queryRunner.query(`ALTER TABLE \`bookcases\` DROP FOREIGN KEY \`FK_91ea58383c568b418ce8264f8c7\``);
        await queryRunner.query(`ALTER TABLE \`bookcases\` DROP FOREIGN KEY \`FK_c00b2021d7f1421345471169292\``);
        await queryRunner.query(`ALTER TABLE \`logins_logs\` DROP FOREIGN KEY \`FK_fa1f3df64373c21df440b1141b4\``);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` DROP FOREIGN KEY \`FK_fa849f55646319a5efedb47e0bc\``);
        await queryRunner.query(`ALTER TABLE \`rates\` DROP FOREIGN KEY \`FK_89adf0a54b6daa47d96cb435878\``);
        await queryRunner.query(`ALTER TABLE \`rate_history\` DROP FOREIGN KEY \`FK_f80fe41c2ba50d0892f6f105d58\``);
        await queryRunner.query(`ALTER TABLE \`readings\` DROP FOREIGN KEY \`FK_7fb6640d22c7483fa51cc39269a\``);
        await queryRunner.query(`ALTER TABLE \`readings\` DROP FOREIGN KEY \`FK_0e3a7a8ef0c7f9ad758f4bc0e94\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP FOREIGN KEY \`FK_46f5b35b90175a660f99810bc97\``);
        await queryRunner.query(`ALTER TABLE \`books_media\` DROP FOREIGN KEY \`FK_cda162d88534fe29f5b853a1f80\``);
        await queryRunner.query(`ALTER TABLE \`books_tracks\` DROP FOREIGN KEY \`FK_43a6f0c72f6eb0a910e6a3babc2\``);
        await queryRunner.query(`ALTER TABLE \`books_sheets\` DROP FOREIGN KEY \`FK_5139deff6403868f55adc51723b\``);
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP FOREIGN KEY \`FK_9e432b7df0d182f8d292902d1a2\``);
        await queryRunner.query(`DROP TABLE \`banners\``);
        await queryRunner.query(`DROP TABLE \`banner_providers\``);
        await queryRunner.query(`DROP TABLE \`bookcases\``);
        await queryRunner.query(`DROP INDEX \`IDX_3f28f57c3f0f8ef12dbd8b0fd9\` ON \`logins_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_a20774717b3fe15fc4a20aec36\` ON \`logins_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_ac749b5255a870415eb4d43039\` ON \`logins_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_f602f9fa7ba5f1a288b9631d33\` ON \`logins_logs\``);
        await queryRunner.query(`DROP TABLE \`logins_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_14a21c729a67644d6284f9a3a8\` ON \`registration_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_79cc8e4d772034741bb3377333\` ON \`registration_logs\``);
        await queryRunner.query(`DROP TABLE \`registration_logs\``);
        await queryRunner.query(`DROP TABLE \`premium\``);
        await queryRunner.query(`DROP TABLE \`premium_plans\``);
        await queryRunner.query(`DROP TABLE \`rates\``);
        await queryRunner.query(`DROP TABLE \`rate_history\``);
        await queryRunner.query(`DROP TABLE \`readings\``);
        await queryRunner.query(`DROP TABLE \`books\``);
        await queryRunner.query(`DROP INDEX \`REL_cda162d88534fe29f5b853a1f8\` ON \`books_media\``);
        await queryRunner.query(`DROP TABLE \`books_media\``);
        await queryRunner.query(`DROP TABLE \`books_tracks\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
        await queryRunner.query(`DROP INDEX \`REL_5139deff6403868f55adc51723\` ON \`books_sheets\``);
        await queryRunner.query(`DROP TABLE \`books_sheets\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`REL_9e432b7df0d182f8d292902d1a\` ON \`profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_30d20cfa6967ffa3e3a9c55469\` ON \`profiles\``);
        await queryRunner.query(`DROP TABLE \`profiles\``);
    }

}
