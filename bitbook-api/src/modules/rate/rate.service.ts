import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Rate } from './entities/rate.entity';
import { RateHistory } from './entities/rate-history.entity';
import { CreateRateDto, UpdateRateDto } from './dto/rate.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RateService {
  constructor(
    private readonly entityManager: EntityManager,
  ) { }

  async create(payload: CreateRateDto): Promise<Partial<RateHistory>> {
    const { user_id } = payload;

    const user = await this.entityManager.findOne(User, { where: { id: user_id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${user_id} não encontrado`);
    }

    let rate = await this.entityManager.findOne(Rate, {
      where: { user: { id: user_id } },
      relations: ['user']
    });

    if (!rate) {
      rate = this.entityManager.create(Rate, { user });
      rate = await this.entityManager.save(rate);
    }

    // Buscar e desativar o último registro ativo
    const lastActiveHistory = await this.entityManager.findOne(RateHistory, {
      where: {
        rate: { id: rate.id },
        status: true
      },
      order: { created_at: 'DESC' }
    });

    if (lastActiveHistory) {
      lastActiveHistory.status = false;
      await this.entityManager.save(lastActiveHistory);
    }

    const history = this.entityManager.create(RateHistory, {
      rating: payload.rating,
      comment: payload.comment,
      rate,
      status: true
    });

    const savedHistory = await this.entityManager.save(history);

    return {
      id: savedHistory.id,
      rating: savedHistory.rating,
      comment: savedHistory.comment,
      status: savedHistory.status,
      created_at: savedHistory.created_at
    };
  }

  async update(id: number, updateRateDto: UpdateRateDto): Promise<RateHistory> {
    const history = await this.entityManager.findOne(RateHistory, {
      where: { id, status: true },
      relations: ['rate', 'rate.user']
    });

    if (!history) {
      throw new NotFoundException(`Avaliação com ID ${id} não encontrada`);
    }

    // Desativar o histórico atual
    history.status = false;
    await this.entityManager.save(history);

    // Criar novo histórico com os dados atualizados
    const newHistory = this.entityManager.create(RateHistory, {
      ...updateRateDto,
      rate: history.rate,
      status: true
    });

    return this.entityManager.save(newHistory);
  }

  async delete(id: number): Promise<void> {
    const history = await this.entityManager.findOne(RateHistory, {
      where: { id, status: true }
    });

    if (!history) {
      throw new NotFoundException(`Avaliação com ID ${id} não encontrada`);
    }

    // Soft delete - apenas marca como inativo
    history.status = false;
    await this.entityManager.save(history);
  }

  async findAll(): Promise<RateHistory[]> {
    return this.entityManager.find(RateHistory, {
      relations: ['rate', 'rate.user'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findById(id: number): Promise<RateHistory> {
    const history = await this.entityManager.findOne(RateHistory, {
      where: { id, status: true },
      relations: ['rate', 'rate.user']
    });

    if (!history) {
      throw new NotFoundException(`Avaliação com ID ${id} não encontrada`);
    }

    return history;
  }

  async findByUser(userId: number, all: boolean = true): Promise<RateHistory[] | RateHistory> {
    const user = await this.entityManager.findOne(User, { where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    if (!all) {
      return this.entityManager.findOne(RateHistory, {
        where: {
          rate: { user: { id: userId } },
          status: true
        },
        relations: ['rate', 'rate.user'],
        order: {
          created_at: 'DESC',
        },
      });
    }

    return this.entityManager.find(RateHistory, {
      where: {
        rate: { user: { id: userId } },
      },
      relations: ['rate', 'rate.user'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findByRating(rating: number): Promise<RateHistory[]> {
    return this.entityManager.find(RateHistory, {
      where: {
        rating,
        status: true
      },
      relations: ['rate', 'rate.user'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findByStatus(status: boolean): Promise<RateHistory[]> {
    return this.entityManager.find(RateHistory, {
      where: {
        status,
      },
      relations: ['rate', 'rate.user'],
      order: {
        created_at: 'DESC',
      },
    });
  }
} 