import { LoginFormProps } from "../../components/login-form";

export function validateLogin(formData: LoginFormProps): string[] {
    const errors: string[] = [];

    if (!formData.email || !formData.password) {
        errors.push("Email and password are required");
        return errors;
    }

    _validateEmail(formData.email, errors);
    _validatePassword(formData.password, errors);

    return errors;
}

function _validateEmail(email: string, errors: string[]){
    const re = /\S+@\S+\.\S+/;

    if (email === undefined || email === "") {
        errors.push("Email is required");
        return false;
    }else if (!re.test(email)) {
        errors.push("Invalid email address");
        return false;
    }
}

function _validatePassword(password: string, errors: string[]){
    if (password === undefined || password === "") {
        errors.push("Password is required");
        return false;
    }else if (password.length < 3) {
        errors.push("Password must be at least 6 characters");
        return false;
    }
}