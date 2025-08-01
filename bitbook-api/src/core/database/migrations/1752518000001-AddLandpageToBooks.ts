import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLandpageToBooks1752518000001 implements MigrationInterface {
  name = 'AddLandpageToBooks1752518000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona a coluna landpage do tipo boolean com valor padrão false
    await queryRunner.query(`ALTER TABLE books ADD COLUMN landpage BOOLEAN NOT NULL DEFAULT false`);

    // Atualiza todos os registros existentes para ter landpage = false
    await queryRunner.query(`UPDATE books SET landpage = false WHERE landpage IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove a coluna landpage
    await queryRunner.query(`ALTER TABLE books DROP COLUMN landpage`);
  }
} 