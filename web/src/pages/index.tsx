import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/layout";
import { NavBar } from "../components/navBar";
import { useDeletePostMutation, useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link';
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { UpdootSection } from "../components/updootSection"

const Index = () => {
    const [variables, setVariable] = useState({
        limit: 10,
        cursor: null as string | null
    })
    const [{data, fetching}] = usePostsQuery({
        variables
    });
    const [_, deletePost] = useDeletePostMutation();

    if (!fetching && !data) {
        return <div> You have no data</div>;
    }
    const [{ data: meData }] = useMeQuery();
    return (
        <>
            <Layout>
                {/* <Flex display={"block"} mb="24px">
                    <Heading>Tutorial TypeScript</Heading>
                    <br />
                    
                </Flex> */}
                
                <Stack spacing={8}>
                {data?.posts.posts && !fetching ? data.posts.posts.map((p) => !p ? null : (
                    <Flex key={p.id} p={5} shadow="md" borderWidth={"1px"}>
                        <UpdootSection post={p}></UpdootSection>
                        <Box flex={1}>
                            <NextLink href={"/post/[id]"} as={"/post/" + p.id}>
                                <Link>
                                    <Heading fontSize={"xl"}>{p.title}</Heading>
                                </Link>
                            </NextLink>
                            <Text>Posted By {p.creator.username}</Text>
                            <Flex align={"center"}>
                                <Text flex={1} mt={4}>{p.textSnippet}...</Text>
                                {meData?.me?.id !== p.creator.id ? null : (
                                    <Box ml={"auto"}>
                                        <NextLink href={"/post/edit/{id}"} as={"/post/edit/" + p.id}>
                                            <Link>
                                                <IconButton colorScheme={"green"} icon={<EditIcon />} mr="4px" aria-label={"Edit Post"}
                                                onClick={() => {
                                                    
                                                }}>Edit Post</IconButton>    
                                            </Link>
                                        </NextLink>
                                        
                                        <IconButton colorScheme={"red"} icon={<DeleteIcon />} aria-label={"Delete Post"}
                                        onClick={() => {
                                            deletePost({
                                                id: p.id
                                            })
                                        }}>Delete Post</IconButton>
                                    </Box>
                                )} 
                            </Flex>
                        </Box>
                    </Flex>
                )) : "loading..."}
                </Stack>
                {
                    data && data.posts.hasMore ? (
                        <Flex align={"center"}>
                            <Button mx={"auto"} my="24px" isLoading={fetching} onClick={() => {
                                setVariable({
                                    limit: variables.limit,
                                    cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
                                })
                            }}>
                                Load More
                            </Button>
                        </Flex>
                    ) : (
                        <Text mt={"24px"}></Text>
                    )
                }
                
            </Layout>
        </>
    )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index)
