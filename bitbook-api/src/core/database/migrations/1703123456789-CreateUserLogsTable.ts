import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateUserLogsTable1703123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'login_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'success',
            type: 'enum',
            enum: ['success', 'failed'],
            default: "'success'",
            isNullable: false,
          },
          {
            name: 'login_type',
            type: 'enum',
            enum: ['email_password', 'biometric', 'social', 'refresh_token'],
            default: "'email_password'",
            isNullable: false,
          },
          {
            name: 'failure_reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_UserLogs_Users',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_UserLogs_UserId_LoginAt',
            columnNames: ['user_id', 'login_at'],
          },
          {
            name: 'IDX_UserLogs_LoginAt',
            columnNames: ['login_at'],
          },
          {
            name: 'IDX_UserLogs_IpAddress',
            columnNames: ['ip_address'],
          },
          {
            name: 'IDX_UserLogs_Success',
            columnNames: ['success'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_logs');
  }
} 