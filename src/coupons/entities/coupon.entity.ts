import { ObjectId } from "mongodb";
import { Column, CreateDateColumn, Entity, ObjectIdColumn } from "typeorm";

@Entity()
export class Coupon {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column({type: 'varchar', length: 30})
    name: string

    @Column({type: 'int'})
    percentage: number

    @Column()
    expirationDate: Date
}
