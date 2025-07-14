import { MigrationInterface, QueryRunner } from "typeorm";

export class FixLoginsLogsUserId1751896508824 implements MigrationInterface {
    name = 'FixLoginsLogsUserId1751896508824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP FOREIGN KEY \`FK_profiles_users\``);
        await queryRunner.query(`ALTER TABLE \`books_sheets\` DROP FOREIGN KEY \`FK_books_sheets_books\``);
        await queryRunner.query(`ALTER TABLE \`books_media\` DROP FOREIGN KEY \`FK_books_media_books\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP FOREIGN KEY \`FK_books_categories\``);
        await queryRunner.query(`ALTER TABLE \`readings\` DROP FOREIGN KEY \`FK_readings_books\``);
        await queryRunner.query(`ALTER TABLE \`readings\` DROP FOREIGN KEY \`FK_readings_users\``);
        await queryRunner.query(`ALTER TABLE \`rate_history\` DROP FOREIGN KEY \`FK_rate_history_rates\``);
        await queryRunner.query(`ALTER TABLE \`rates\` DROP FOREIGN KEY \`FK_rates_users\``);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` DROP FOREIGN KEY \`FK_premium_plans_premium\``);
        await queryRunner.query(`ALTER TABLE \`bookcases\` DROP FOREIGN KEY \`FK_bookcases_books\``);
        await queryRunner.query(`ALTER TABLE \`bookcases\` DROP FOREIGN KEY \`FK_bookcases_users\``);
        await queryRunner.query(`ALTER TABLE \`banner_providers\` DROP FOREIGN KEY \`FK_banner_providers_banners\``);
        await queryRunner.query(`ALTER TABLE \`banner_providers\` DROP FOREIGN KEY \`FK_banner_providers_providers\``);
        await queryRunner.query(`DROP INDEX \`cpf\` ON \`profiles\``);
        await queryRunner.query(`DROP INDEX \`email\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_premium_plans_premium_id\` ON \`premium_plans\``);
        // Tabela books_tracks já será criada na migration inicial, não precisa criar aqui
        await queryRunner.query(`ALTER TABLE \`registration_logs\` DROP COLUMN \`success\``);
        await queryRunner.query(`ALTER TABLE \`registration_logs\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD UNIQUE INDEX \`IDX_30d20cfa6967ffa3e3a9c55469\` (\`cpf\`)`);
        await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`user_id\` \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD UNIQUE INDEX \`IDX_9e432b7df0d182f8d292902d1a\` (\`user_id\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`role\` varchar(255) NOT NULL DEFAULT 'client'`);
        await queryRunner.query(`ALTER TABLE \`books_sheets\` ADD UNIQUE INDEX \`IDX_5139deff6403868f55adc51723\` (\`books_id\`)`);
        await queryRunner.query(`ALTER TABLE \`books_media\` ADD UNIQUE INDEX \`IDX_cda162d88534fe29f5b853a1f8\` (\`books_id\`)`);
        await queryRunner.query(`ALTER TABLE \`rates\` CHANGE \`user_id\` \`user_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` ADD \`description\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` CHANGE \`premium_id\` \`premium_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`premium\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`premium\` ADD \`description\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`premium\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`logins_logs\` DROP FOREIGN KEY \`FK_fa1f3df64373c21df440b1141b4\``);
        await queryRunner.query(`DROP INDEX \`IDX_3f28f57c3f0f8ef12dbd8b0fd9\` ON \`logins_logs\``);
        await queryRunner.query(`ALTER TABLE \`logins_logs\` CHANGE \`user_id\` \`user_id\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_9e432b7df0d182f8d292902d1a\` ON \`profiles\` (\`user_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_5139deff6403868f55adc51723\` ON \`books_sheets\` (\`books_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_cda162d88534fe29f5b853a1f8\` ON \`books_media\` (\`books_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_79cc8e4d772034741bb3377333\` ON \`registration_logs\` (\`created_at\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_14a21c729a67644d6284f9a3a8\` ON \`registration_logs\` (\`ip_address\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_3f28f57c3f0f8ef12dbd8b0fd9\` ON \`logins_logs\` (\`user_id\`, \`login_at\`)`);
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD CONSTRAINT \`FK_9e432b7df0d182f8d292902d1a2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`books_sheets\` ADD CONSTRAINT \`FK_5139deff6403868f55adc51723b\` FOREIGN KEY (\`books_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        // Foreign key books_tracks não precisa ser recriada aqui pois será criada na migration inicial
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
        // Foreign key books_tracks não precisa ser removida aqui pois será criada na migration inicial
        await queryRunner.query(`ALTER TABLE \`books_sheets\` DROP FOREIGN KEY \`FK_5139deff6403868f55adc51723b\``);
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP FOREIGN KEY \`FK_9e432b7df0d182f8d292902d1a2\``);
        await queryRunner.query(`DROP INDEX \`IDX_3f28f57c3f0f8ef12dbd8b0fd9\` ON \`logins_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_14a21c729a67644d6284f9a3a8\` ON \`registration_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_79cc8e4d772034741bb3377333\` ON \`registration_logs\``);
        await queryRunner.query(`DROP INDEX \`REL_cda162d88534fe29f5b853a1f8\` ON \`books_media\``);
        await queryRunner.query(`DROP INDEX \`REL_5139deff6403868f55adc51723\` ON \`books_sheets\``);
        await queryRunner.query(`DROP INDEX \`REL_9e432b7df0d182f8d292902d1a\` ON \`profiles\``);
        await queryRunner.query(`ALTER TABLE \`logins_logs\` CHANGE \`user_id\` \`user_id\` int NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_3f28f57c3f0f8ef12dbd8b0fd9\` ON \`logins_logs\` (\`user_id\`, \`login_at\`)`);
        await queryRunner.query(`ALTER TABLE \`logins_logs\` ADD CONSTRAINT \`FK_fa1f3df64373c21df440b1141b4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`premium\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`premium\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`premium\` ADD \`description\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` CHANGE \`premium_id\` \`premium_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` ADD \`description\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rates\` CHANGE \`user_id\` \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`books_media\` DROP INDEX \`IDX_cda162d88534fe29f5b853a1f8\``);
        await queryRunner.query(`ALTER TABLE \`books_sheets\` DROP INDEX \`IDX_5139deff6403868f55adc51723\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`role\` enum ('client', 'admin') NOT NULL DEFAULT 'client'`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``);
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP INDEX \`IDX_9e432b7df0d182f8d292902d1a\``);
        await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`user_id\` \`user_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP INDEX \`IDX_30d20cfa6967ffa3e3a9c55469\``);
        await queryRunner.query(`ALTER TABLE \`registration_logs\` ADD \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`registration_logs\` ADD \`success\` tinyint NOT NULL`);
        // Tabela books_tracks não precisa ser removida aqui pois será gerenciada pela migration inicial
        await queryRunner.query(`CREATE INDEX \`IDX_premium_plans_premium_id\` ON \`premium_plans\` (\`premium_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`email\` ON \`users\` (\`email\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`cpf\` ON \`profiles\` (\`cpf\`)`);
        await queryRunner.query(`ALTER TABLE \`banner_providers\` ADD CONSTRAINT \`FK_banner_providers_providers\` FOREIGN KEY (\`provider_id\`) REFERENCES \`providers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`banner_providers\` ADD CONSTRAINT \`FK_banner_providers_banners\` FOREIGN KEY (\`banner_id\`) REFERENCES \`banners\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookcases\` ADD CONSTRAINT \`FK_bookcases_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookcases\` ADD CONSTRAINT \`FK_bookcases_books\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`premium_plans\` ADD CONSTRAINT \`FK_premium_plans_premium\` FOREIGN KEY (\`premium_id\`) REFERENCES \`premium\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rates\` ADD CONSTRAINT \`FK_rates_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rate_history\` ADD CONSTRAINT \`FK_rate_history_rates\` FOREIGN KEY (\`rate_id\`) REFERENCES \`rates\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`readings\` ADD CONSTRAINT \`FK_readings_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`readings\` ADD CONSTRAINT \`FK_readings_books\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD CONSTRAINT \`FK_books_categories\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`books_media\` ADD CONSTRAINT \`FK_books_media_books\` FOREIGN KEY (\`books_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`books_sheets\` ADD CONSTRAINT \`FK_books_sheets_books\` FOREIGN KEY (\`books_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD CONSTRAINT \`FK_profiles_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
