import { IsNumberString, IsOptional } from "class-validator";

export class GetCategoryQueryDto {
    @IsOptional()
    @IsNumberString({}, { message: 'La cantidad debe ser un número' })
    take?: number;

    @IsOptional()
    @IsNumberString({}, { message: 'Skip debe ser un número' })
    skip?: number;
}