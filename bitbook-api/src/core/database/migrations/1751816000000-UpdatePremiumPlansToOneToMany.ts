import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePremiumPlansToOneToMany1751816000000 implements MigrationInterface {
  name = 'UpdatePremiumPlansToOneToMany1751816000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Dropar a tabela de relacionamento many-to-many
    await queryRunner.query(`DROP TABLE IF EXISTS \`premium_plan_relations\``);

    // Adicionar coluna premium_id na tabela premium_plans
    await queryRunner.query(`ALTER TABLE \`premium_plans\` ADD COLUMN \`premium_id\` int NOT NULL`);

    // Adicionar foreign key
    await queryRunner.query(`ALTER TABLE \`premium_plans\` ADD CONSTRAINT \`FK_premium_plans_premium\` FOREIGN KEY (\`premium_id\`) REFERENCES \`premium\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);

    // Criar índice para melhor performance
    await queryRunner.query(`CREATE INDEX \`IDX_premium_plans_premium_id\` ON \`premium_plans\` (\`premium_id\`)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índice
    await queryRunner.query(`DROP INDEX \`IDX_premium_plans_premium_id\` ON \`premium_plans\``);

    // Remover foreign key
    await queryRunner.query(`ALTER TABLE \`premium_plans\` DROP FOREIGN KEY \`FK_premium_plans_premium\``);

    // Remover coluna premium_id
    await queryRunner.query(`ALTER TABLE \`premium_plans\` DROP COLUMN \`premium_id\``);

    // Recriar tabela de relacionamento many-to-many
    await queryRunner.query(`CREATE TABLE \`premium_plan_relations\` (
            \`premium_id\` int NOT NULL,
            \`premium_plan_id\` int NOT NULL,
            PRIMARY KEY (\`premium_id\`, \`premium_plan_id\`)
        ) ENGINE=InnoDB`);

    // Recriar índices
    await queryRunner.query(`CREATE INDEX \`IDX_65e99d3afa4c61c029bb3eb3b1\` ON \`premium_plan_relations\` (\`premium_id\`)`);
    await queryRunner.query(`CREATE INDEX \`IDX_8967230f9b39bd30cdf8626d80\` ON \`premium_plan_relations\` (\`premium_plan_id\`)`);

    // Recriar foreign keys
    await queryRunner.query(`ALTER TABLE \`premium_plan_relations\` ADD CONSTRAINT \`FK_65e99d3afa4c61c029bb3eb3b11\` FOREIGN KEY (\`premium_id\`) REFERENCES \`premium\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE \`premium_plan_relations\` ADD CONSTRAINT \`FK_8967230f9b39bd30cdf8626d803\` FOREIGN KEY (\`premium_plan_id\`) REFERENCES \`premium_plans\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
  }
} 