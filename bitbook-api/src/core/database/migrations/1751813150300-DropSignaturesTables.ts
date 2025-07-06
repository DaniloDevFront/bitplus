import { MigrationInterface, QueryRunner } from "typeorm";

export class DropSignaturesTables1751813150300 implements MigrationInterface {
  name = 'DropSignaturesTables1751813150300'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`signatures\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`signatures_plans\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Criação reversa das tabelas não implementada por falta de definição do schema original
  }
} 