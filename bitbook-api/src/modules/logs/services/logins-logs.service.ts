import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { toZonedTime, format } from 'date-fns-tz';

import { LoginsLogs } from '../entities/logins-logs.entity';
import { RegistrationLog } from '../entities/registrations-logs.entity';
import { CreateUserLogDto, LoginStatisticsDto } from '../dtos/logins-log.dto';
import { User } from '../../users/entities/user.entity';
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

  async getLoginStatistics(): Promise<LoginStatisticsDto> {
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

    // Registros do dia atual usando a nova entity RegistrationLog
    const registerResult = await this.entityManager
      .createQueryBuilder(RegistrationLog, 'registrationLog')
      .select('COUNT(*)', 'count')
      .where('registrationLog.created_at BETWEEN :startDate AND :endDate', { startDate: startOfDay, endDate: endOfDay })
      .getRawOne();

    const registersByDay = {
      date: dateString,
      count: registerResult && registerResult.count ? parseInt(registerResult.count) : 0,
    };

    // Total de registros de usuários usando a nova entity
    const totalRegisters = await this.entityManager.count(RegistrationLog);
    const failedRegisters = await this.entityManager
      .createQueryBuilder(RegistrationLog, 'registrationLog')
      .where('registrationLog.failure_reason IS NOT NULL')
      .getCount();

    return {
      total_logins: totalLogins,
      successful_logins: successfulLogins,
      failed_logins: failedLogins,
      logins_by_type: loginsByTypeMap,
      logins_by_day: loginsByDay,
      total_registers: totalRegisters,
      failed_registers: failedRegisters,
      registers_by_day: registersByDay,
    };
  }
} 