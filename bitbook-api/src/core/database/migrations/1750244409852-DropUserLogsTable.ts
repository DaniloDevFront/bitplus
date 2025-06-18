import { MigrationInterface, QueryRunner } from "typeorm";

export class DropUserLogsTable1750244409852 implements MigrationInterface {
    name = 'DropUserLogsTable1750244409852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`user_logs\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`login_at\` timestamp NOT NULL, \`ip_address\` varchar(255) NULL, \`user_agent\` text NULL, \`success\` enum ('success', 'failed') NOT NULL DEFAULT 'success', \`login_type\` enum ('email_password', 'biometric', 'social', 'refresh_token') NOT NULL DEFAULT 'email_password', \`failure_reason\` varchar(255) NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX \`IDX_UserLogs_UserId_LoginAt\` (\`user_id\`, \`login_at\`), INDEX \`IDX_UserLogs_LoginAt\` (\`login_at\`), INDEX \`IDX_UserLogs_IpAddress\` (\`ip_address\`), INDEX \`IDX_UserLogs_Success\` (\`success\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_logs\` ADD CONSTRAINT \`FK_UserLogs_Users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }
}
