import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanupSignatureReferences1751815000000 implements MigrationInterface {
  name = 'CleanupSignatureReferences1751815000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Limpar completamente todas as referências às tabelas signatures antigas
    // Remover foreign keys se existirem
    try {
      await queryRunner.query(`ALTER TABLE \`signatures\` DROP FOREIGN KEY \`FK_6de44d342b85abb3e73036d979c\``);
    } catch (error) {
      // Foreign key pode não existir
    }

    // Dropar tabelas signatures se existirem
    await queryRunner.query(`DROP TABLE IF EXISTS \`signatures\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`signatures_plans\``);

    // Dropar tabela de relacionamento premium_plan_relations se existir
    await queryRunner.query(`DROP TABLE IF EXISTS \`premium_plan_relations\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Não recriar as tabelas antigas no rollback
    // O sistema agora usa as novas tabelas premium e premium_plans
  }
} 