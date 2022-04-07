import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        glob: '!(*.d).{js,ts}'
    },   
    entities: [Post, User],
    dbName: "newtutor",
    debug: !__prod__,
    user: "admin",
    password: "1234",
    type: "postgresql"
} as Parameters<typeof MikroORM.init>[0];