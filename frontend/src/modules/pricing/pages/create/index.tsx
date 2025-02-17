import { Container } from "@mui/material";
import CreatePricingForm from "../../components/create-pricing-form";

export default function CreatePricingPage(){
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <CreatePricingForm />
    </Container>
  );
}