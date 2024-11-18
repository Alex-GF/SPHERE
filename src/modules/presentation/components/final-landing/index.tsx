import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { flex } from "../../../core/theme/css";

export default function FinalLanding() {
    return (
        <Box sx={{ width: '100dvw', ...flex({ direction: 'column', justify: 'center', align: 'center' }), my: { xs: 8, sm: 12 } }}>
          <Typography component="h2"
          variant="h3"
          align="center"
          sx={{
            mb: 2,
            fontWeight: 700,
            fontSize: { xs: 32, sm: 40 },
          }}>
            Ready to Revolutionize Your Pricing Understanding?
          </Typography>
          <Typography variant="h6"
          align="center"
          color="text.secondary"
          sx={{
            maxWidth: 'lg',
            mx: 'auto',
            lineHeight: 1.6,
          }}>
            Join SPHERE today and take advantage of our full suite of pricing-driven apps.
          </Typography>
          <Button variant="contained" color="primary" size="large" sx={{ mt: 5 }}>
            Sign Up Now
          </Button>
        </Box>
    );
}