import Grid from "@mui/material/Grid2";
import Editor from "@monaco-editor/react";
import { grey } from "../../theme/palette";
import { useState, useEffect, useRef } from "react";
import { retrievePricingFromYaml, Pricing } from "pricing4ts";

import { PricingTheme1 } from "../../components/pricing-renderer";
import LoadingView from "../../sections/loading";
import { flex } from "../../theme/css";
import { Box } from "@mui/material";

const TEMPLATE_PRICING_PATH = "/data/petclinic.yml";

export default function EditorPage() {
  
  const [pricing, setPricing] = useState<Pricing>();
  const [editorValue, setEditorValue] = useState<string>();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  function handleEditorChange(value: string | undefined) {
    if (value) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setEditorValue(value);
        const parsedPricing: Pricing = retrievePricingFromYaml(value);
        setPricing(parsedPricing);
      }, 1000);
    }
  }

  useEffect(() => {
    fetch(TEMPLATE_PRICING_PATH).then(async response => {
      const templatePricing: string = await response.text();
      
      try{
        const parsedPricing: Pricing = retrievePricingFromYaml(templatePricing);
        setPricing(parsedPricing);
        setEditorValue(templatePricing);
      }catch(err){
        console.error("Error parsing YAML:", err);
      }
    });
  }, []);

  return (
    <Grid
      container
      spacing={1.5}
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: grey[400]
      }}
    >
      <Grid size={6} sx={{height: "100%"}}>
        <Editor
          height="100%"
          defaultLanguage="yaml"
          onChange={handleEditorChange}
          value={editorValue}
          theme="vs-dark"
          options={{
            minimap: {
              enabled: false
            }
          }}
        />
      </Grid>
      <Grid size={6} sx={{height: "100%", backgroundColor: grey[200], ...flex({direction: "column"})}}>
        <Box sx={{width: "100%"}}>
        {
          pricing ?
          <PricingTheme1 pricing={pricing}/>
          :
          <LoadingView/>
        }
        </Box>
      </Grid>
    </Grid>
  );
}
