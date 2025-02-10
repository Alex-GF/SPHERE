import { Pricing, PricingAnalytics } from "../database/Pricing";

export interface PricingRepository{
    findAll(...args: any): Promise<Pricing[]>;
    findByNameAndOwner(name: string, ...args: any): Promise<{name: string, versions: Pricing[]} | null>;
    findByOwnerWithoutCollection(username: string, ...args: any): Promise<Pricing[]>;
    create(data: any, ...args: any): Promise<Pricing>;
    updateAnalytics(pricingId: string, analytics: PricingAnalytics, ...args: any): Promise<Pricing>;
    destroy(id: string, ...args: any): Promise<boolean>;
}