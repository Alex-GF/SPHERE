import * as React from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  useTheme,
  alpha,
  Grid2,
} from '@mui/material'
import SpeedIcon from '@mui/icons-material/Speed'
import BrushIcon from '@mui/icons-material/Brush'
import CodeIcon from '@mui/icons-material/Code'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import DevicesIcon from '@mui/icons-material/Devices'
import BuildIcon from '@mui/icons-material/Build'
import { flex } from '../../../../../core/theme/css'
import { Dataset, SmartButton, SmartDisplay } from '@mui/icons-material'
import { FaBrain } from 'react-icons/fa'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  const theme = useTheme()
  
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          cursor: 'pointer',
        },
        transition: 'background-color 0.3s ease',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 1.5,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  )
}

const features = [
  {
    icon: <Dataset />,
    title: 'Real Data',
    description: 'Access real-world pricing data from top SaaS companies to analyze their strategy.',
  },
  {
    icon: <DevicesIcon />,
    title: 'Real Time Renderization',
    description: 'See your pricing changes take effect instantly with our real-time rendering and intuitive interface.',
  },
  {
    icon: <CodeIcon />,
    title: 'Developer Experience',
    description: 'Our integrated YAML editor makes it easy to create and edit pricing models, so you can focus on what matters most.',
  },
  {
    icon: <AccessibilityNewIcon />,
    title: 'Efficient Management',
    description: 'Track and manage changes to your pricing and the SaaS pricings you rely on using integrated VCS tools.',
  },
  {
    icon: <FaBrain />,
    title: 'Built-in Intelligence',
    description: 'Leverage HARVEY, our virtual assistant, for a customized analysis on SaaS pricings or use AI4Pricing to automatically transform static web pricing into iPricing.',
  },
  {
    icon: <BuildIcon />,
    title: 'Customization',
    description: 'Customize SPHERE to fit your unique needs with our powerful API and flexible integration options.',
  },
]

export default function FeaturesLanding() {
  return (
    <Box sx={{ width: '100dvw', ...flex({}) }}>
      <img
        alt=""
        src="assets/landing/team.webp"
        width={350}
        height={700}
        style={{
            borderRadius: '16px',
            objectFit: 'cover',
            aspectRatio: '1/2',
        }}
      />
      <Box
        component="section"
        sx={{
          py: { xs: 8, sm: 12, md: 16 },
          backgroundColor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: { xs: 8, sm: 12 } }}>
            <Typography
              component="h2"
              variant="h3"
              align="center"
              sx={{
                mb: 2,
                fontWeight: 700,
                fontSize: { xs: 32, sm: 40 },
              }}
            >
              What is SPHERE?
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
              SPHERE (SaaS Pricing Holistic Evaluation and Regulation Environment) is your comprehensive platform for intelligent pricing-driven solutions. Grouping all our advanced applications, datasets and tools, SPHERE offers a unified experience to model, analyze, and optimize SaaS pricing with ease.
            </Typography>
          </Box>
          
          <Grid2 container spacing={4}>
            {features.map((feature, index) => (
              <Grid2 size={4} key={index}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </Grid2>
            ))}
          </Grid2>
        </Container>
      </Box>
    </Box>
  )
}