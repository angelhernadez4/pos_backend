import { Column, Entity, ObjectId, ObjectIdColumn } from "typeorm";

@Entity()
export class Product {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column({type: 'varchar', length: 60})
    name: string;

    @Column({type: 'varchar', length: 120, nullable: true})
    image: string = 'default.svg';

    @Column({type: 'decimal'})
    price: number;

    @Column({type: 'int'})
    inventory: number;

    @Column({ type: 'string' })
    categoryId: ObjectId;
}
