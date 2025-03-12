import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ObjectId } from 'mongodb';
import { IdValidationPipe } from '../common/pipes/id-validation/id-validation.pipe';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { GetCouponQueryDto } from './dto/get-coupon.dto';

@Controller('coupons')
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) {}

    @Post()
    create(@Body() createCouponDto: CreateCouponDto) {
        return this.couponsService.create(createCouponDto);
    }

    @Get()
    findAll(@Query() query: GetCouponQueryDto) {
        const take = query.take ? query.take : 10
        const skip = query.skip ? query.skip : 0
        return this.couponsService.findAll(take, skip);
    }

    @Get(':id')
    findOne(@Param('id', IdValidationPipe) id: ObjectId) {
        return this.couponsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', IdValidationPipe) id: ObjectId, @Body() updateCouponDto: UpdateCouponDto) {
        return this.couponsService.update(id, updateCouponDto);
    }

    @Delete(':id')
    remove(@Param('id', IdValidationPipe) id: ObjectId) {
        return this.couponsService.remove(id);
    }

    @Post('/apply-coupon')
    @HttpCode(HttpStatus.OK)
    applyCoupon(@Body() applyCouponDto : ApplyCouponDto) {
        return this.couponsService.applyCoupon(applyCouponDto.coupon_name)
    }
}
