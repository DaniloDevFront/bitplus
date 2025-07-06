import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePremiumPlansTable1751814050000 implements MigrationInterface {
  name = 'CreatePremiumPlansTable1751814050000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`premium_plans\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`recorrence\` varchar(255) NOT NULL,
                \`description\` text NOT NULL,
                \`price_label\` varchar(255) NOT NULL,
                \`price\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`premium_plans\``);
  }
} 