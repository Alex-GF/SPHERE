import { Box, Container } from '@mui/system';
import { Avatar, Card, CardContent, Grid2, IconProps, SvgIconTypeMap, Typography } from '@mui/material';
import { flex } from '../../../../../core/theme/css';

export default function BoxesLanding({elements, title, description, isPrimary=true}: {elements: {title: string, icon: JSX.Element, description: string}[], title: string, description?: string, isPrimary?: boolean}) {
    return (
        <Box sx={{ width: '100dvw', ...flex({ direction: 'column' }) }}>
          <Container maxWidth="xl">
            <Box sx={{my: { xs: 8, sm: 12 }}}>
                <Typography component="h2"
                variant="h3"
                align="center"
                sx={{
                    mb: 2,
                    fontWeight: 700,
                    fontSize: { xs: 32, sm: 40 }}}>
                    {title}
                </Typography>
                
                <Typography
                variant="h6"
                align="center"
                color="text.secondary"
                sx={{
                    maxWidth: 'md',
                    mx: 'auto',
                    lineHeight: 1.6,
                }}
                >
                {description}
                </Typography>
            </Box>
            <Grid2 container spacing={3} sx={{mb: {xs: 8, sm: 12}}}>
                {elements.map((e, index) => (
                <Grid2 size={3} key={index}>
                    <Card sx={{
                            minHeight: "200px",
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            '&:hover': {
                                transform: 'translateY(-25px)',
                                boxShadow: 3,
                                cursor: 'pointer'
                            }
                        }}>
                    <CardContent>
                        <Avatar sx={{ bgcolor: isPrimary?'primary.main':'secondary.main', mb: 2 }}>{e.icon}</Avatar>
                        <Typography variant="h6" component="h3" gutterBottom>
                        {e.title}
                        </Typography>
                        <Typography variant="body2">{e.description}</Typography>
                    </CardContent>
                    </Card>
                </Grid2>
                ))}
            </Grid2>
          </Container>
        </Box>
    );
}