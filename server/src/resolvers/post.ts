import { title } from "process";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
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

@ObjectType()
class PaginatedPost {
    @Field(() => [Post])
    posts: Post[]

    @Field(() => Boolean)
    hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ) {
        return root.text.slice(0, 50);
    }

    @Mutation(() => Boolean)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number, 
        @Ctx() {req}: MyContext
    ) {
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const userId = req.session.UserId;

        await getConnection().query(`
            START TRANSACTION;

            insert into updoot("userId", "postId", "value") 
            values(${userId}, ${postId}, ${realValue});

            update post 
            set points = points + ${realValue}
            where id = ${postId};
            
            COMMIT;
        `)

        return true;
    }

    @Query(() => PaginatedPost)
    async posts(
        @Ctx() { em }: MyContext,
        @Arg("limit", () => Int, {nullable: true}) limit: number,
        @Arg("cursor", () => String, {nullable: true}) cursor: string | null
    ): Promise<PaginatedPost> {
        // await sleep(3000)
        // return em.find(Post, {});
        // return Post.find({});
        
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;

        const param: any[] = [realLimitPlusOne];
        if (cursor) {
            param.push(new Date(parseInt(cursor)));
        }

        const posts = await getConnection().query(`
            select p.*,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'email', u.email,
                'createdAt', u."createdAt",
                'updatedAt', u."updatedAt"
            ) as creator
            from post p
            inner join "user" u on u.id = p."creatorId"
            ${cursor ? `where p."createdAt" = $2` : ""}
            order by p."createdAt" DESC
            limit $1
        `, param);
        // console.log("post:: ", posts);
        
        // const qb = getConnection().getRepository(Post).createQueryBuilder("p").orderBy('p."createdAt"', "DESC").take(realLimitPlusOne).innerJoinAndSelect(
        //     "p.creator", "u", 'u.id = p."creatorId"'
        // );
        // if (cursor) {
        //     qb.where(
        //         'p."createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) }
        //     )
        // }

        // const posts = await qb.getMany();
        return {
            posts: posts,
            hasMore: posts.length === realLimitPlusOne
        }
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