import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNovaTabela1751752528716 implements MigrationInterface {
    name = 'CreateNovaTabela1751752528716'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`signatures_plans\` (\`id\` int NOT NULL AUTO_INCREMENT, \`recorrence\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`price_label\` varchar(255) NOT NULL, \`price\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`signatures\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` tinyint NOT NULL DEFAULT 1, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`benefits\` text NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`plan_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`signatures\` ADD CONSTRAINT \`FK_6de44d342b85abb3e73036d979c\` FOREIGN KEY (\`plan_id\`) REFERENCES \`signatures_plans\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`signatures\` DROP FOREIGN KEY \`FK_6de44d342b85abb3e73036d979c\``);
        await queryRunner.query(`DROP TABLE \`signatures\``);
        await queryRunner.query(`DROP TABLE \`signatures_plans\``);
    }

}
