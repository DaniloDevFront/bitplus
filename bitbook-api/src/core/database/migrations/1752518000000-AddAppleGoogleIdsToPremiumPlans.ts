import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppleGoogleIdsToPremiumPlans1752518000000 implements MigrationInterface {
  name = 'AddAppleGoogleIdsToPremiumPlans1752518000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona a coluna id_apple
    await queryRunner.query(`ALTER TABLE premium_plans ADD COLUMN id_apple VARCHAR(255) NULL`);

    // Adiciona a coluna id_google
    await queryRunner.query(`ALTER TABLE premium_plans ADD COLUMN id_google VARCHAR(255) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove a coluna id_google
    await queryRunner.query(`ALTER TABLE premium_plans DROP COLUMN id_google`);

    // Remove a coluna id_apple
    await queryRunner.query(`ALTER TABLE premium_plans DROP COLUMN id_apple`);
  }
} 