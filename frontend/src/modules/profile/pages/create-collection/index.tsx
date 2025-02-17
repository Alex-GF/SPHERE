import { Container } from "@mui/material";
import CreateCollectionForm from "../../components/create-collection-form";

export default function CreateCollectionPage(){
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <CreateCollectionForm />
    </Container>
  );
}