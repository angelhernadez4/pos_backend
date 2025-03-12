import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ObjectId } from 'mongodb';
import { isValid, parseISO } from 'date-fns';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(TransactionContents) private readonly transactionContentsRepository: Repository<TransactionContents>,
        @InjectRepository(Product) private readonly productRepository: Repository<Product>,
        private readonly couponService: CouponsService
    ) { }
    async create(createTransactionDto: CreateTransactionDto) {
        await this.productRepository.manager.transaction(async (transactionEntityManager) => {
            const transaction = new Transaction()
            const total = createTransactionDto.contents.reduce((total, item) => total + (item.quantity * item.price), 0)
            transaction.total = total
            transaction.contents = [] // Inicializamos el array de contenidos

            if (createTransactionDto.coupon) {
                const coupon = await this.couponService.applyCoupon(createTransactionDto.coupon)
                const discount = (coupon.percentage / 100) * total
                transaction.discount = discount
                transaction.coupon = coupon.name
                transaction.total -= discount
            }

            // Validamos que todos los productos tengan stock suficiente antes de guardar
            for (const contents of createTransactionDto.contents) {
                const product = await transactionEntityManager.findOneBy(Product, { _id: new ObjectId(contents.productId) })
                const errors: string[] = []
                if (!product) {
                    errors.push(`El producto con ID ${contents.productId} no existe`)
                    throw new BadRequestException(errors)
                }

                if (contents.quantity > product.inventory) {
                    errors.push(`El artículo ${product.name} excede la cantidad disponible`)
                    throw new BadRequestException(errors)
                }
            }

            // Si pasó todas las validaciones, guardamos la transacción
            await transactionEntityManager.save(transaction)

            for (const contents of createTransactionDto.contents) {
                const product = await transactionEntityManager.findOneBy(Product, { _id: new ObjectId(contents.productId) })
                if (!product) return
                // Restamos el inventario
                product.inventory -= contents.quantity
                await transactionEntityManager.save(product)

                // Creamos el contenido de la transacción solo con los campos necesarios
                const transactionContent = new TransactionContents()
                transactionContent.quantity = contents.quantity
                transactionContent.price = contents.price
                transactionContent.productId = product._id
                transactionContent.transactionId = transaction._id

                await transactionEntityManager.save(transactionContent)

                // Agregamos el contenido a la lista de la transacción
                transaction.contents.push(transactionContent)
            }

            // Guardamos la transacción con sus contenidos
            await transactionEntityManager.save(transaction)
        })

        return {
            success: true,
            message: 'Venta almacenada correctamente'
        }
    }

    async findAll(transactionDate?: string) {
        let query = {}

        if (transactionDate) {
            const date = parseISO(transactionDate)
            if (!isValid(date)) {
                throw new BadRequestException('Fecha no válida')
            }

            // Ajustamos la fecha para filtrar solo por día completo (desde las 00:00 hasta las 23:59)
            const startOfDay = new Date(date.setHours(0, 0, 0, 0))
            const endOfDay = new Date(date.setHours(23, 59, 59, 999))

            query = {
                transactionDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }
        }

        const transactions = await this.transactionRepository.find({ where: query })

        await Promise.all(
            transactions.map(async (transaction) => {
                transaction.contents = await Promise.all(
                    transaction.contents.map(async (content) => {
                        const product = await this.productRepository.findOneBy({
                            _id: new ObjectId(content.productId)
                        })
                        return { ...content, product }
                    })
                )
            })
        )

        return transactions
    }


    async findOne(id: ObjectId) {
        const transaction = await this.transactionRepository.findOneBy({ _id: id })
        if (!transaction) {
            throw new NotFoundException('La transacción no existe');
        }
        
        transaction.contents = await Promise.all(
            transaction.contents.map(async (content) => {
                const product = await this.productRepository.findOneBy({
                    _id: new ObjectId(content.productId)
                })
                return { ...content, product }
            })
        )

        return transaction
    }

    update(id: number, updateTransactionDto: UpdateTransactionDto) {
        return `This action updates a #${id} transaction`;
    }

    async remove(id: ObjectId) {
        const transaction = await this.transactionRepository.findOneBy({ _id: id })
        if (!transaction) return 
        for (const contents of transaction.contents) {
            const product = await this.productRepository.findOneBy({_id : contents.productId})
            if (!product) return
            product.inventory += contents.quantity
            await this.productRepository.save(product)
            const transactionContents = await this.transactionContentsRepository.findOneBy({ _id: contents._id })
            if (!transactionContents) return
            await this.transactionContentsRepository.remove(transactionContents)
        }
        await this.transactionRepository.remove(transaction)
        return {
            success: true,
            message: 'Eliminado correctamente'
        }
    }
}
