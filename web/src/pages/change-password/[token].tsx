
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import router, { useRouter } from "next/router";
import { useState } from "react";
import { InputField } from "../../components/inputField";
import { Wrapper } from "../../components/wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";
import NextLink from "next/link";
import login from "../login";

const ChangePassword: NextPage = ({}) => {
    const [_, changePassword] = useChangePasswordMutation();
    const router = useRouter();
    const [tokenError, setTokenError] = useState("");
    return (
        // <div>{token}</div>
        <Wrapper variant='small'>
        <Formik 
            initialValues={{newPassword: ""}} 
            onSubmit={async (values, {setErrors}) => {
                console.log(values);
                let res = await changePassword({
                    newPassword: values.newPassword, 
                    token: typeof router.query.token === "string" ? router.query.token : "",
                });
                if (res.data?.changePassword.errors) {
                    const errorMap = toErrorMap(res.data.changePassword.errors)
                    if ("token" in errorMap) {
                        setTokenError(errorMap.token);
                    }
                    setErrors(toErrorMap(res.data.changePassword.errors));
                } else if (res.data?.changePassword.user) {
                    router.push("/");
                }
                console.log("res::", res);
                return;
            }}
        >
            {(isSubmitting)=>(
                <Form>
                    <Box mt={4} color={"red"}></Box>
                    <InputField
                        name='newPassword'
                        placeholder='New Password'
                        label='New Password'
                        type='password'
                    />
                    {
                    tokenError ?
                        <Box mt={4} color={"red"} display={"inline-block"}>
                            {tokenError}
                            <NextLink href={"/forgot-password"}>
                                <Link ml={2} color={"black"}>forgot password here</Link> 
                            </NextLink>
                        </Box> : 
                        null
                    }
                    <Box mt={4}></Box>
                    <Button mt={4} type="submit" isLoading={!isSubmitting} colorScheme="teal">
                        Change Password

                    </Button>
                </Form>
            )}

        </Formik>
        </Wrapper>
    )
}

// ChangePassword.getInitialProps = ({query}) => {
//     return {
//         token: query.token as string
//     }
// }

export default withUrqlClient(createUrqlClient)(ChangePassword)