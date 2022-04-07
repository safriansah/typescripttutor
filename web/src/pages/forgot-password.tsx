import React, { useState } from 'react'
import {Formik, Form} from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, Button, Box } from '@chakra-ui/react';
import { Wrapper } from '../components/wrapper';
import { InputField } from '../components/inputField';
import { useMutation } from 'urql';
import { useForgotPasswordMutation, useLoginMutation, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { isRequiredArgument } from 'graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface forgotPasswordProps {

}

const ForgotPassword: React.FC<forgotPasswordProps> = ({}) => {
    const router = useRouter();
    const [, forgotPassword] = useForgotPasswordMutation();
    const [complete, setComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    return (
        <Wrapper variant='small'>
        <Formik 
            initialValues={{email: ""}} 
            onSubmit={async (values, {setErrors}) => {
                console.log(values);
                setLoading(true);
                setComplete(false);
                let res = await forgotPassword({email: values.email});
                if (res.data?.forgotPassword) {
                    setComplete(true);
                    setLoading(false);
                } 
                console.log("res::", res);
                return;
            }}
        >
            {(isSubmitting)=>(
                <Form>
                    <InputField
                        name='email'
                        placeholder='email'
                        label='Email'
                    />
                    <Box mt={4}></Box>
                    <Button mt={4} type="submit" isLoading={loading} colorScheme="teal">
                        Forgot Password

                    </Button>
                    <Box mt={4}></Box>
                    {complete ? "Check Your Email for Reset Password" : ""}
                </Form>
            )}

        </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)