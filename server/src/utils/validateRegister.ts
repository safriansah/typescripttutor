import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
    if (options.username.length <= 2) {
        return {
            errors: [{
                field: "username",
                message: "required"
            }]
        }
    }

    if (options.username.includes("@")) {
        return {
            errors: [{
                field: "username",
                message: "notaccepted"
            }]
        }
    }
    
    if (options.password.length <= 2) {
        return {
            errors: [{
                field: "password",
                message: "required"
            }]
        }
    }

    if (options.email.length <= 2) {
        return {
            errors: [{
                field: "email",
                message: "required"
            }]
        }
    }

    return null
}