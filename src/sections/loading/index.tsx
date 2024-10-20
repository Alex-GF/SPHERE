import { Box, CircularProgress, Container } from "@mui/material";
import Logo from "../../components/logo";

export default function LoadingView() {
    const renderHeader = (
        <Box
          component="header"
          sx={{
            top: 0,
            left: 0,
            width: 1,
            lineHeight: 0,
            position: 'fixed',
            p: (theme) => ({ xs: theme.spacing(3, 3, 0), sm: theme.spacing(5, 5, 0) }),
          }}
        >
          <Logo />
        </Box>
      );
    
      return (
        <>
          {renderHeader}
    
          <Container>
            <Box
              sx={{
                py: 12,
                maxWidth: 480,
                mx: 'auto',
                display: 'flex',
                minHeight: '80vh',
                textAlign: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          </Container>
        </>
    );
}