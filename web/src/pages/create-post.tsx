import { Box, Flex, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import Link from "next/link";
import router, { useRouter } from "next/router";
import { useEffect } from "react";
import { InputField } from "../components/inputField";
import { Layout } from "../components/layout";
import { Wrapper } from "../components/wrapper"
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";
import { useIsAuth } from "../utils/useIsAuth";
import login from "./login";

export const CreatePost: React.FC<{}> = ({}) => {
    useIsAuth();
    const router = useRouter();
    const [_, CreatePost] = useCreatePostMutation();
    return(
        <Layout variant="small">
            <Formik 
            initialValues={{title: "", text: ""}} 
            onSubmit={async (values, {setErrors}) => {
                console.log(values);
                let { error } = await CreatePost({input: values});
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
                        Submit Post

                    </Button>
                </Form>
            )}

        </Formik>
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient)(CreatePost);