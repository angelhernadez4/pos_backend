import { Type } from "class-transformer";
import {  ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, Length, ValidateNested } from "class-validator";
import { ObjectId } from "typeorm";

export class TransactionContentsDto {
    @IsNotEmpty({ message: 'El ID del producto no puede estar vacío' })
    productId: ObjectId;

    @IsNotEmpty({ message: 'Cantidad no puede estar vacía' })
    @IsInt({ message: 'Cantidad no válida' }) // Validate quantity too
    quantity: number;

    @IsNotEmpty({ message: 'Precio no puede estar vacío' })
    @IsNumber({}, { message: 'Precio no válido' })
    price: number;
}

export class CreateTransactionDto {
    @IsNotEmpty({message: 'El total no puede ir vacio'})
    @IsNumber({}, {message: 'Cantidad no válida'})
    total: number

    @IsOptional()
    coupon: string

    @IsArray()
    @ArrayNotEmpty({message: 'Los contenidos no pueden ir vacios'})
    @ValidateNested()
    @Type(() => TransactionContentsDto)
    contents: TransactionContentsDto[]
}