import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty({message: 'El nombre de la categoria es obligatorio'})
    name: string
}
