import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLegacyFieldToUsers1752516554495 implements MigrationInterface {
  name = 'AddLegacyFieldToUsers1752516554495'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona a coluna legacy com valor padrão false
    await queryRunner.query(`ALTER TABLE users ADD COLUMN legacy BOOLEAN DEFAULT false`);

    // Marca todos os usuários existentes como legacy
    // Isso garante que usuários vindos do Laravel usem a validação legacy
    await queryRunner.query(`UPDATE users SET legacy = true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove a coluna legacy
    await queryRunner.query(`ALTER TABLE users DROP COLUMN legacy`);
  }
} 