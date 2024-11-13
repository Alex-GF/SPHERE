import { Grid2, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import { flex } from "../../../../../core/theme/css";

export default function StatsLanding() {
    return(
        <Box sx={{ width: '100dvw', ...flex({}) }}>
            <Container maxWidth="xl">
                <Grid2 container spacing={6} alignItems="center">
                    <Grid2 size={6}>
                        <Box sx={{ mb: 4 }}>
                            <Typography
                            variant="h1"
                            component="h1"
                            sx={{
                                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                fontWeight: 'bold',
                                lineHeight: 1.2,
                                mb: 2,
                            }}
                            >
                            The Ultimate Platform For Pricing-driven Solutions
                            </Typography>
                            <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.875rem', md: '1rem', xl: '1.125rem' },
                                lineHeight: 1.6,
                            }}
                            >
                            SPHERE is the leading platform for intelligent pricing-driven solutions, trusted by several developers. With over 150 pricings analyzed, more than 20 SaaS leveraging our tools, and a satisfaction rate exceeding 90%, SPHERE empowers both businesses and researchers to extract actionable insights, streamline pricing management, and enhance decision-making with unparalleled accuracy.
                            </Typography>
                        </Box>
                        <Grid2 container spacing={4}>
                            <Grid2 size={4}>
                                <Box>
                                    <Typography
                                    variant="h2"
                                    component="h2"
                                    color="primary"
                                    sx={{ fontSize: '2rem', fontWeight: 'bold' }}
                                    >
                                    150+
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                    pricings analyzed.
                                    </Typography>
                                </Box>
                            </Grid2>
                            <Grid2 size={4}>
                                <Box>
                                    <Typography
                                    variant="h2"
                                    component="h2"
                                    color="primary"
                                    sx={{ fontSize: '2rem', fontWeight: 'bold' }}
                                    >
                                    20+
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                    SaaS use our tools.
                                    </Typography>
                                </Box>
                            </Grid2>
                            <Grid2 size={4}>
                                <Box>
                                    <Typography
                                    variant="h2"
                                    component="h2"
                                    color="primary"
                                    sx={{ fontSize: '2rem', fontWeight: 'bold' }}
                                    >
                                    +90%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                    satisfaction rate.
                                    </Typography>
                                </Box>
                            </Grid2>
                        </Grid2>
                    </Grid2>
                    <Grid2 size={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', ml: 5, my: { xs: 8, sm: 12 } }}>
                            <img
                            alt="Professional in a modern office setting"
                            src="assets/globe/logo.png"
                            width={800}
                            height={600}
                            style={{
                                borderRadius: '16px',
                                objectFit: 'cover',
                                aspectRatio: '4/3',
                            }}
                            />
                        </Box>
                    </Grid2>
                </Grid2>
            </Container>
        </Box>
    );
}