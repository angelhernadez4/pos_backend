import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Product) private readonly productRepository: Repository<Product>
    ) { }

    create(createCategoryDto: CreateCategoryDto) {
        this.categoryRepository.save(createCategoryDto)
        return {
            success: true,
            message: 'Categoría creada correctamente'
        };
    }

    async findAll(take: number = 10, skip: number = 0) {
        take = parseInt(take as any, 10) || 10;
        skip = parseInt(skip as any, 0) || 0;

        const [categories, total] = await this.categoryRepository.findAndCount({
            take,
            skip
        })
        const data = categories
        return { categories: data, total };
    }

    async findOne(id: ObjectId, products?: string): Promise<Category | any> {
        const category = await this.categoryRepository.findOneBy({ _id: id });

        if (!category) {
            throw new NotFoundException('La categoría no existe');
        }

        // Si products = 'true', devuelve la categoría con sus productos
        if (products === 'true') {
            const productList = await this.productRepository.find({
                where: { categoryId: id }
            });

            return {
                ...category,
                products: productList
            };
        }

        // Si no se manda products, solo devuelve la categoría
        return category;
    }


    async update(id: ObjectId, updateCategoryDto: UpdateCategoryDto) {
        const category = await this.findOne(id)
        if (!category) return
        category.name = updateCategoryDto.name
        return await this.categoryRepository.save(category);
    }

    async remove(id: ObjectId) {
        const category = await this.findOne(id)
        if (!category) return
        await this.categoryRepository.remove(category)
        return {
            success: true,
            message: 'Eliminado correctamente'
        }
    }

    async findFirstCategory(): Promise<{ _id: ObjectId }> {
        const firstCategory = await this.categoryRepository.find({
            order: { _id: 'ASC' }, // Ordenar por ID ascendente (primera categoría)
            take: 1,              // Solo una categoría
        });

        if (!firstCategory.length) {
            throw new NotFoundException('No hay categorías registradas');
        }

        return { _id: firstCategory[0]._id };
    }

}
