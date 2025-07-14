import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1700000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Criar tabela users (base para outras tabelas)
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`email\` varchar(255) NOT NULL UNIQUE,
                \`password\` varchar(255) NOT NULL,
                \`premium\` tinyint NOT NULL DEFAULT 0,
                \`role\` enum('client', 'admin') NOT NULL DEFAULT 'client',
                \`terms\` tinyint NOT NULL DEFAULT 0,
                \`biometricSecretHash\` varchar(255) NULL,
                \`isBiometricEnabled\` tinyint NOT NULL DEFAULT 0,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 2. Criar tabela profiles
        await queryRunner.query(`
            CREATE TABLE \`profiles\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`phone\` varchar(255) NULL,
                \`cpf\` varchar(255) NULL UNIQUE,
                \`birth_date\` date NULL,
                \`avatar\` varchar(255) NULL,
                \`cover\` varchar(255) NULL DEFAULT 'https://bitplus.s3.sa-east-1.amazonaws.com/default/cover-profile.png',
                \`provider_id\` int NULL,
                \`user_id\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_profiles_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // 3. Criar tabela providers
        await queryRunner.query(`
            CREATE TABLE \`providers\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`image\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 4. Criar tabela categories
        await queryRunner.query(`
            CREATE TABLE \`categories\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`ico\` varchar(255) NOT NULL,
                \`premium\` tinyint NOT NULL DEFAULT 0,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 5. Criar tabela books
        await queryRunner.query(`
            CREATE TABLE \`books\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`title\` varchar(255) NOT NULL,
                \`premium\` tinyint NOT NULL DEFAULT 0,
                \`high\` tinyint NOT NULL DEFAULT 0,
                \`type\` enum('ebook', 'audiobook') NOT NULL DEFAULT 'ebook',
                \`description\` text NULL,
                \`category_id\` int NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_books_categories\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // 6. Criar tabela books_sheets
        await queryRunner.query(`
            CREATE TABLE \`books_sheets\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`author\` varchar(255) NOT NULL,
                \`genre\` varchar(255) NOT NULL,
                \`year\` int NOT NULL,
                \`ref\` varchar(255) NOT NULL,
                \`books_id\` int NULL,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_books_sheets_books\` FOREIGN KEY (\`books_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // 7. Criar tabela books_media
        await queryRunner.query(`
            CREATE TABLE \`books_media\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`file_url\` varchar(255) NULL,
                \`img_small\` varchar(255) NULL,
                \`img_medium\` varchar(255) NULL,
                \`img_large\` varchar(255) NULL,
                \`books_id\` int NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_books_media_books\` FOREIGN KEY (\`books_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // 8. Criar tabela books_tracks
        await queryRunner.query(`
            CREATE TABLE \`books_tracks\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`title\` varchar(255) NOT NULL,
                \`audio_url\` varchar(255) NOT NULL,
                \`duration\` varchar(255) NOT NULL DEFAULT '00:00:00',
                \`order\` int NOT NULL DEFAULT '0',
                \`description\` text NULL,
                \`cover_small\` text NULL,
                \`cover_medium\` text NULL,
                \`cover_large\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`media_id\` int NULL,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_books_tracks_books_media\` FOREIGN KEY (\`media_id\`) REFERENCES \`books_media\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // 9. Criar tabela banners
        await queryRunner.query(`
            CREATE TABLE \`banners\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`banner\` varchar(255) NOT NULL,
                \`premium\` tinyint NOT NULL DEFAULT 0,
                \`action_internal\` varchar(255) NULL,
                \`action_external\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 10. Criar tabela banner_providers
        await queryRunner.query(`
            CREATE TABLE \`banner_providers\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`banner_id\` int NOT NULL,
                \`provider_id\` int NOT NULL,
                \`provider_name\` varchar(255) NULL DEFAULT 'provedor -',
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_banner_providers_banners\` FOREIGN KEY (\`banner_id\`) REFERENCES \`banners\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_banner_providers_providers\` FOREIGN KEY (\`provider_id\`) REFERENCES \`providers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // 13. Criar tabela bookcases
        await queryRunner.query(`
            CREATE TABLE \`bookcases\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`book_id\` int NOT NULL,
                \`audiobook_id\` int NULL,
                \`status\` tinyint NOT NULL DEFAULT 1,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_bookcases_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_bookcases_books\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // 14. Criar tabela readings
        await queryRunner.query(`
            CREATE TABLE \`readings\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`current_page\` int NOT NULL DEFAULT 0,
                \`progress\` float NOT NULL DEFAULT 0,
                \`status\` tinyint NOT NULL DEFAULT 1,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`user_id\` int NULL,
                \`book_id\` int NULL,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_readings_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_readings_books\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // 15. Criar tabela rates
        await queryRunner.query(`
            CREATE TABLE \`rates\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`user_id\` int NULL,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_rates_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // 16. Criar tabela rate_history
        await queryRunner.query(`
            CREATE TABLE \`rate_history\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`rating\` decimal(2,1) NOT NULL,
                \`comment\` text NULL,
                \`status\` tinyint NOT NULL DEFAULT 1,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`rate_id\` int NULL,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_rate_history_rates\` FOREIGN KEY (\`rate_id\`) REFERENCES \`rates\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // 17. Criar tabela logins_logs
        // await queryRunner.query(`
        //     CREATE TABLE \`logins_logs\` (
        //         \`id\` int NOT NULL AUTO_INCREMENT,
        //         \`user_id\` int NOT NULL,
        //         \`login_at\` timestamp NOT NULL,
        //         \`ip_address\` varchar(255) NULL,
        //         \`user_agent\` text NULL,
        //         \`success\` enum('success', 'failed') NOT NULL DEFAULT 'success',
        //         \`login_type\` enum('email_password', 'biometric', 'social', 'refresh_token') NOT NULL DEFAULT 'email_password',
        //         \`failure_reason\` varchar(255) NULL,
        //         \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        //         INDEX \`IDX_logins_logs_user_id_login_at\` (\`user_id\`, \`login_at\`),
        //         INDEX \`IDX_logins_logs_login_at\` (\`login_at\`),
        //         INDEX \`IDX_logins_logs_ip_address\` (\`ip_address\`),
        //         INDEX \`IDX_logins_logs_success\` (\`success\`),
        //         PRIMARY KEY (\`id\`),
        //         CONSTRAINT \`FK_logins_logs_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        //     ) ENGINE=InnoDB
        // `);

        // 18. Criar tabela registration_logs
        // await queryRunner.query(`
        //     CREATE TABLE \`registration_logs\` (
        //         \`id\` int NOT NULL AUTO_INCREMENT,
        //         \`email\` varchar(255) NOT NULL,
        //         \`user_id\` int NULL,
        //         \`success\` tinyint NOT NULL,
        //         \`failure_reason\` varchar(255) NULL,
        //         \`ip_address\` varchar(255) NOT NULL,
        //         \`user_agent\` text NULL,
        //         \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        //         INDEX \`IDX_registration_logs_ip_address\` (\`ip_address\`),
        //         INDEX \`IDX_registration_logs_created_at\` (\`created_at\`),
        //         PRIMARY KEY (\`id\`)
        //     ) ENGINE=InnoDB
        // `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover tabelas na ordem inversa (respeitando foreign keys)
        await queryRunner.query(`DROP TABLE \`registration_logs\``);
        await queryRunner.query(`DROP TABLE \`logins_logs\``);
        await queryRunner.query(`DROP TABLE \`rate_history\``);
        await queryRunner.query(`DROP TABLE \`rates\``);
        await queryRunner.query(`DROP TABLE \`readings\``);
        await queryRunner.query(`DROP TABLE \`bookcases\``);
        await queryRunner.query(`DROP TABLE \`banner_providers\``);
        await queryRunner.query(`DROP TABLE \`banners\``);
        await queryRunner.query(`DROP TABLE \`books_tracks\``);
        await queryRunner.query(`DROP TABLE \`books_media\``);
        await queryRunner.query(`DROP TABLE \`books_sheets\``);
        await queryRunner.query(`DROP TABLE \`books\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
        await queryRunner.query(`DROP TABLE \`providers\``);
        await queryRunner.query(`DROP TABLE \`profiles\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
