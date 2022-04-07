import { title } from "process";
import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from 'argon2';
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_ID, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { v4 } from "uuid";
import { sendEmail } from "../utils/sendEmail";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
    @Field(() => String)
    field!: string;

    @Field(() => String)
    message!: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { em, req }: MyContext
    ): Promise<User | null> {
        // console.log("req.session::", req.session);
        
        if (!req.session.UserId) {
            return null;
        }
        // const user = await em.findOne(User, {id: req.session.UserId});
        const user = await User.findOne({where: {id: req.session.UserId}});
        return user;
    }

    // @Query(() => Post, { nullable: true })
    // post(
    //     @Arg("identifier", () => Int) id: number,
    //     @Ctx() { em }: MyContext
    // ): Promise<Post | null> {
    //     return em.findOne(Post, { id })
    // }
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("newPassword", () => String) newPassword: string,
        @Arg("token", () => String) token: string,
        @Ctx() {em, redis, req}: MyContext
    ) {
        if (newPassword.length < 2) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "required"
                    }
                ]
            }
        }

        if (token.length < 2) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "required"
                    }
                ]
            }
        }

        const key = FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key)
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "notfound"
                    }
                ]
            }
        }

        // let user = await em.findOne(User, {id: parseInt(userId)})
        let user = await User.findOne({where: {id: parseInt(userId)}});
        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "notfound"
                    }
                ]
            }
        }

        // user.password = await argon2.hash(newPassword);
        // await em.persistAndFlush(user);
        await User.update({id: parseInt(userId)}, {password: await argon2.hash(newPassword)})
        req.session.UserId = user.id;

        await redis.del(key)

        return {user}
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email", () => String) email: string,
        @Ctx() {em, redis}: MyContext
    ) {
        // const user = await em.findOne(User, {email})
        const user = await User.findOne({where: {email: email}});
        if (!user) {
            return true
        }

        const token = v4();
        await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "EX", 1000 * 60 *60 * 1);

        await sendEmail(
            user.email,
            '<a href="http:/localhost:3000/change-password/' + token + '">reset password<a>'
        )
        return true;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        let response = validateRegister(options);
        if (response) {
            return response;
        }

        const hashedpass = await argon2.hash(options.password);
        let user;

        try {
            let result = await getConnection().createQueryBuilder().insert().into(User).values({
                username: options.username.toLocaleLowerCase(),
                password: hashedpass,
                email: options.email.toLocaleLowerCase(),
            }).returning("*").execute();
            user = result.raw[0];
            // const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
            //     username: options.username.toLocaleLowerCase(),
            //     password: hashedpass,
            //     email: options.email.toLocaleLowerCase(),
            //     created_at: new Date(),
            //     updated_at: new Date()
            // }).returning("*");
            // user = result[0];
            
            // user = em.create(User, { 
            //     username: options.username.toLocaleLowerCase(),
            //     password: hashedpass,
            //     createdAt: new Date(),
            //     updatedAt: new Date()
            // })
            // await em.persistAndFlush(user); 
            
            req.session.UserId = user.id;   
        } catch (error) {
            if (error.code == "23505") {
                return {
                    errors: [{
                        field: "username",
                        message: "already exist"
                    }]
                }
            }
            else {
                return {
                    errors: [{
                        field: "undefined",
                        message: JSON.stringify(error)
                    }]
                }
            }
        }

        return {
            user: user
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail", () => String) usernameOrEmail: string,
        @Arg("password", () => String) password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> { 
        // const user = await em.findOne(User, usernameOrEmail.includes("@") ? {
        //     email: usernameOrEmail.toLocaleLowerCase()
        // } : {
        //     username: usernameOrEmail.toLocaleLowerCase()
        // })
        const user = await User.findOne(
            usernameOrEmail.includes("@") ? {
                where: {email: usernameOrEmail.toLocaleLowerCase()}
            } : {
                where: {username: usernameOrEmail.toLocaleLowerCase()}
        })
        // console.log("user::", user);
        
        if (!user) {
            return {
                errors: [{
                    field: "username",
                    message: "notfound"
                }]
            }
        }

        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "notfound"
                }]
            }
        }

        req.session.UserId = user.id;

        return {
            user: user
        };
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ) {
        return new Promise((resolve) => {
            req.session.destroy((err) => {
                res.clearCookie(COOKIE_ID);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }

                resolve(true);
            })
        })
    }
}