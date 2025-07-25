import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { toZonedTime, format } from 'date-fns-tz';

import { LoginsLogs } from '../entities/logins-logs.entity';
import { CreateUserLogDto } from '../dtos/logins-log.dto';
import { LOGIN_STATUS, LOGIN_TYPE } from '../enums/login.enum';


@Injectable()
export class LoginsLogsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async createLog(payload: CreateUserLogDto): Promise<LoginsLogs> {
    const userLog = this.entityManager.create(LoginsLogs, payload);
    return await this.entityManager.save(LoginsLogs, userLog);
  }

  async getLoginStatistics(): Promise<{
    total: number;
    successful: number;
    failed: number;
    by_type: Record<LOGIN_TYPE, number>;
    by_day: {
      date: string;
      count: number;
    };
  }> {
    const timeZone = 'America/Sao_Paulo';
    const now = new Date();
    const saoPauloDate = toZonedTime(now, timeZone);
    const dateString = format(saoPauloDate, 'yyyy-MM-dd', { timeZone });
    const startOfDay = new Date(`${dateString}T00:00:00.000-03:00`);
    const endOfDay = new Date(`${dateString}T23:59:59.999-03:00`);

    // Estatísticas gerais
    const queryBuilder = this.entityManager.createQueryBuilder(LoginsLogs, 'userLog');

    const totalLogins = await queryBuilder.getCount();
    const successfulLogins = await queryBuilder
      .andWhere('userLog.success = :success', { success: LOGIN_STATUS.SUCCESS })
      .getCount();
    const failedLogins = totalLogins - successfulLogins;

    // Logins por tipo
    const loginsByType = await queryBuilder
      .select('userLog.login_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('userLog.login_type')
      .getRawMany();

    const loginsByTypeMap = Object.values(LOGIN_TYPE).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<LOGIN_TYPE, number>);

    loginsByType.forEach(item => {
      loginsByTypeMap[item.type] = parseInt(item.count);
    });

    // Logins do dia atual
    const loginResult = await this.entityManager
      .createQueryBuilder(LoginsLogs, 'userLog')
      .select('COUNT(*)', 'count')
      .where('userLog.login_at BETWEEN :startDate AND :endDate', { startDate: startOfDay, endDate: endOfDay })
      .getRawOne();

    const loginsByDay = {
      date: dateString,
      count: loginResult && loginResult.count ? parseInt(loginResult.count) : 0,
    };

    return {
      total: totalLogins,
      successful: successfulLogins,
      failed: failedLogins,
      by_type: loginsByTypeMap,
      by_day: loginsByDay,
    };
  }
} 