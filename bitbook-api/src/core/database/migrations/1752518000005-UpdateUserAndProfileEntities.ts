import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAndProfileEntities1752518000005 implements MigrationInterface {
  name = 'UpdateUserAndProfileEntities1752518000005'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Atualiza a coluna email na tabela users para permitir NULL (mantendo unique)
    await queryRunner.query(`ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL`);

    // Atualiza a coluna password na tabela users para permitir NULL
    await queryRunner.query(`ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL`);

    // Atualiza a coluna name na tabela profiles para permitir NULL
    await queryRunner.query(`ALTER TABLE profiles MODIFY COLUMN name VARCHAR(255) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverte a coluna email para NOT NULL
    await queryRunner.query(`ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NOT NULL`);

    // Reverte a coluna password para NOT NULL
    await queryRunner.query(`ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NOT NULL`);

    // Reverte a coluna name para NOT NULL
    await queryRunner.query(`ALTER TABLE profiles MODIFY COLUMN name VARCHAR(255) NOT NULL`);
  }
} 