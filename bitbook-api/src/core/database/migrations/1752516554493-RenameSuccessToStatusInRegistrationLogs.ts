import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameSuccessToStatusInRegistrationLogs1752516554493 implements MigrationInterface {
  name = 'RenameSuccessToStatusInRegistrationLogs1752516554493'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Renomeia a coluna success para status
    await queryRunner.query(`ALTER TABLE \`registration_logs\` CHANGE \`success\` \`status\` enum ('success', 'failed') NOT NULL DEFAULT 'success'`);

    // Remove o índice antigo
    await queryRunner.query(`DROP INDEX \`IDX_registration_logs_success\` ON \`registration_logs\``);

    // Adiciona o novo índice para status
    await queryRunner.query(`CREATE INDEX \`IDX_registration_logs_status\` ON \`registration_logs\` (\`status\`)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove o índice novo
    await queryRunner.query(`DROP INDEX \`IDX_registration_logs_status\` ON \`registration_logs\``);

    // Renomeia a coluna status de volta para success
    await queryRunner.query(`ALTER TABLE \`registration_logs\` CHANGE \`status\` \`success\` enum ('success', 'failed') NOT NULL DEFAULT 'success'`);

    // Adiciona o índice antigo
    await queryRunner.query(`CREATE INDEX \`IDX_registration_logs_success\` ON \`registration_logs\` (\`success\`)`);
  }
} 