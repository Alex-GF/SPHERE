import { Box, Container } from "@mui/material";
import { flex } from "../../theme/css";
import Logo from "../../components/logo";

export default function HomePage(){
    return(
        <Container sx={{
            ...flex({direction: "column"}),
        }}>
            <Logo/>
            Welcome To MASSP
        </Container>
    );
}