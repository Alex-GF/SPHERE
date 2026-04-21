import Header from "./header";
import Main from "./main";
import Footer from "./components/footer";
import { useEffect, useState } from "react";
import ImportPricingModal from "../../core/components/import-pricing-modal";
import { retrievePricingFromYaml } from "pricing4ts";
import Alerts from "../../core/components/alerts";
import { usePricingsApi } from "../../pricing/api/pricingsApi";
import { useLocation } from "react-router-dom";

export default function PresentationLayout({children}: {children?: React.ReactNode}){
    
    const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>([]);

    const {createPricing} = usePricingsApi();
    const location = useLocation();
    const isLandingRoute = location.pathname === '/';

    useEffect(() => {
      const handleOpenUploadModal = () => {
        setUploadModalOpen(true);
      };

      window.addEventListener('open-upload-pricing-modal', handleOpenUploadModal);

      return () => {
        window.removeEventListener('open-upload-pricing-modal', handleOpenUploadModal);
      };
    }, []);

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
                      .then(() => {
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
      <div className={isLandingRoute ? "min-h-dvh" : "grid min-h-dvh grid-rows-[auto_1fr]"}>
            {!isLandingRoute && <Header setUploadModalOpen={setUploadModalOpen}/>}
            {isLandingRoute ? children : <Main>{children}</Main>}
            {!isLandingRoute && <Footer/>}
            <ImportPricingModal modalState={uploadModalOpen} handleClose={handleCloseUploadModal} onSubmit={handleUploadSubmit}/>
            <Alerts messages={errors}/>
      </div>
    );
}
