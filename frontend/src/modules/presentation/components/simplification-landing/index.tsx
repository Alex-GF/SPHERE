import { Analytics, Api, Search, TrendingUp } from "@mui/icons-material"
import BoxesLanding from "../boxes-landing"

export default function SimplificationLanding() {
    const elements: {title: string, icon: JSX.Element, description: string}[] = [
            {
            title: 'Discover',
            icon: <Search />,
            description:
                'Discover a world of pricing possibilities with our comprehensive suite of tools and data.',
            },
            {
            title: 'Exploit',
            icon: <TrendingUp />,
            description:
                'Simplify your pricing workflows with our powerful tools for data extraction, transformation, and visualization.',
            },
            {
            title: 'Analyze',
            icon: <Analytics />,
            description:
                'Gain valuable insights into your pricing strategy with HARVEY, our AI-powered analytics engine.',
            },
            {
            title: 'Integrate',
            icon: <Api />,
            description:
                "Integrate SPHERE's tools seamlessly into your apps or use them directly on SPHERE, all within a unified environment.",
            },
      ]
    return(
        <BoxesLanding elements={elements} isPrimary={false} title="How SPHERE Simplifies Pricing Management" />
    )
}