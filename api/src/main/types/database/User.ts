export interface User{
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    phone: string;
    avatar: string;
    address: string;
    postalCode: string;
    userType: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
    token?: string;
    tokenExpiration?: Date;
}