import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSuccessToRegistrationLogs1752516554492 implements MigrationInterface {
    name = 'AddSuccessToRegistrationLogs1752516554492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primeiro, altera o campo ip_address para permitir NULL
        await queryRunner.query(`ALTER TABLE \`registration_logs\` MODIFY \`ip_address\` varchar(255) NULL`);
        
        // Adiciona o campo success
        await queryRunner.query(`ALTER TABLE \`registration_logs\` ADD \`success\` enum ('success', 'failed') NOT NULL DEFAULT 'success'`);
        
        // Adiciona índice para o campo success
        await queryRunner.query(`CREATE INDEX \`IDX_registration_logs_success\` ON \`registration_logs\` (\`success\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove o índice
        await queryRunner.query(`DROP INDEX \`IDX_registration_logs_success\` ON \`registration_logs\``);
        
        // Remove o campo success
        await queryRunner.query(`ALTER TABLE \`registration_logs\` DROP COLUMN \`success\``);
        
        // Reverte o campo ip_address para NOT NULL (se necessário)
        await queryRunner.query(`ALTER TABLE \`registration_logs\` MODIFY \`ip_address\` varchar(255) NOT NULL`);
    }
} 