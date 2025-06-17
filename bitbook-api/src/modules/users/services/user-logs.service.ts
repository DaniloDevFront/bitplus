import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { UserLog, LoginType, LoginStatus } from '../entities/user-log.entity';
import { CreateUserLogDto, FindUserLogsDto, UserLogResponseDto, LoginStatisticsDto } from '../dto/user-log.dto';

@Injectable()
export class UserLogsService {
  constructor(
    @InjectRepository(UserLog)
    private readonly userLogRepository: Repository<UserLog>,
  ) { }

  async createLog(createUserLogDto: CreateUserLogDto): Promise<UserLog> {
    const userLog = this.userLogRepository.create(createUserLogDto);
    return await this.userLogRepository.save(userLog);
  }

  async findLogsByDateRange(filters: FindUserLogsDto): Promise<{ logs: UserLogResponseDto[]; total: number }> {
    const { startDate, endDate, user_id, success, login_type, ip_address, page = 1, limit = 50 } = filters;

    const queryBuilder = this.userLogRepository
      .createQueryBuilder('userLog')
      .leftJoinAndSelect('userLog.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile');

    // Filtros de data
    if (startDate && endDate) {
      queryBuilder.andWhere('userLog.login_at BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate + 'T23:59:59.999Z'),
      });
    } else if (startDate) {
      queryBuilder.andWhere('userLog.login_at >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere('userLog.login_at <= :endDate', {
        endDate: new Date(endDate + 'T23:59:59.999Z'),
      });
    }

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

  async findTodayLogs(filters?: Partial<FindUserLogsDto>): Promise<{ logs: UserLogResponseDto[]; total: number }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    return this.findLogsByDateRange({
      startDate: startOfDay.toISOString().split('T')[0],
      endDate: endOfDay.toISOString().split('T')[0],
      ...filters,
    });
  }

  async findWeeklyLogs(filters?: Partial<FindUserLogsDto>): Promise<{ logs: UserLogResponseDto[]; total: number }> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
    endOfWeek.setHours(23, 59, 59, 999);

    return this.findLogsByDateRange({
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0],
      ...filters,
    });
  }

  async findMonthlyLogs(filters?: Partial<FindUserLogsDto>): Promise<{ logs: UserLogResponseDto[]; total: number }> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    return this.findLogsByDateRange({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
      ...filters,
    });
  }

  async getLoginStatistics(filters?: Partial<FindUserLogsDto>): Promise<LoginStatisticsDto> {
    const { startDate, endDate } = filters;

    const queryBuilder = this.userLogRepository.createQueryBuilder('userLog');

    // Filtros de data
    if (startDate && endDate) {
      queryBuilder.where('userLog.login_at BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate + 'T23:59:59.999Z'),
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

    const successRate = totalLogins > 0 ? (successfulLogins / totalLogins) * 100 : 0;

    return {
      total_logins: totalLogins,
      successful_logins: successfulLogins,
      failed_logins: failedLogins,
      unique_users: parseInt(uniqueUsers.count),
      success_rate: Math.round(successRate * 100) / 100,
      logins_by_type: loginsByTypeMap,
      logins_by_day: loginsByDayFormatted,
    };
  }

  async getSuspiciousLogins(threshold: number = 5): Promise<UserLogResponseDto[]> {
    // Busca usuários que fizeram login de múltiplos IPs em um curto período
    const suspiciousLogs = await this.userLogRepository
      .createQueryBuilder('userLog')
      .leftJoinAndSelect('userLog.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .select('userLog.user_id')
      .addSelect('COUNT(DISTINCT userLog.ip_address)', 'ip_count')
      .addSelect('MIN(userLog.login_at)', 'first_login')
      .addSelect('MAX(userLog.login_at)', 'last_login')
      .groupBy('userLog.user_id')
      .having('COUNT(DISTINCT userLog.ip_address) >= :threshold', { threshold })
      .andWhere('MAX(userLog.login_at) - MIN(userLog.login_at) <= :timeWindow', {
        timeWindow: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
      })
      .getRawMany();

    if (suspiciousLogs.length === 0) {
      return [];
    }

    const userIds = suspiciousLogs.map(log => log.userLog_user_id);

    const logs = await this.userLogRepository
      .createQueryBuilder('userLog')
      .leftJoinAndSelect('userLog.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('userLog.user_id IN (:...userIds)', { userIds })
      .orderBy('userLog.login_at', 'DESC')
      .getMany();

    return logs.map(log => ({
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
  }
} 