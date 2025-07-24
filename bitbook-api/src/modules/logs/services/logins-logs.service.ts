import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { LoginsLogs } from '../entities/logins-logs.entity';
import { CreateUserLogDto } from '../dtos/logins-log.dto';


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


} 