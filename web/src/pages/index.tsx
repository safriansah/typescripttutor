import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/layout";
import { NavBar } from "../components/navBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link';
import { useState } from "react";

const Index = () => {
    const [variables, setVariable] = useState({
        limit: 10,
        cursor: null as string | null
    })
    const [{data, fetching}] = usePostsQuery({
        variables
    });

    if (!fetching && !data) {
        return <div> You have no data</div>;
    }
    return (
        <>
            <Layout>
                <Flex display={"block"} mb="24px">
                    <Heading>Tutorial TypeScript</Heading>
                    <br />
                    <NextLink href={"/create-post"}>
                        <Link bg={"blue"} p={"2"} mt="24px" color={"white"} mb={"12px"}>
                            Create Post 
                        </Link>
                    </NextLink>
                </Flex>
                
                <Stack spacing={8}>
                {data?.posts.posts && !fetching ? data.posts.posts.map((p) => (
                    <Box key={p.id} p={5} shadow="md" borderWidth={"1px"}>
                        <Heading fontSize={"xl"}>{p.title}</Heading>
                        <Text mt={4}>{p.textSnippet}...</Text>
                    </Box>
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
