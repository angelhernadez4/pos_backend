import { ObjectId } from "mongodb";
import { Column, CreateDateColumn, Entity, ObjectIdColumn } from "typeorm";

@Entity()
export class Transaction {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column('decimal')
    total: number

    @Column({ type: 'varchar', length: 30, nullable: true })
    coupon: string

    @Column({ type: 'decimal', nullable: true, default: 0 })
    discount: number
    
    @CreateDateColumn()
    transactionDate: Date

    @Column()
    contents: TransactionContents[]
}

@Entity()
export class TransactionContents {
    @ObjectIdColumn()
    _id: number

    @Column('int')
    quantity: number

    @Column('decimal')
    price: number

    @Column()
    productId : ObjectId

    @Column()
    transactionId : ObjectId
}
