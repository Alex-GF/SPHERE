import { LoginFormProps } from "../components/login-form";
import { RegisterFormProps } from "../components/register-form";

export const USERS_BASE_PATH = import.meta.env.VITE_API_URL + "/users";

export function loginUser(formData: LoginFormProps): Promise<any> {
    return fetch(`${USERS_BASE_PATH}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    }).then((response) => response.json())
    .catch((error) => {
        console.error("Error:", error);
    });
}

export function registerUser(formData: RegisterFormProps, setErrors: Function = () => {}): Promise<any> {
    return fetch(`${USERS_BASE_PATH}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    }).then(async (response) => {

        const parsedResponse = await response.json();

        if (!response.ok) {
            throw new Error(parsedResponse.error);
        }
        
        return parsedResponse;
    })
    .catch((error: Error) => {
        if (Array.isArray(error)) {
            setErrors(error);
        }else{
            setErrors([error.message]);
        }
    });
}