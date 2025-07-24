import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProfileCoverDefault1752516554493 implements MigrationInterface {
  name = 'UpdateProfileCoverDefault1752516554493'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`profiles\` ALTER COLUMN \`cover\` SET DEFAULT 'https://bitplus.s3.sa-east-1.amazonaws.com/default/cover-default.png'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`profiles\` ALTER COLUMN \`cover\` SET DEFAULT 'https://bitplus.s3.sa-east-1.amazonaws.com/default/cover-profile.png'`);
  }
} 