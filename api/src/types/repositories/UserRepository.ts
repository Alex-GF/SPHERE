import { User } from "../database/User";

export interface UserRepository{
    findAll(...args: any): Promise<User[]>;
    findById(id: string, ...args: any): Promise<User | null>;
    findByToken(token: string, ...args: any): Promise<User | null>;
    findAdminByEmail(email: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    create(businessEntity: User, ...args: any): Promise<User>;
    update(id: string, businessEntity: User, ...args: any): Promise<User | null>;
    updateToken(id: string, token: {token: string, tokenExpiration: Date}): Promise<User | null>;
    destroy(id: string, ...args: any): Promise<boolean>;
    save(entity: User): Promise<User | null>;
    _findByEmailAndUserType(email: string, userType: "user" | "admin"): Promise<User | null>;
}