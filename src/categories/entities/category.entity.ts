import { Column, Entity, ObjectIdColumn, ObjectId } from "typeorm";

@Entity()
export class Category {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    name: string;

    @Column({ type: 'simple-array', default: [] }) // Se asegura de que products sea un array
    products: ObjectId[] = [];
}
