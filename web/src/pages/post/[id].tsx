import { Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql"
import { useRouter } from "next/router";
import { Layout } from "../../components/layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient"
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post = ({}) => {
    const [{data, error, fetching}] = useGetPostFromUrl();

    if (fetching) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout>
                <div>{error.message}</div>
            </Layout>
        )
    }

    if (!data?.post) {
        return (
            <Layout>
                <div>post not found</div>
            </Layout>
        )
    }
    
    return (
        <Layout>
            <Heading mb={"4"}>
                {data.post.title}
            </Heading>
            {data.post.text}
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);