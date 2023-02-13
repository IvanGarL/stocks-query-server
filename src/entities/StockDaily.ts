import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

class ColumnNumericTransformer {
    to(data: number): number {
        return data;
    }

    from(data: string): number {
        if (data === null) return null;

        return Number(data);
    }
}

@Entity()
export class StockDaily {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * date when the stock was consulted
     */
    @Column()
    date: Date;

    /**
     * name of the stock
     */
    @Column({ length: 128 })
    name: string;

    /**
     * symbol of the stock
     */
    @Column({ length: 32 })
    @Index()
    symbol: string;

    /**
     * daily open price
     */
    @Column('numeric', { default: 0, transformer: new ColumnNumericTransformer() })
    open: number;

    /**
     * daily high price
     */
    @Column('numeric', { default: 0, transformer: new ColumnNumericTransformer() })
    high: number;

    /**
     * daily low price
     */
    @Column('numeric', { default: 0, transformer: new ColumnNumericTransformer() })
    low: number;

    /**
     * daily close price
     */
    @Column('numeric', { default: 0, transformer: new ColumnNumericTransformer() })
    close: number;

    /**
     * user linked to the stooq api request
     */
    @ManyToOne(
        () => User,
        u => u.stockRequestHistory,
    )
    @JoinColumn({ name: 'user_id' })
    user: User;

    /**
     * creation of the stock requested register
     */
    @CreateDateColumn()
    createdAt: Date;
}