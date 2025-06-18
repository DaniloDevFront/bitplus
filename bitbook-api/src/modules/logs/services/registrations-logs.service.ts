import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

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
} 