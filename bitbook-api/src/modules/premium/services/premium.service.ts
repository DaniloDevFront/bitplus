import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreatePremiumDto, UpdatePremiumDto } from '../dto/premium.dto';
import { Premium } from '../entities/premium.entity';
import { PremiumPlan } from '../entities/premium-plan.entity';
import { ProvidersService } from 'src/modules/_legacy/services/providers.service';
import { PremiumByUser } from '../models/premium';

@Injectable()
export class PremiumService {
  constructor(
    private entityManager: EntityManager,
    private providersService: ProvidersService,
  ) { }

  async create(payload: CreatePremiumDto): Promise<Premium> {
    // 1. Desativar o Premium ativo (se houver)
    const premiumAtivo = await this.entityManager.findOne(Premium, {
      where: { status: true },
      order: { created_at: 'DESC' }
    });

    if (premiumAtivo) {
      premiumAtivo.status = false;
      await this.entityManager.save(Premium, premiumAtivo);
    }

    // 2. Criar a entidade Premium
    const premium = new Premium();
    premium.title = payload.title;
    premium.description = payload.description;
    premium.benefits = payload.benefits;
    premium.status = true;

    // 3. Salvar o novo Premium
    const savedPremium = await this.entityManager.save(Premium, premium);

    // 4. Criar e salvar os planos com referência ao premium
    for (const item of payload.plans) {
      const plan = new PremiumPlan();
      plan.recorrence = item.recorrence;
      plan.description = item.description;
      plan.price_label = item.price_label;
      plan.price = item.price;
      plan.premium = savedPremium;
      await this.entityManager.save(PremiumPlan, plan);
    }

    const premiumWithPlans = await this.entityManager.findOne(Premium, {
      where: { id: savedPremium.id },
      relations: ['plans']
    });

    return premiumWithPlans;
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
      relations: ['plans'],
      order: {
        created_at: 'DESC',
      },
    });

    return premiums ?? [];
  }

  async findActive(): Promise<Premium> {
    const premium = await this.entityManager.findOne(Premium, {
      where: { status: true },
      order: { created_at: 'DESC' },
      relations: ['plans']
    });

    if (!premium) {
      throw new NotFoundException(`Assinatura ativa não encontrada`);
    }

    return premium;
  }

  async findByUserId(id: number): Promise<any> {
    const premium: PremiumByUser = await this.providersService.getPremiumStatusByID(id);

    const response = {
      provider: {
        id: premium.empresa.id,
        name: premium.empresa.nome,
        img_list: premium.empresa.img_lista,
        img_home: premium.empresa.img_home,
      },
      value: premium.transacao.valor,
      status: premium.premium,
      integrated: premium.vinculo_atual.data_vinculacao,
      expires: null
    };

    return response
  }
}   