import { BaseModel } from './BaseModel';

export interface User extends BaseModel {
    email: string;
    password: string;
    name: string;
    phone: string;
    avatar: string;
    token: string | null;
    tokenExpiration: Date | null;
}