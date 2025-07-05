import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateSignatureDto, UpdateSignatureDto } from '../dto/signatures.dto';
import { CreateSignaturePlanDto, UpdateSignaturePlanDto } from '../dto/signature-plan.dto';
import { Signature } from '../entities/signature.entity';
import { SignaturePlan } from '../entities/signature-plan.entity';

@Injectable()
export class SignaturesService {
  constructor(
    private entityManager: EntityManager,
  ) { }

  async create(payload: CreateSignatureDto): Promise<Signature> {
    const plan = await this.entityManager.findOne(SignaturePlan, {
      where: { id: payload.plan_id }
    });

    if (!plan) {
      throw new NotFoundException(`Plano com ID ${payload.plan_id} não encontrado`);
    }

    // Criar a assinatura
    const signature = this.entityManager.create(Signature, {
      title: payload.title,
      description: payload.description,
      benefits: payload.benefits,
      status: payload.status ?? true,
      plan: plan
    });

    const savedSignature = await this.entityManager.save(Signature, signature);

    // Retornar a assinatura com o plano
    return this.findById(savedSignature.id);
  }

  async update(id: number, payload: UpdateSignatureDto): Promise<Signature> {
    const signature = await this.findById(id);

    if (!signature) {
      throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
    }

    // Atualizar dados da assinatura
    if (payload.title !== undefined) signature.title = payload.title;
    if (payload.description !== undefined) signature.description = payload.description;
    if (payload.benefits !== undefined) signature.benefits = payload.benefits;
    if (payload.status !== undefined) signature.status = payload.status;

    // Atualizar plano se fornecido
    if (payload.plan_id !== undefined) {
      const plan = await this.entityManager.findOne(SignaturePlan, {
        where: { id: payload.plan_id }
      });

      if (!plan) {
        throw new NotFoundException(`Plano com ID ${payload.plan_id} não encontrado`);
      }

      signature.plan = plan;
    }

    await this.entityManager.save(Signature, signature);

    return this.findById(id);
  }

  async delete(id: number): Promise<{ success: boolean; message: string; deleted_at: string }> {
    const signature = await this.findById(id);

    if (!signature) {
      throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
    }

    // Soft delete - apenas alterar o status para false
    signature.status = false;
    await this.entityManager.save(Signature, signature);

    return {
      success: true,
      message: `Assinatura com ID ${id} removida com sucesso`,
      deleted_at: new Date().toISOString()
    };
  }

  async findById(id: number): Promise<Signature> {
    const signature = await this.entityManager.findOne(Signature, {
      where: { id },
      relations: ['plan']
    });

    if (!signature) {
      throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
    }

    return signature;
  }

  async findAll(): Promise<Signature[]> {
    const signatures = await this.entityManager.find(Signature, {
      where: { status: true },
      relations: ['plan'],
      order: {
        id: 'DESC',
      },
    });

    return signatures ?? [];
  }
}   