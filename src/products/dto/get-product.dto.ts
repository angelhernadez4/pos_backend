import { IsNumberString, IsOptional, Validate } from "class-validator";

export class GetProductsQueryDto {
    @IsOptional()
    category_id?: string;

    @IsOptional()
    @IsNumberString({}, { message : 'La cantidad debe ser un número' })
    take?: number;

    @IsOptional()
    @IsNumberString({}, { message : 'La categoría debe ser un número' })
    skip?: number;
}