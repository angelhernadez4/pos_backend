import { IsNotEmpty, IsNumber, IsString } from "class-validator"
import { ObjectId } from "mongodb"

export class CreateProductDto {
    @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
    @IsString({ message: 'Nombre no válido' })
    name: string

    @IsNotEmpty({ message: 'La imagen del producto es obligatorio' })
    image: string

    @IsNotEmpty({ message: 'El precio del producto es obligatorio' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Precio no válido' })
    price: number

    @IsNotEmpty({ message: 'La cantidad del producto es obligatorio' })
    @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Cantidad no válido' })
    inventory: number

    @IsNotEmpty({ message: 'La categoría del producto es obligatorio' })
    categoryId: ObjectId
}
