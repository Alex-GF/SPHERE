import { Box } from "@mui/material";
import Header from "./header";
import Main from "./main";
import Footer from "./components/footer";
import { useState } from "react";
import ImportPricingModal from "../../core/components/import-pricing-modal";
import { retrievePricingFromYaml } from "pricing4ts";
import Alerts from "../../core/components/alerts";
import { usePricingsApi } from "../../pricing/api/pricingsApi";

export default function PresentationLayout({children}: {children?: React.ReactNode}){
    
    const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>([]);

    const {createPricing} = usePricingsApi();

    const handleCloseUploadModal = () => {
        setUploadModalOpen(false);
      }
    
      const handleUploadSubmit = (file: File) => {
        file.text()
            .then(text => {
                try{
                    const uploadedPricing = retrievePricingFromYaml(text);
                    setErrors([]);
                    const formData = new FormData();
                    formData.append("saasName", uploadedPricing.saasName);
                    formData.append("version", uploadedPricing.version);
                    formData.append("yaml", file);
                    createPricing(formData, setErrors)
                      .then((response) => {
                        setUploadModalOpen(false);
                      }).catch((error) => {
                        console.error('Error creating pricing:', error);
                      });
                }catch(e){
                    setErrors([(e as Error).message]);
                }
            })
      };
    
    return (
        <Box component="div" sx={{display: "grid", minHeight: "100dvh", gridTemplateRows: "auto 1fr"}}>
            <Header setUploadModalOpen={setUploadModalOpen}/>
            <Main>{children}</Main>
            <Footer/>
            <ImportPricingModal modalState={uploadModalOpen} handleClose={handleCloseUploadModal} onSubmit={handleUploadSubmit}/>
            <Alerts messages={errors}/>
        </Box>
    );
}