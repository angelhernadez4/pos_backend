import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ObjectId } from 'typeorm';
import { IdValidationPipe } from '../common/pipes/id-validation/id-validation.pipe';
import { GetCategoryQueryDto } from './dto/get-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto)
  }

  @Get('/firstId')
  findFirstCategory() {
    return this.categoriesService.findFirstCategory();
  }

  @Get()
  findAll(@Query() query: GetCategoryQueryDto) {
    const take = query.take ? query.take : 10
    const skip = query.skip ? query.skip : 0
    return this.categoriesService.findAll(take, skip);
  }

  @Get(':id')
  findOne(@Param('id', IdValidationPipe) id: ObjectId, @Query('products') products?: string) {
    return this.categoriesService.findOne(id, products);
  }

  @Patch(':id')
  update(@Param('id', IdValidationPipe) id: ObjectId, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', IdValidationPipe) id: ObjectId) {
    return this.categoriesService.remove(id);
  }
}
