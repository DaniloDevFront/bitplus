import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalPagesToReadings1752518000002 implements MigrationInterface {
  name = 'AddTotalPagesToReadings1752518000002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona a coluna total_pages do tipo int com valor padrão 0
    await queryRunner.query(`ALTER TABLE readings ADD COLUMN total_pages INT NOT NULL DEFAULT 0`);

    // Atualiza todos os registros existentes para ter total_pages = 0
    await queryRunner.query(`UPDATE readings SET total_pages = 0 WHERE total_pages IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove a coluna total_pages
    await queryRunner.query(`ALTER TABLE readings DROP COLUMN total_pages`);
  }
} 