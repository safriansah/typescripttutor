import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import router, { useRouter } from "next/router";
import { InputField } from "../../../components/inputField";
import { Layout } from "../../../components/layout";
import { usePostQuery, usePostsQuery, useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";
import { CreatePost } from "../../create-post";

const EditPost = ({}) => {
    const intId = useGetIntId();
    const [{data, error, fetching}] = useGetPostFromUrl();
    const [_, updatePost] = useUpdatePostMutation();
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
        <Layout variant="small">
            <Formik 
            initialValues={{title: data.post.title, text: data.post.text}} 
            onSubmit={async (values, {setErrors}) => {
                console.log(values);
                let { error } = await updatePost({id: intId, ...values});
                if (!error) {
                    router.push("/");
                }
                return;
            }}
        >
            {(isSubmitting)=>(
                <Form>
                    <InputField
                        textarea={false}
                        name='title'
                        placeholder='Title'
                        label='Title'
                    />
                    <Box mt={4}></Box>
                    <InputField
                        textarea={true}
                        name='text'
                        placeholder='Text'
                        label='Text'
                        type='textarea'
                    />
                    <Box mt={4}></Box>
                    
                    
                    <Button mt={4} type="submit" isLoading={!isSubmitting} colorScheme="teal">
                        Update Post

                    </Button>
                </Form>
            )}

            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(EditPost);