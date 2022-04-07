import { dedupExchange, fetchExchange, ssrExchange } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { cacheExchange, query } from '@urql/exchange-graphcache';

import {filter, pipe, tap} from 'wonka';
import {Exchange} from 'urql';
import Router from "next/router";

export const errorExchange: Exchange = ({ forward }) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({error})=> {
            if (error?.message.includes("unauthorize")) {
                Router.replace("/login");
            }
        }) 
    )
}

export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
        credentials: "include" as const
    },
    exchanges: [dedupExchange, cacheExchange({
        updates: {
            Mutation: {
                logout: (_result, args, cache, info) => {
                    betterUpdateQuery<LogoutMutation, MeQuery>(
                        cache,
                        {query: MeDocument},
                        _result,
                        () => ({ me: null})
                    )
                },
                login: (_result, args, cache, info) => {
                    // cache.updateQuery({query: MeDocument}, (data: MeQuery) => {});
                    betterUpdateQuery<LoginMutation, MeQuery>(cache, {query: MeDocument}, _result, (result, query) => {
                        if (result.login.errors) {
                            return query;
                        } else {
                            return {
                                me: result.login.user
                            }
                        }
                    })
                },
                register: (_result, args, cache, info) => {
                    // cache.updateQuery({query: MeDocument}, (data: MeQuery) => {});
                    betterUpdateQuery<RegisterMutation, MeQuery>(cache, {query: MeDocument}, _result, (result, query) => {
                        if (result.register.errors) {
                            return query;
                        } else {
                            return {
                                me: result.register.user
                            }
                        }
                    })
                }
            }
        }
    }), errorExchange, ssrExchange, fetchExchange],
})