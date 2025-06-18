import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserLog, LoginType, LoginStatus } from '../entities/user-log.entity';
import { CreateUserLogDto, LoginStatisticsDto } from '../dto/user-log.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserLogsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async createLog(payload: CreateUserLogDto): Promise<UserLog> {
    const userLog = this.entityManager.create(UserLog, payload);
    return await this.entityManager.save(UserLog, userLog);
  }

  async getLoginStatistics(): Promise<LoginStatisticsDto> {
    // Sempre considerar apenas o dia atual
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Estatísticas gerais
    const queryBuilder = this.entityManager.createQueryBuilder(UserLog, 'userLog');

    const totalLogins = await queryBuilder.getCount();
    const successfulLogins = await queryBuilder
      .andWhere('userLog.success = :success', { success: LoginStatus.SUCCESS })
      .getCount();
    const failedLogins = totalLogins - successfulLogins;

    // Usuários únicos
    const uniqueUsers = await queryBuilder
      .select('COUNT(DISTINCT userLog.user_id)', 'count')
      .getRawOne();

    // Logins por tipo
    const loginsByType = await queryBuilder
      .select('userLog.login_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('userLog.login_type')
      .getRawMany();

    const loginsByTypeMap = Object.values(LoginType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<LoginType, number>);

    loginsByType.forEach(item => {
      loginsByTypeMap[item.type] = parseInt(item.count);
    });

    // Logins do dia atual
    const loginResult = await this.entityManager
      .createQueryBuilder(UserLog, 'userLog')
      .select('COUNT(*)', 'count')
      .where('userLog.login_at BETWEEN :startDate AND :endDate', { startDate: startOfDay, endDate: endOfDay })
      .getRawOne();

    const loginsByDay = {
      date: dateString,
      count: loginResult && loginResult.count ? parseInt(loginResult.count) : 0,
    };

    // Registros do dia atual
    const registerResult = await this.entityManager
      .createQueryBuilder(User, 'user')
      .select('COUNT(*)', 'count')
      .where('user.created_at BETWEEN :startDate AND :endDate', { startDate: startOfDay, endDate: endOfDay })
      .getRawOne();

    const registersByDay = {
      date: dateString,
      count: registerResult && registerResult.count ? parseInt(registerResult.count) : 0,
    };

    // Total de registros de usuários
    const totalRegisters = await this.entityManager.count(User);
    const successfulRegisters = totalRegisters;
    const failedRegisters = 0;

    const successRate = totalLogins > 0 ? (successfulLogins / totalLogins) * 100 : 0;

    return {
      total_logins: totalLogins,
      successful_logins: successfulLogins,
      failed_logins: failedLogins,
      unique_users: parseInt(uniqueUsers.count),
      success_rate: Math.round(successRate * 100) / 100,
      logins_by_type: loginsByTypeMap,
      logins_by_day: loginsByDay,
      total_registers: totalRegisters,
      successful_registers: successfulRegisters,
      failed_registers: failedRegisters,
      registers_by_day: registersByDay,
    };
  }
} 