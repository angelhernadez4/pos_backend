import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class IdValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!ObjectId.isValid(value)) {
            throw new BadRequestException(`El ID proporcionado no es válido.`);
        }
        return ObjectId.createFromHexString(value);
    }
}
