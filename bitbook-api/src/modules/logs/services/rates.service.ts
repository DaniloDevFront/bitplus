import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { toZonedTime, format } from 'date-fns-tz';

import { RateHistory } from '../../rate/entities/rate-history.entity';

@Injectable()
export class RatesService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async getRatesStatistics(): Promise<{
    total: number;
    by_day: {
      date: string;
      count: number;
    };
    total_max: number;
    total_min: number;
  }> {
    const timeZone = 'America/Sao_Paulo';
    const now = new Date();
    const saoPauloDate = toZonedTime(now, timeZone);
    const dateString = format(saoPauloDate, 'yyyy-MM-dd', { timeZone });
    const startOfDay = new Date(`${dateString}T00:00:00.000-03:00`);
    const endOfDay = new Date(`${dateString}T23:59:59.999-03:00`);

    // Total de avaliações
    const totalRates = await this.entityManager.count(RateHistory, {
      where: { status: true }
    });

    // Avaliações do dia atual
    const ratesByDayResult = await this.entityManager
      .createQueryBuilder(RateHistory, 'rateHistory')
      .select('COUNT(*)', 'count')
      .where('rateHistory.created_at BETWEEN :startDate AND :endDate', {
        startDate: startOfDay,
        endDate: endOfDay
      })
      .andWhere('rateHistory.status = :status', { status: true })
      .getRawOne();

    const ratesByDay = {
      date: dateString,
      count: ratesByDayResult && ratesByDayResult.count ? parseInt(ratesByDayResult.count) : 0,
    };

    // Total de avaliações com nota máxima (5.0)
    const totalMaxRates = await this.entityManager
      .createQueryBuilder(RateHistory, 'rateHistory')
      .where('rateHistory.rating = :rating', { rating: 5.0 })
      .andWhere('rateHistory.status = :status', { status: true })
      .getCount();

    // Total de avaliações com nota baixa (≤ 4.0)
    const totalMinRates = await this.entityManager
      .createQueryBuilder(RateHistory, 'rateHistory')
      .where('rateHistory.rating <= :rating', { rating: 4.0 })
      .andWhere('rateHistory.status = :status', { status: true })
      .getCount();

    return {
      total: totalRates,
      by_day: ratesByDay,
      total_max: totalMaxRates,
      total_min: totalMinRates,
    };
  }
} 