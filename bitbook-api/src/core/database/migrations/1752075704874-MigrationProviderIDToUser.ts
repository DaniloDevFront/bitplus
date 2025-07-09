import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationProviderIDToUser1752075704874 implements MigrationInterface {
    name = 'MigrationProviderIDToUser1752075704874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_9e432b7df0d182f8d292902d1a\` ON \`profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_5139deff6403868f55adc51723\` ON \`books_sheets\``);
        await queryRunner.query(`DROP INDEX \`IDX_cda162d88534fe29f5b853a1f8\` ON \`books_media\``);
        await queryRunner.query(`DROP INDEX \`FK_banner_providers_providers\` ON \`banner_providers\``);
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP COLUMN \`provider_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`provider_id\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`provider_id\``);
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD \`provider_id\` int NULL`);
        await queryRunner.query(`CREATE INDEX \`FK_banner_providers_providers\` ON \`banner_providers\` (\`provider_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_cda162d88534fe29f5b853a1f8\` ON \`books_media\` (\`books_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_5139deff6403868f55adc51723\` ON \`books_sheets\` (\`books_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_9e432b7df0d182f8d292902d1a\` ON \`profiles\` (\`user_id\`)`);
    }

}
