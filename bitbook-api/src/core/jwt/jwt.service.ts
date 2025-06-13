import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class JwtService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }


  async findById(id: number): Promise<User | null> {
    return this.entityManager.findOne(User, {
      where: { id },
      relations: ['profile'],
    });
  }
}

// 