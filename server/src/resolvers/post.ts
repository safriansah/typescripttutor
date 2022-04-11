import { tmpdir } from "os";
import { title } from "process";
import { text } from "stream/consumers";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { Updoot } from "../entities/Updoot";
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

        const updoot = await Updoot.findOne({
            "where": { userId, postId }
        })
        console.log("updoot::", updoot);
        
        if (updoot && updoot.value !== realValue) {
            await getConnection().transaction(async tm => {
                await tm.query(`
                    update updoot set value = $1 where "postId" = $2 and "userId" = $3;
                `, [realValue, postId, userId]);
                await tm.query(`
                    update post 
                    set points = points + $1
                    where id = $2;
                `, [2 * realValue, postId])
            })
        } else if (!updoot) {
            await getConnection().transaction(async tm => {
                await tm.query(`
                    insert into updoot("userId", "postId", "value") values($1, $2, $3);
                `, [userId, postId, realValue]);

                await tm.query(`
                    update post 
                    set points = points + $1
                    where id = $2;
                `, [realValue, postId])
            })

        }
        // await getConnection().query(`
        //     START TRANSACTION;

        //     insert into updoot("userId", "postId", "value") 
        //     values(${userId}, ${postId}, ${realValue});

        //     update post 
        //     set points = points + ${realValue}
        //     where id = ${postId};
            
        //     COMMIT;
        // `)

        return true;
    }

    @Query(() => PaginatedPost)
    async posts(
        @Ctx() { em, req }: MyContext,
        @Arg("limit", () => Int, {nullable: true}) limit: number,
        @Arg("cursor", () => String, {nullable: true}) cursor: string | null
    ): Promise<PaginatedPost> {
        // await sleep(3000)
        // return em.find(Post, {});
        // return Post.find({});
        
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;

        const param: any[] = [realLimitPlusOne];
        console.log("req.session.UserId::", req.session.UserId);
        
        if (req.session.UserId) {
            param.push(req.session.UserId)
        }

        let cursorIndex = 3;
        if (cursor) {
            param.push(new Date(parseInt(cursor)));
            cursorIndex = param.length;
        }

        const posts = await getConnection().query(`
            select p.*,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'email', u.email,
                'createdAt', u."createdAt",
                'updatedAt', u."updatedAt"
            ) as creator,
            ${
                req.session.UserId ? '(select value from updoot where "userId" = $2 and "postId" = p.id)' : 'null'
            } as "voteStatus"
            from post p
            inner join "user" u on u.id = p."creatorId"
            ${cursor ? `where p."createdAt" < $${cursorIndex}` : ""}
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
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne
        }
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg("identifier", () => Int) id: number,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        // return em.findOne(Post, { id })
        return Post.findOne({where: {id}, relations: ["creator"]});
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
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String, { nullable: true }) title: string,
        @Arg("text", () => String, { nullable: true }) text: string,
        @Ctx() { em, req }: MyContext
    ): Promise<Post | null> {
        // const post = await em.findOne(Post, {id});
        // if (!post) {
        //     return null
        // }
        // if (title) {
        //     post.title = title;
        //     await em.persistAndFlush(post);
        // }
        // const post = await Post.findOne({where: {id: id}});
        // if (!post) {
        //     return null
        // }

        // if (typeof title !== "undefined") {
        //     await Post.update({id}, {title, text});
        // }
        const result = await getConnection().createQueryBuilder().update(Post).set({
            title,
            text
        }).where('id = :id and "creatorId" = :creatorId', {id, creatorId: req.session.UserId}).returning("*").execute();
        console.log("result::", result);
        
        return result.raw[0];
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { em, req }: MyContext
    ): Promise<boolean> {
        // await em.nativeDelete(Post, {id});
        const post = await Post.findOne({where: {id}});
        if (!post) {
            return false;
        }
        if (post.creatorId !== req.session.UserId) {
            throw new Error("Unauthorize")
        }
        await Post.delete({id});
        // await Post.delete({id, creatorId: req.session.UserId});
        return true
    }
}