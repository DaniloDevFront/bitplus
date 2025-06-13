import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { UploadsService } from 'src/modules/uploads/uploads.service';
import { Books } from 'src/modules/books/entities/books.entity';
import { BadRequestException } from '@nestjs/common';
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly uploadsService: UploadsService,
    private entityManager: EntityManager,
  ) { }

  async create(payload: CreateCategoryDto, file: Express.Multer.File): Promise<Category> {

    const uploadResult = await this.uploadsService.uploadFile(file, 'categories/icons', 'image');

    if (uploadResult) {
      payload.ico = uploadResult.url;
    }

    const category = this.categoryRepository.create(payload);
    return this.categoryRepository.save(category);
  }

  async update(id: number, payload: UpdateCategoryDto, file: Express.Multer.File): Promise<Category> {
    const category = await this.findById(id);

    if (file) {
      const uploadResult = await this.uploadsService.uploadFile(file, 'categories/icons', 'image');

      if (uploadResult) {
        if (category.ico) {
          await this.uploadsService.deleteFile(category.ico);
        }

        payload.ico = uploadResult.url;
      }
    }


    Object.assign(category, payload);
    return this.categoryRepository.save(category);
  }

  async delete(id: number): Promise<void> {
    const category = await this.findById(id);

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    const books = await this.entityManager.find(Books, { where: { category: { id } } });
    if (books.length > 0) {
      throw new BadRequestException(`Categoria com ID ${id} possui livros vinculados`);
    }

    if (category.ico) {
      await this.uploadsService.deleteFile(category.ico);
    }

    await this.categoryRepository.remove(category);
  }

  async findById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    return category;
  }

  async findByName(name: string): Promise<Category[]> {
    return this.categoryRepository.find({ where: { name } });
  }

  async findByPremium(premium: boolean): Promise<Category[]> {
    return this.categoryRepository.find({ where: { premium } });
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }
} 