import { useEffect } from "react";
import { useRouter } from "../../../core/hooks/useRouter";
import { useQueryParams } from "../../../core/hooks/useQueryParams";

export default function LegacyPricingCard() {
    
    const router = useRouter();
    const queryParams = useQueryParams();

    useEffect (() => {
        const pricingName = queryParams.get('name');

        router.push(`/pricings/sphere/${pricingName}`);
    }, []);
    
    return (
        <></>
    );
}