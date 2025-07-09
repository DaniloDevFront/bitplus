import { MigrationInterface, QueryRunner } from "typeorm";

export class DropTableProviders1752076994979 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS providers`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Se quiser, pode recriar a tabela aqui
    }

}
