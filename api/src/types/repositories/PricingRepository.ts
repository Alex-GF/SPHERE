import { Pricing } from "../database/Pricing";

export interface PricingRepository{
    findAll(...args: any): Promise<Pricing[]>;
    findById(id: string, ...args: any): Promise<Pricing | null>;
    destroy(id: string, ...args: any): Promise<boolean>;
}