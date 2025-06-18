import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorTableLogs1750242330985 implements MigrationInterface {
    name = 'RefactorTableLogs1750242330985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`logins_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`login_at\` timestamp NOT NULL, \`ip_address\` varchar(255) NULL, \`user_agent\` text NULL, \`success\` enum ('success', 'failed') NOT NULL DEFAULT 'success', \`login_type\` enum ('email_password', 'biometric', 'social', 'refresh_token') NOT NULL DEFAULT 'email_password', \`failure_reason\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_f602f9fa7ba5f1a288b9631d33\` (\`success\`), INDEX \`IDX_ac749b5255a870415eb4d43039\` (\`ip_address\`), INDEX \`IDX_a20774717b3fe15fc4a20aec36\` (\`login_at\`), INDEX \`IDX_3f28f57c3f0f8ef12dbd8b0fd9\` (\`user_id\`, \`login_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`registration_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`user_id\` int NULL, \`success\` tinyint NOT NULL, \`failure_reason\` varchar(255) NULL, \`ip_address\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`logins_logs\` ADD CONSTRAINT \`FK_fa1f3df64373c21df440b1141b4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`logins_logs\` DROP FOREIGN KEY \`FK_fa1f3df64373c21df440b1141b4\``);
        await queryRunner.query(`DROP TABLE \`registration_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_3f28f57c3f0f8ef12dbd8b0fd9\` ON \`logins_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_a20774717b3fe15fc4a20aec36\` ON \`logins_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_ac749b5255a870415eb4d43039\` ON \`logins_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_f602f9fa7ba5f1a288b9631d33\` ON \`logins_logs\``);
        await queryRunner.query(`DROP TABLE \`logins_logs\``);
    }

}
