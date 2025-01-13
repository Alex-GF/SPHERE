import { LoginFormProps } from "../components/login-form";

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