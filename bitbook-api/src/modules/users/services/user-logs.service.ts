import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserLog, LoginType, LoginStatus } from '../entities/user-log.entity';
import { CreateUserLogDto, FindStatisticsDto, LoginStatisticsDto } from '../dto/user-log.dto';
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

  async getLoginStatistics(filters?: Partial<FindStatisticsDto>): Promise<LoginStatisticsDto> {
    const { start_date, end_date } = filters || {};

    const queryBuilder = this.entityManager.createQueryBuilder(UserLog, 'userLog');

    // Filtros de data
    if (start_date && end_date) {
      queryBuilder.where('userLog.login_at BETWEEN :startDate AND :endDate', {
        startDate: new Date(start_date),
        endDate: new Date(end_date + 'T23:59:59.999Z'),
      });
    }

    // Estatísticas gerais
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

    // Definir intervalo de data para o dia atual ou último dia do filtro
    let startOfTargetDay: Date;
    let endOfTargetDay: Date;
    if (start_date && end_date) {
      // Último dia do filtro
      const lastDay = new Date(end_date);
      startOfTargetDay = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate());
      endOfTargetDay = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 23, 59, 59, 999);
    } else {
      // Dia atual
      const today = new Date();
      startOfTargetDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      endOfTargetDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    }

    // Logins do dia alvo
    const loginsTargetDay = await this.entityManager
      .createQueryBuilder(UserLog, 'userLog')
      .select('DATE(userLog.login_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('userLog.login_at BETWEEN :startDate AND :endDate', { startDate: startOfTargetDay, endDate: endOfTargetDay })
      .groupBy('DATE(userLog.login_at)')
      .getRawMany();

    const loginsByDayFormatted = loginsTargetDay.map(item => ({
      date: item.date,
      count: typeof item.count === 'string' ? parseInt(item.count) : item.count,
    }));

    // Registros do dia alvo
    const registersTargetDay = await this.entityManager
      .createQueryBuilder(User, 'user')
      .select('DATE(user.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.created_at BETWEEN :startDate AND :endDate', { startDate: startOfTargetDay, endDate: endOfTargetDay })
      .groupBy('DATE(user.created_at)')
      .getRawMany();

    const registersByDay = registersTargetDay.map(item => ({
      date: item.date,
      count: typeof item.count === 'string' ? parseInt(item.count) : item.count,
    }));

    const successRate = totalLogins > 0 ? (successfulLogins / totalLogins) * 100 : 0;

    // Total de registros de usuários
    const totalRegisters = await this.entityManager.count(User);
    const successfulRegisters = totalRegisters;
    const failedRegisters = 0;

    return {
      total_logins: totalLogins,
      successful_logins: successfulLogins,
      failed_logins: failedLogins,
      unique_users: parseInt(uniqueUsers.count),
      success_rate: Math.round(successRate * 100) / 100,
      logins_by_type: loginsByTypeMap,
      logins_by_day: loginsByDayFormatted,
      total_registers: totalRegisters,
      successful_registers: successfulRegisters,
      failed_registers: failedRegisters,
      registers_by_day: registersByDay,
    };
  }
} 