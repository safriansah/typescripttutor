import { PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Entity, ManyToOne } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity{
    @Field(() => Int)
    // @PrimaryKey({ type: 'number' })
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    // @Property({
    //     type: 'text'
    // })
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field(() => String)
    // @Property({
    //     default: 'NOW()',
    //     type: 'date'
    // })
    @CreateDateColumn()
    createdAt = Date;

    @Field(() => String)
    // @Property({
    //     onUpdate: () => new Date(),
    //     type: 'date',
    //     nullable: true
    // })
    @UpdateDateColumn()
    updatedAt = Date;

    @Field()
    @Column({type: "int", default: 0})
    points: number;

    @Field()
    @Column()
    creatorId: number;

    @ManyToOne(() => User,(user) => user.posts)
    creator: User
}