import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product) private readonly productRepository: Repository<Product>,
        @InjectRepository(Category) private readonly categoryRepository: Repository<Category>
    ) { }
    async create(createProductDto: CreateProductDto) {
        const category = await this.categoryRepository.findOneBy({ _id: new ObjectId(createProductDto.categoryId) });

        if (!category) {
            let errors : string[] = []
            errors.push('La categoría no existe')
            throw new NotFoundException(errors);
        }

        const product = this.productRepository.create({ ...createProductDto, categoryId: category._id });
        await this.productRepository.save(product);

        // Agregar el producto a la categoría
        category.products.push(product._id);
        await this.categoryRepository.save(category);

        return product;


    }

    async findAll(categoryId?: string, take: number = 10, skip: number = 0) {
        const filter = categoryId ? { categoryId: new ObjectId(categoryId!) } : {};
        take = parseInt(take as any, 10) || 10;
        skip = parseInt(skip as any, 0) || 0;

        const [products, total] = await this.productRepository.findAndCount({
            where: filter,
            take,
            skip
        });

        const data = await Promise.all(
            products.map(async (product) => {
                const category = await this.categoryRepository.findOneBy({ _id: new ObjectId(product.categoryId) });
                return { ...product, category };
            })
        );

        return { products: data, total };
    }


    async findOne(id: ObjectId) {
        const product = await this.productRepository.findOneBy({ _id: id });

        if (!product) {
            throw new NotFoundException('El producto no existe');
        }

        // Buscar la categoría asociada
        const category = await this.categoryRepository.findOneBy({ _id: new ObjectId(product.categoryId) });

        // Devolver el producto con la categoría incluida
        return { ...product, category };
    }

    async update(id: ObjectId, updateProductDto: UpdateProductDto) {
        const product = await this.findOne(id)
        if (!product) return
        Object.assign(product, updateProductDto)
        if (updateProductDto.categoryId) {
            const category = await this.categoryRepository.findOneBy({ _id: new ObjectId(updateProductDto.categoryId) });
            if (!category) {
                let errors : string[] = []
                errors.push('La categoría no existe')
                throw new NotFoundException(errors);
            }
            product.categoryId = category._id
        }
        return await this.productRepository.save(product)
    }

    async remove(id: ObjectId) {
        const product = await this.findOne(id)
        if (!product) return
        await this.productRepository.remove(product)
        return {
            message: 'Eliminado correctamente'
        }
    }
}
