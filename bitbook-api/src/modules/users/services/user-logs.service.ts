import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLog, LoginType, LoginStatus } from '../entities/user-log.entity';
import { CreateUserLogDto, FindTodayLogsDto, FindStatisticsDto, UserLogResponseDto, LoginStatisticsDto } from '../dto/user-log.dto';
import { User } from '../entities/user.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserLogsService {
  constructor(
    @InjectRepository(UserLog)
    private readonly userLogRepository: Repository<UserLog>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async createLog(createUserLogDto: CreateUserLogDto): Promise<UserLog> {
    const userLog = this.userLogRepository.create(createUserLogDto);
    return await this.userLogRepository.save(userLog);
  }

  async findTodayLogs(filters?: Partial<FindTodayLogsDto>): Promise<{ logs: UserLogResponseDto[]; total: number }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const { user_id, success, login_type, ip_address, page = 1, limit = 50 } = filters || {};

    const queryBuilder = this.userLogRepository
      .createQueryBuilder('userLog')
      .leftJoinAndSelect('userLog.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('userLog.login_at BETWEEN :startDate AND :endDate', {
        startDate: startOfDay,
        endDate: endOfDay,
      });

    // Outros filtros
    if (user_id) {
      queryBuilder.andWhere('userLog.user_id = :user_id', { user_id });
    }

    if (success) {
      queryBuilder.andWhere('userLog.success = :success', { success });
    }

    if (login_type) {
      queryBuilder.andWhere('userLog.login_type = :login_type', { login_type });
    }

    if (ip_address) {
      queryBuilder.andWhere('userLog.ip_address LIKE :ip_address', { ip_address: `%${ip_address}%` });
    }

    // Ordenação e paginação
    queryBuilder
      .orderBy('userLog.login_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();

    const responseLogs: UserLogResponseDto[] = logs.map(log => ({
      id: log.id,
      user_id: log.user_id,
      login_at: log.login_at,
      ip_address: log.ip_address,
      user_agent: log.user_agent,
      success: log.success,
      login_type: log.login_type,
      failure_reason: log.failure_reason,
      created_at: log.created_at,
      user_name: log.user?.profile?.name || 'N/A',
      user_email: log.user?.email || 'N/A',
    }));

    return { logs: responseLogs, total };
  }

  async getLoginStatistics(filters?: Partial<FindStatisticsDto>): Promise<LoginStatisticsDto> {
    const { start_date, end_date } = filters || {};

    const queryBuilder = this.userLogRepository.createQueryBuilder('userLog');

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

    // Logins por dia
    const loginsByDay = await queryBuilder
      .select('DATE(userLog.login_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(userLog.login_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const loginsByDayFormatted = loginsByDay.map(item => ({
      date: item.date,
      count: parseInt(item.count),
    }));

    // Registros de usuários por dia
    let registersByDay: { date: string; count: number }[] = [];
    if (start_date && end_date) {
      registersByDay = await this.entityManager
        .createQueryBuilder(User, 'user')
        .select('DATE(user.created_at)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('user.created_at BETWEEN :startDate AND :endDate', {
          startDate: new Date(start_date),
          endDate: new Date(end_date + 'T23:59:59.999Z'),
        })
        .groupBy('DATE(user.created_at)')
        .orderBy('date', 'ASC')
        .getRawMany();
    } else {
      registersByDay = await this.entityManager
        .createQueryBuilder(User, 'user')
        .select('DATE(user.created_at)', 'date')
        .addSelect('COUNT(*)', 'count')
        .groupBy('DATE(user.created_at)')
        .orderBy('date', 'ASC')
        .getRawMany();
    }
    registersByDay = registersByDay.map(item => ({
      date: item.date,
      count: typeof item.count === 'string' ? parseInt(item.count) : item.count,
    }));

    const successRate = totalLogins > 0 ? (successfulLogins / totalLogins) * 100 : 0;

    return {
      total_logins: totalLogins,
      successful_logins: successfulLogins,
      failed_logins: failedLogins,
      unique_users: parseInt(uniqueUsers.count),
      success_rate: Math.round(successRate * 100) / 100,
      logins_by_type: loginsByTypeMap,
      logins_by_day: loginsByDayFormatted,
      registers_by_day: registersByDay,
    };
  }
} 