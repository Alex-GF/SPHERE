import { Box, styled } from "@mui/material";
import { Helmet } from "react-helmet";
import { SAAS_DATA, AnalyticsData } from '../../../../assets/data/analytics';
import { useEffect, useState } from "react";
import PricingListCard from "../../components/pricing-list-card";

const PricingsGrid = styled(Box)(() => ({
    maxWidth: "2000px",
    width: "100dvw",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    gap: "5rem",
    margin: "auto",
    padding: "50px 15px 15px 20px",
    }));

export default function PricingListPage(){
    
    const [pricingsList, setPricingsList] = useState<AnalyticsData>({});
    
    useEffect(()=>{
        setPricingsList(SAAS_DATA)
    }, [])
    
    return(
        <>
            <Helmet>
                <title> SPHERE - Pricings </title>
            </Helmet>
            <PricingsGrid>
            {
                Object.entries(pricingsList).map(([key, value]) => {
                    return(
                        <PricingListCard name={key} dataEntry={value[0]}/>
                    )
                })
            }
            </PricingsGrid>
            
        </>
    )
}
