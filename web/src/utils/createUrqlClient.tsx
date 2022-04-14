import { dedupExchange, fetchExchange, gql, ssrExchange, stringifyVariables } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation, VoteMutationVariables, DeletePostMutationVariables } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { cacheExchange, query, Resolver, Cache } from '@urql/exchange-graphcache';

import {filter, pipe, tap} from 'wonka';
import {Exchange} from 'urql';
import Router from "next/router";
import { isServer } from "./isServer";

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

function invalidateAllPost(cache: Cache) {
    const allFields = cache.inspectFields("Query");
    const fieldInfos = allFields.filter(
        (info) => info.fieldName === "posts"
    )
    fieldInfos.forEach((fi) => {
        cache.invalidate("Query", "post", fi.arguments || {});
    })
}
export const createUrqlClient = (ssrExchange: any, ctx: any) => {
    let cookie = "";
    if (isServer()) {
        // console.log("ctx.req.headers.cookie::", ctx.req.headers.cookie);
        cookie = ctx?.req?.headers?.cookie;
    }
    return {
        url: 'http://localhost:4000/graphql',
        fetchOptions: {
            credentials: "include" as const,
            headers: cookie ? { cookie } : undefined
        },
        exchanges: [
            dedupExchange, 
            cacheExchange({
                keys: {
                    PaginatedPost: () => null
                },
                resolvers: {
                    Query: {
                        posts: cursorPagination(),
                    }
                },
                updates: {
                    Mutation: {
                        deletePost: (_result, args, cache, info) => { 
                            cache.invalidate({
                                __typename: "Post",
                                id: (args as DeletePostMutationVariables).id
                            })
                        },
                        vote: (_result, args, cache, info) => { 
                            const {postId, value} = args as VoteMutationVariables;
                            const data = cache.readFragment(
                                gql`
                                    fragment _ on Post {
                                        id
                                        points
                                        voteStatus
                                    }
                                `,
                                { id: postId } as any
                            ); // Data or null
                            console.log("data::", data);
                            
                            if (data) {
                                if (data.voteStatus === value) {
                                    return;
                                }
                                const newPoint = (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                                console.log("newPoint::", newPoint);
                                
                                cache.writeFragment(
                                    gql`
                                        fragment __ on Post {
                                            points
                                            voteStatus
                                        }
                                    `,
                                    { id: postId, points: newPoint, voteStatus: value } as any
                                );
                            }
                        },
                        createPost: (_result, args, cache, info) => { 
                            // const allFields = cache.inspectFields("Query");
                            // const fieldInfos = allFields.filter(
                            //     (info) => info.fieldName === "posts"
                            // )
                            // fieldInfos.forEach((fi) => {
                            //     cache.invalidate("Query", "post", fi.arguments || {});
                            // })
                            invalidateAllPost(cache);
                        },
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
                            invalidateAllPost(cache);
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
            }), 
            errorExchange, 
            ssrExchange, 
            fetchExchange
        ],
    };
};

const cursorPagination = (cursorArgument = 'cursor' ): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;
    
        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        const isItInTheCache = cache.resolve(
            cache.resolve(entityKey, fieldKey) as string, 
            "post"
        );
        info.partial = !isItInTheCache;
        let results: string[] = [];
        let hasMore = true;
        fieldInfos.forEach(fi => {
            const key = cache.resolve(entityKey, fi.fieldKey) as string;
            const data = cache.resolve(key, "posts") as string[];
            const _hasMore = cache.resolve(key, "hasMore");
            if (!_hasMore) {
                hasMore = _hasMore as boolean;
            }
            results.push(...data);
        }) 
        
        return {
            __typename: "PaginatedPost",
            hasMore,
            posts: results
        }
  
    //   const visited = new Set();
    //   let result: NullArray<string> = [];
    //   let prevOffset: number | null = null;
  
    //   for (let i = 0; i < size; i++) {
    //     const { fieldKey, arguments: args } = fieldInfos[i];
    //     if (args === null || !compareArgs(fieldArgs, args)) {
    //       continue;
    //     }
  
    //     const links = cache.resolve(entityKey, fieldKey) as string[];
    //     const currentOffset = args[offsetArgument];
  
    //     if (
    //       links === null ||
    //       links.length === 0 ||
    //       typeof currentOffset !== 'number'
    //     ) {
    //       continue;
    //     }
  
    //     const tempResult: NullArray<string> = [];
  
    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       tempResult.push(link);
    //       visited.add(link);
    //     }
  
    //     if (
    //       (!prevOffset || currentOffset > prevOffset) ===
    //       (mergeMode === 'after')
    //     ) {
    //       result = [...result, ...tempResult];
    //     } else {
    //       result = [...tempResult, ...result];
    //     }
  
    //     prevOffset = currentOffset;
    //   }
  
    //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    //   if (hasCurrentPage) {
    //     return result;
    //   } else if (!(info as any).store.schema) {
    //     return undefined;
    //   } else {
    //     info.partial = true;
    //     return result;
    //   }
    };
};