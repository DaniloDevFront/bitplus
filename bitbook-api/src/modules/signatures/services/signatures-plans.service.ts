import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateSignaturePlanDto, UpdateSignaturePlanDto } from '../dto/signature-plan.dto';
import { SignaturePlan } from '../entities/signature-plan.entity';
import { Signature } from '../entities/signature.entity';

@Injectable()
export class SignaturesPlansService {
  constructor(
    private entityManager: EntityManager,
  ) { }

  async create(planData: CreateSignaturePlanDto): Promise<SignaturePlan> {
    const plan = this.entityManager.create(SignaturePlan, planData);
    return this.entityManager.save(SignaturePlan, plan);
  }

  async update(id: number, planData: UpdateSignaturePlanDto): Promise<SignaturePlan> {
    const plan = await this.findById(id);

    if (planData.recorrence !== undefined) plan.recorrence = planData.recorrence;
    if (planData.description !== undefined) plan.description = planData.description;
    if (planData.price_label !== undefined) plan.price_label = planData.price_label;
    if (planData.price !== undefined) plan.price = planData.price;

    return this.entityManager.save(SignaturePlan, plan);
  }

  async delete(id: number): Promise<{ success: boolean; message: string; deleted_at: string }> {
    const plan = await this.findById(id);

    // Verificar se há assinaturas usando este plano
    const signaturesUsingPlan = await this.entityManager.find(Signature, {
      where: { plan: { id } }
    });

    if (signaturesUsingPlan.length > 0) {
      throw new NotFoundException(`Não é possível deletar o plano. Existem ${signaturesUsingPlan.length} assinatura(s) usando este plano.`);
    }

    await this.entityManager.remove(SignaturePlan, plan);

    return {
      success: true,
      message: `Plano com ID ${id} removido com sucesso`,
      deleted_at: new Date().toISOString()
    };
  }

  async findAll(): Promise<SignaturePlan[]> {
    return this.entityManager.find(SignaturePlan);
  }

  async findById(id: number): Promise<SignaturePlan> {
    const plan = await this.entityManager.findOne(SignaturePlan, { where: { id } });

    if (!plan) {
      throw new NotFoundException(`Plano com ID ${id} não encontrado`);
    }

    return plan;
  }
}   