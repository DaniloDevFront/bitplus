import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreatePremiumDto, UpdatePremiumDto } from '../dto/premium.dto';
import { Premium } from '../entities/premium.entity';
import { PremiumPlan } from '../entities/premium-plan.entity';

@Injectable()
export class PremiumService {
  constructor(
    private entityManager: EntityManager,
  ) { }

  async create(payload: CreatePremiumDto): Promise<Premium> {
    // Criar a entidade Premium
    const premium = new Premium();
    premium.title = payload.title;
    premium.description = payload.description;
    premium.benefits = payload.benefits;
    premium.status = true;

    // Salvar o Premium primeiro
    const savedPremium = await this.entityManager.save(Premium, premium);

    // Criar e salvar os planos com referência ao premium
    const plans: PremiumPlan[] = [];
    for (const item of payload.plans) {
      const plan = new PremiumPlan();
      plan.recorrence = item.recorrence;
      plan.description = item.description;
      plan.price_label = item.price_label;
      plan.price = item.price;
      plan.premium = savedPremium;

      const savedPlan = await this.entityManager.save(PremiumPlan, plan);
      plans.push(savedPlan);
    }

    // Retornar o premium com os planos relacionados
    return this.findById(savedPremium.id);
  }

  async update(id: number, payload: UpdatePremiumDto): Promise<Premium> {
    const premium = await this.findById(id);

    if (!premium) {
      throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
    }

    // Atualizar dados da assinatura
    if (payload.title !== undefined) premium.title = payload.title;
    if (payload.description !== undefined) premium.description = payload.description;
    if (payload.benefits !== undefined) premium.benefits = payload.benefits;
    if (payload.status !== undefined) premium.status = payload.status;

    // Se houver novos planos, atualizar os relacionamentos
    if (payload.plans !== undefined) {
      // Primeiro, remover os planos existentes
      await this.entityManager.delete(PremiumPlan, { premium_id: id });

      // Criar e salvar os novos planos
      const plans: PremiumPlan[] = [];
      for (const planData of payload.plans) {
        const plan = new PremiumPlan();
        plan.recorrence = planData.recorrence;
        plan.description = planData.description;
        plan.price_label = planData.price_label;
        plan.price = planData.price;
        plan.premium = premium;

        const savedPlan = await this.entityManager.save(PremiumPlan, plan);
        plans.push(savedPlan);
      }
    }

    await this.entityManager.save(Premium, premium);

    return this.findById(id);
  }

  async delete(id: number): Promise<{ success: boolean; message: string; deleted_at: string }> {
    const premium = await this.findById(id);

    if (!premium) {
      throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
    }

    // Soft delete - apenas alterar o status para false
    premium.status = false;
    await this.entityManager.save(Premium, premium);

    return {
      success: true,
      message: `Assinatura com ID ${id} removida com sucesso`,
      deleted_at: new Date().toISOString()
    };
  }

  async findById(id: number): Promise<Premium> {
    const premium = await this.entityManager.findOne(Premium, {
      where: { id },
      relations: ['plans']
    });

    if (!premium) {
      throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
    }

    return premium;
  }

  async findAll(): Promise<Premium[]> {
    const premiums = await this.entityManager.find(Premium, {
      where: { status: true },
      relations: ['plans'],
      order: {
        created_at: 'DESC',
      },
    });

    return premiums ?? [];
  }
}   