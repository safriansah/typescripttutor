import React from 'react'
import {Formik, Form} from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, Button, Box } from '@chakra-ui/react';
import { Wrapper } from '../components/wrapper';
import { InputField } from '../components/inputField';
import { useMutation } from 'urql';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { isRequiredArgument } from 'graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) => {
    const router = useRouter();
    const [, register] = useRegisterMutation()
    return (
        <Wrapper variant='small'>
        <Formik 
            initialValues={{email: "", username: "", password: ""}} 
            onSubmit={async (values, {setErrors}) => {
                console.log(values);
                let reg = await register({ options: values })
                if (reg.data?.register.errors) {
                    setErrors(toErrorMap(reg.data.register.errors));
                } else if (reg.data?.register.user) {
                    router.push("/");
                }
                console.log("reg::", reg);
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
                        name='email'
                        placeholder='email'
                        label='email'
                        type='email'
                    />
                    <Box mt={4}></Box>
                    <InputField
                        name='password'
                        placeholder='Password'
                        label='Password'
                        type='password'
                    />
                    <Box mt={4}></Box>
                    <Button mt={4} type="submit" isLoading={!isSubmitting} colorScheme="teal">
                        Register
                    </Button>
                </Form>
            )}

        </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(Register)