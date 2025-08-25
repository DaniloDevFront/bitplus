import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1756129913834 implements MigrationInterface {
    name = 'Test1756129913834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`readings\` ADD \`reading_time\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`readings\` DROP COLUMN \`reading_time\``);
    }

}
