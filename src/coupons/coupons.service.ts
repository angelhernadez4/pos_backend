import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { endOfDay, isAfter } from 'date-fns';

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(Coupon) private readonly couponRepository: Repository<Coupon>
    ) {}
    create(createCouponDto: CreateCouponDto) {
        this.couponRepository.save(createCouponDto)
        return {
            success: true,
            message: 'Cupón creado correctamente'
        }
    }

    async findAll(take: number = 10, skip: number = 0) {
        take = parseInt(take as any, 10) || 10;
        skip = parseInt(skip as any, 0) || 0;

        const [coupons, total] = await this.couponRepository.findAndCount({
            take,
            skip
        })
        return { coupons, total };
    }

    async findOne(id: ObjectId) {
        const coupon = await this.couponRepository.findOneBy({_id: id})
        if (!coupon) {
            throw new NotFoundException(`El cupon con el id: ${id} no fue encontrado`)
        }
        return coupon
    }

    async update(id: ObjectId, updateCouponDto: UpdateCouponDto) {
        const coupon = await this.findOne(id)
        if (!coupon) {
            throw new NotFoundException(`El cupon con el id: ${id} no fue encontrado`)
        }
        Object.assign(coupon, updateCouponDto)
        await this.couponRepository.save(coupon)
        return {
            success: true,
            message: 'Cupón actualizado correctamente'
        }
    }

    async remove(id: ObjectId) {
        const coupon = await this.findOne(id)
        if (!coupon) {
            throw new NotFoundException(`El cupon con el id: ${id} no fue encontrado`)
        }
        await this.couponRepository.remove(coupon)
        return {
            success: true,
            message: 'Cupón eliminado correctamente'
        }
    }

    async applyCoupon(name: string) {
        const coupon = await this.couponRepository.findOneBy({name})
        if (!coupon) {
            throw new NotFoundException(`El cupon: ${name} no fue encontrado`)
        }
        const currentDate = new Date()

        const expirationDate = endOfDay(coupon.expirationDate)

        if (isAfter(currentDate, expirationDate)) {
            throw new UnprocessableEntityException('Cupón ya expirado')
        }
        return {
            success: true,
            message: 'Cupón válido',
            ...coupon
        }
    }
}
