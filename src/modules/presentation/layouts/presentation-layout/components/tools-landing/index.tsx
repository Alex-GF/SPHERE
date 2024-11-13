import {Code, Memory, Monitor } from "@mui/icons-material"
import BoxesLanding from "../boxes-landing"
import { FaWandMagic } from "react-icons/fa6"

export default function ToolsLanding() {
    const elements: {title: string, icon: JSX.Element, description: string}[] = [
        {
            title: 'AI4Pricing',
            icon: <FaWandMagic />,
            description:
            'Effortlessly transform your static web pricing into iPricing with our advanced AI-based tool.',
        },
        {
            title: 'Pricing2Yaml Editor',
            icon: <Code />,
            description:
            'Easily transform and edit pricing data using our intuitive YAML editor, built to streamline the modeling process.',
        },
        {
            title: 'HARVEY',
            icon: <Memory />,
            description:
            'Get personalized insights and recommendations for your SaaS pricing strategy with HARVEY, our AI-powered virtual assistant.',
        },
        {
            title: 'Pricing2Yaml Renderer',
            icon: <Monitor />,
            description:
            'Visualize your SaaS pricing in a standardized format and customize it to your needs with our powerful rendering tool.',
        },
    ]
    return(
        <BoxesLanding elements={elements} title={"Explore Our Integrated Tools"} description="Discover our AI-powered tools to revolutionize SaaS pricing landscape. Our applications streamline data extraction, rendering, and analysis, empowering you to make data-driven decisions." />
    )
}