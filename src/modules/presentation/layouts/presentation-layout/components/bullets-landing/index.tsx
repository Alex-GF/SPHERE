import { CheckCircleOutline } from "@mui/icons-material";
import { List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { flex } from "../../../../../core/theme/css";

export default function BulletsLanding() {
    return (
        <Box sx={{ width: '100dvw', ...flex({}), my: { xs: 8, sm: 12 } }}>
          <Typography component="h2"
                variant="h3"
                align="center"
                sx={{
                    mb: 2,
                    mr: 5,
                    fontWeight: 700,
                    fontSize: { xs: 32, sm: 40 }}}>
            Our Key Features
          </Typography>
          <List>
            {[
              {
                title: 'Unified Platform',
                description:
                  'Access all our pricing tools in one place, designed to work seamlessly together for a complete pricing solution.',
              },
              {
                title: 'Intelligent Automation',
                description:
                  'Automate complex pricing tasks with our AI-driven apps, freeing up your time and resources',
              },
              {
                title: 'Flexible Integration',
                description:
                  'Easily connect SPHERE with your existing software ecosystem using our robust API and libraries.',
              },
              {
                title: 'Continuous Evolution',
                description:
                  'Enjoy a platform that grows with your needs, incorporating new features and improvements regularly.',
              },
            ].map((feature, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleOutline color="primary" />
                </ListItemIcon>
                <ListItemText primary={feature.title} secondary={feature.description} />
              </ListItem>
            ))}
          </List>
        </Box>
    );
}