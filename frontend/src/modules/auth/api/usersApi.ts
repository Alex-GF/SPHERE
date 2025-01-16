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

export function registerUser(formData: RegisterFormProps): Promise<any> {
    return fetch(`${USERS_BASE_PATH}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    }).then((response) => {
        
        if (!response.ok) {
            throw new Error("Error registering user. Please, check the fields before submitting again" );
        }
        
        return response.json()
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}