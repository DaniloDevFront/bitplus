import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { ErrorsLogs } from '../entities/errors-logs.entity';
import { CreateErrorLogDto } from '../dtos/errors-log.dto';

@Injectable()
export class ErrorsLogsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async createLog(payload: CreateErrorLogDto): Promise<ErrorsLogs> {
    const errorLog = this.entityManager.create(ErrorsLogs, payload);
    return await this.entityManager.save(ErrorsLogs, errorLog);
  }

  async getErrorStatistics(): Promise<{
    total: number;
    by_type: Record<string, number>;
    by_origin: Record<string, number>;
    by_day: {
      date: string;
      count: number;
    };
  }> {
    const timeZone = 'America/Sao_Paulo';
    const now = new Date();
    const saoPauloDate = new Date(now.toLocaleString('en-US', { timeZone }));
    const dateString = saoPauloDate.toISOString().split('T')[0];
    const startOfDay = new Date(`${dateString}T00:00:00.000-03:00`);
    const endOfDay = new Date(`${dateString}T23:59:59.999-03:00`);

    // Total de erros
    const totalErrors = await this.entityManager.count(ErrorsLogs);

    // Erros por tipo
    const errorsByType = await this.entityManager
      .createQueryBuilder(ErrorsLogs, 'errorLog')
      .select('errorLog.error_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('errorLog.error_type')
      .getRawMany();

    const errorsByTypeMap = errorsByType.reduce((acc, item) => {
      acc[item.type || 'unknown'] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Erros por origem
    const errorsByOrigin = await this.entityManager
      .createQueryBuilder(ErrorsLogs, 'errorLog')
      .select('errorLog.origin', 'origin')
      .addSelect('COUNT(*)', 'count')
      .groupBy('errorLog.origin')
      .getRawMany();

    const errorsByOriginMap = errorsByOrigin.reduce((acc, item) => {
      acc[item.origin || 'unknown'] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Erros do dia atual
    const errorResult = await this.entityManager
      .createQueryBuilder(ErrorsLogs, 'errorLog')
      .select('COUNT(*)', 'count')
      .where('errorLog.created_at BETWEEN :startDate AND :endDate', { startDate: startOfDay, endDate: endOfDay })
      .getRawOne();

    const errorsByDay = {
      date: dateString,
      count: errorResult && errorResult.count ? parseInt(errorResult.count) : 0,
    };

    return {
      total: totalErrors,
      by_type: errorsByTypeMap,
      by_origin: errorsByOriginMap,
      by_day: errorsByDay,
    };
  }
} 