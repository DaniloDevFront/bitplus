import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePremiumTable1751814000000 implements MigrationInterface {
  name = 'CreatePremiumTable1751814000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`premium\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`status\` tinyint NOT NULL DEFAULT 1,
                \`title\` varchar(255) NOT NULL,
                \`description\` text NOT NULL,
                \`benefits\` text NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`premium\``);
  }
} 