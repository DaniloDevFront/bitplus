import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAmbosToContentType1752516554492 implements MigrationInterface {
  name = 'AddAmbosToContentType1752516554492'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar o novo valor 'ambos' ao enum da coluna type
    await queryRunner.query(`ALTER TABLE \`books\` MODIFY COLUMN \`type\` enum('ebook', 'audiobook', 'ambos') NOT NULL DEFAULT 'ebook'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover o valor 'ambos' do enum da coluna type
    await queryRunner.query(`ALTER TABLE \`books\` MODIFY COLUMN \`type\` enum('ebook', 'audiobook') NOT NULL DEFAULT 'ebook'`);
  }
} 