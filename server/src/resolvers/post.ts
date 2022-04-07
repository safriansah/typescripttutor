import { title } from "process";
import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { sleep } from "../utils/sleep";

@InputType()
export class PostInput {
    @Field(() => String)
    title!: string;

    @Field(() => String)
    text: string;
}


@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(
        @Ctx() { em }: MyContext
    ): Promise<Post[]> {
        await sleep(3000)
        // return em.find(Post, {});
        return Post.find({});
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg("identifier", () => Int) id: number,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        // return em.findOne(Post, { id })
        return Post.findOne({where: {id}});
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input", () => PostInput, { nullable: true }) input: PostInput,
        @Ctx() { em, req }: MyContext
    ): Promise<Post | null> {
        // const post = em.create(Post, { 
        //     title: title,
        //     createdAt: new Date(),
        //     updatedAt: new Date() 
        // })
        // await em.persistAndFlush(post);
        // return post;
        // return Post.create({
        //     ...input,
        //     creatorId: req.session.UserId
        // }).save();
        let result = await getConnection().createQueryBuilder().insert().into(Post).values({
            ...input,
            creatorId: req.session.UserId
        }).returning("*").execute();
        return result.raw[0];
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String, { nullable: true }) title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        // const post = await em.findOne(Post, {id});
        // if (!post) {
        //     return null
        // }
        // if (title) {
        //     post.title = title;
        //     await em.persistAndFlush(post);
        // }
        const post = await Post.findOne({where: {id: id}});
        if (!post) {
            return null
        }

        if (typeof title !== "undefined") {
            await Post.update({id}, {title});
        }
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { em }: MyContext
    ): Promise<boolean> {
        // await em.nativeDelete(Post, {id});
        await Post.delete(id);
        return true
    }
}