import { Pricing, PricingAnalytics } from "../database/Pricing";

export interface PricingRepository{
    findAll(...args: any): Promise<Pricing[]>;
    findByNameAndOwner(name: string, ...args: any): Promise<{name: string, versions: Pricing[]} | null>;
    findByOwnerWithoutCollection(username: string, ...args: any): Promise<Pricing[]>;
    addPricingToCollection(pricingName: string, owner: string, collectionId: string, ...args: any): Promise<boolean>;
    addPricingsToCollection(collectionId: string, pricings: string[], ...args: any): Promise<boolean>;
    create(data: any, ...args: any): Promise<Pricing>;
    updateAnalytics(pricingId: string, analytics: PricingAnalytics, ...args: any): Promise<Pricing>;
    update(id: string, data: any, ...args: any): Promise<Pricing>;
    removePricingFromCollection(pricingName: string, owner: string, ...args: any): Promise<boolean>;
    destroyByNameAndOwner(name: string, owner: string, ...args: any): Promise<boolean>;
    destroy(id: string, ...args: any): Promise<boolean>;
}