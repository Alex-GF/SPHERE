import { FaChartLine, FaSearch, FaCogs } from "react-icons/fa"
import { MdApi } from "react-icons/md"
import BoxesLanding from "../boxes-landing"

export default function SimplificationLanding() {
    const elements: {title: string, icon: JSX.Element, description: string}[] = [
            {
            title: 'Discover',
            icon: <FaSearch />,
            description:
                'Discover a world of pricing possibilities with our comprehensive suite of tools and data.',
            },
            {
            title: 'Exploit',
            icon: <FaChartLine />,
            description:
                'Simplify your pricing workflows with our powerful tools for data extraction, transformation, and visualization.',
            },
            {
            title: 'Analyze',
            icon: <FaCogs />,
            description:
                'Gain valuable insights into your pricing strategy with HARVEY, our AI-powered analytics engine.',
            },
            {
            title: 'Integrate',
            icon: <MdApi />,
            description:
                "Integrate SPHERE's tools seamlessly into your apps or use them directly on SPHERE, all within a unified environment.",
            },
      ]
    return(
        <BoxesLanding elements={elements} isPrimary={false} title="How SPHERE Simplifies Pricing Management" />
    )
}