import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { toZonedTime, format } from 'date-fns-tz';

import { RegistrationLog } from '../entities/registrations-logs.entity';
import { CreateRegistrationLogDto } from '../dtos/registrations-log.dto';

@Injectable()
export class RegistrationsLogsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async createLog(payload: CreateRegistrationLogDto): Promise<RegistrationLog> {
    const registrationLog = this.entityManager.create(RegistrationLog, payload);
    return await this.entityManager.save(RegistrationLog, registrationLog);
  }

  async getRegistrationStatistics(): Promise<{
    total: number;
    successful: number;
    failed: number;
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

    // Registros do dia atual
    const registerResult = await this.entityManager
      .createQueryBuilder(RegistrationLog, 'registrationLog')
      .select('COUNT(*)', 'count')
      .where('registrationLog.created_at BETWEEN :startDate AND :endDate', { startDate: startOfDay, endDate: endOfDay })
      .getRawOne();

    const registersByDay = {
      date: dateString,
      count: registerResult && registerResult.count ? parseInt(registerResult.count) : 0,
    };

    // Total de registros de usuários
    const totalRegisters = await this.entityManager.count(RegistrationLog);
    const successfulRegisters = await this.entityManager
      .createQueryBuilder(RegistrationLog, 'registrationLog')
      .where('registrationLog.status = :status', { status: 'success' })
      .getCount();
    const failedRegisters = await this.entityManager
      .createQueryBuilder(RegistrationLog, 'registrationLog')
      .where('registrationLog.status = :status', { status: 'failed' })
      .getCount();

    return {
      total: totalRegisters,
      successful: successfulRegisters,
      failed: failedRegisters,
      by_day: registersByDay,
    };
  }
} 