import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAgentToRegistrationLogs1750250000000 implements MigrationInterface {
  name = 'AddUserAgentToRegistrationLogs1750250000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`registration_logs\` ADD \`user_agent\` text NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`registration_logs\` DROP COLUMN \`user_agent\``);
  }
} 