import { LoginFormProps } from "../../components/login-form";

export function validateLogin(formData: LoginFormProps): string[] {
    const errors: string[] = [];

    if (!formData.loginField || !formData.password) {
        errors.push("Email and password are required");
        return errors;
    }

    _validateLoginField(formData.loginField, errors);
    _validatePassword(formData.password, errors);

    return errors;
}

function _validateLoginField(loginField: string, errors: string[]){
    if (loginField === undefined || loginField === "") {
        errors.push("Username or Email is required");
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