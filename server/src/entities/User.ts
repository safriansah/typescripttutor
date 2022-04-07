import { PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Entity, OneToMany } from "typeorm";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity{
    @Field(() => Int)
    // @PrimaryKey({ type: 'number' })
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    // @Property({
    //     type: 'text',
    //     unique: true
    // })
    @Column({
        unique: true,
    })
    username!: string;

    @Field(() => String)
    // @Property({
    //     type: 'text',
    //     unique: true
    // })
    @Column({
        unique: true
    })
    email!: string;

    @Field(() => String)
    // @Property({
    //     type: 'text'
    // })
    @Column()
    password!: string;

    @Field(() => String)
    // @Property({
    //     default: 'NOW()',
    //     type: 'date'
    // })
    @CreateDateColumn()
    createdAt = Date;

    @Field(() => String, {
        nullable: true
    })
    // @Property({
    //     onUpdate: () => new Date(),
    //     type: 'date',
    //     nullable: true
    // })
    @UpdateDateColumn()
    updatedAt = Date;

    @OneToMany(() => Post, (post) => post.creator)
    posts: Post[]
}