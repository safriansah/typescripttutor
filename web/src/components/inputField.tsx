import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import { FormControl, FormLabel, Input, FormErrorMessage, Textarea } from '@chakra-ui/react';

type InputFieldProps = InputHTMLAttributes<HTMLElement> & {
    name: string;
    label: string;
    placeholder: string;
    textarea?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({ 
    label, 
    size: _,
    textarea,
    ...props
}) => {
    const [field, {error}] = useField(props);
    let InputOrTextarea = Input;
    if (textarea) {
        InputOrTextarea = Textarea;
    }
    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <InputOrTextarea {...field} id={field.name} {...props}/>
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    )
};

