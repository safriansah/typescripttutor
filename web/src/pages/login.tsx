import React from 'react'
import {Formik, Form} from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, Button, Box, Link, Flex } from '@chakra-ui/react';
import { Wrapper } from '../components/wrapper';
import { InputField } from '../components/inputField';
import { useMutation } from 'urql';
import { useLoginMutation, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { isRequiredArgument } from 'graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from "next/link";

interface loginProps {

}

const Login: React.FC<loginProps> = ({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation()
    return (
        <Wrapper variant='small'>
        <Formik 
            initialValues={{username: "", password: ""}} 
            onSubmit={async (values, {setErrors}) => {
                console.log(values);
                let res = await login({user: values.username, pass: values.password});
                if (res.data?.login.errors) {
                    setErrors(toErrorMap(res.data.login.errors));
                } else if (res.data?.login.user) {
                    router.push("/");
                }
                console.log("res::", res);
                return;
            }}
        >
            {(isSubmitting)=>(
                <Form>
                    <InputField
                        name='username'
                        placeholder='Username'
                        label='Username'
                    />
                    <Box mt={4}></Box>
                    <InputField
                        name='password'
                        placeholder='Password'
                        label='Password'
                        type='password'
                    />
                    <Box mt={4}></Box>
                    <Flex>
                        <NextLink href={"/forgot-password"}>
                            <Link ml={"auto"} color={"black"}>forgot password</Link> 
                        </NextLink>    
                    </Flex>
                    
                    <Button mt={4} type="submit" isLoading={!isSubmitting} colorScheme="teal">
                        Login

                    </Button>
                </Form>
            )}

        </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(Login)