import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_ID, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import ormconfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from 'cors';
import {ApolloServerPluginLandingPageGraphQLPlayground} from 'apollo-server-core';
import { sendEmail } from "./utils/sendEmail";
import { User } from "./entities/User";
import { createConnection } from "typeorm";

console.log("test 23");

const main = async () => {
    const conn = await createConnection({
       type: "postgres",
       database: "newtutor2",
       username: "admin",
       password: "1234",
       logging: true,
       synchronize: true,
       entities: [Post, User] 
    });
    // sendEmail("safriansah@dibimbing.id", "hello gaes");
    // const orm = await MikroORM.init(ormconfig);
    // await orm.em.nativeDelete(User, {});
    // await orm.getMigrator().up()
    
    // console.log("sql 1::");
    // let post = orm.em.create(Post, {
    //     title: "first post",
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    // });
    // await orm.em.persistAndFlush(post);
    // console.log("sql 2::");
    // await orm.em.nativeInsert(Post, {
    //     title: "second post"
    // });

    // const post = await orm.em.find(Post, {});
    // console.log("post::", post);
    
    const app = express();

    const RedisStore = connectRedis(session);
    // let redisClient = await createClient({ legacyMode: true });
    // redisClient.connect().catch(console.error);
    // console.log("redisClient::", redisClient);
    let redis = new Redis();
    
    app.use(
        session({
            name: COOKIE_ID,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000* 60* 60* 24* 365,
                httpOnly: true,
                secure: __prod__,
                sameSite: "lax"
            },
            saveUninitialized: false,
            secret: "qwertyuiop",
            resave: false
        })
    )
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground
        ],
        // context: ({ req, res }) => ({ em: orm.em, req, res, redis })
        context: ({ req, res }) => ({ req, res, redis })
    });

    await apolloServer.start();
    await apolloServer.applyMiddleware({app, cors: {
        origin: "http://localhost:3000",
        credentials: true
    }});

    // app.use(cors({
    //     origin: "http://localhost:3000",
    //     credentials: true,
    // }));

    app.get("/", (_, res) => {
        res.send("tes");
    });

    app.listen(4000, () => {
        console.log("server::4000");
    });
}

main().catch(error => {
    console.log("error::", error);
});