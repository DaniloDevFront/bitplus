import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionLoginToUsers1752518000004 implements MigrationInterface {
  name = 'AddSubscriptionLoginToUsers1752518000004'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona a coluna subscription_login do tipo varchar com valor padrão null
    await queryRunner.query(`ALTER TABLE users ADD COLUMN subscription_login VARCHAR(255) DEFAULT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove a coluna subscription_login
    await queryRunner.query(`ALTER TABLE users DROP COLUMN subscription_login`);
  }
} 