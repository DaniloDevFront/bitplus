import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionIdToUsers1752518000003 implements MigrationInterface {
  name = 'AddSubscriptionIdToUsers1752518000003'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona a coluna subscription_id do tipo varchar com valor padrão null
    await queryRunner.query(`ALTER TABLE users ADD COLUMN subscription_id VARCHAR(255) DEFAULT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove a coluna subscription_id
    await queryRunner.query(`ALTER TABLE users DROP COLUMN subscription_id`);
  }
} 