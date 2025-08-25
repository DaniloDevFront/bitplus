import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateErrorsLogsTable1752516554494 implements MigrationInterface {
  name = 'CreateErrorsLogsTable1752516554494'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`errors_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`error_message\` text NOT NULL, \`error_stack\` text NULL, \`origin\` varchar(255) NULL, \`error_type\` varchar(255) NULL, \`ip_address\` varchar(255) NULL, \`user_agent\` text NULL, \`user_id\` int NULL, \`request_data\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_errors_logs_created_at\` (\`created_at\`), INDEX \`IDX_errors_logs_origin\` (\`origin\`), INDEX \`IDX_errors_logs_error_type\` (\`error_type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_errors_logs_error_type\` ON \`errors_logs\``);
    await queryRunner.query(`DROP INDEX \`IDX_errors_logs_origin\` ON \`errors_logs\``);
    await queryRunner.query(`DROP INDEX \`IDX_errors_logs_created_at\` ON \`errors_logs\``);
    await queryRunner.query(`DROP TABLE \`errors_logs\``);
  }
} 