import { Box } from "@mui/material";
import Header from "./header";
import Main from "./main";
import Footer from "./components/footer";

export default function PresentationLayout({children}: {children?: React.ReactNode}){
    return (
        <Box component="div" sx={{display: "grid", minHeight: "100dvh", gridTemplateRows: "auto 1fr"}}>
            <Header/>
            <Main>{children}</Main>
            <Footer/>
        </Box>
    );
}