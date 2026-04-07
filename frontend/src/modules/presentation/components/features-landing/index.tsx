import * as React from 'react'
import { FiCode, FiDatabase, FiMonitor, FiTool } from 'react-icons/fi'
import { FaUniversalAccess, FaBrain } from 'react-icons/fa'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="h-full rounded-lg bg-transparent p-3 transition-colors duration-300 hover:cursor-pointer hover:bg-[rgba(2,62,138,0.04)]">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-[rgba(2,62,138,0.1)] text-sphere-primary-700">
          {icon}
      </div>
        <h3 className="mb-2 text-xl font-semibold">
          {title}
        </h3>
        <p className="text-sm text-sphere-grey-600">
          {description}
        </p>
    </div>
  )
}

const features = [
  {
    icon: <FiDatabase />,
    title: 'Real Data',
    description: 'Access real-world pricing data from top SaaS companies to analyze their strategy.',
  },
  {
    icon: <FiMonitor />,
    title: 'Real Time Renderization',
    description: 'See your pricing changes take effect instantly with our real-time rendering and intuitive interface.',
  },
  {
    icon: <FiCode />,
    title: 'Developer Experience',
    description: 'Our integrated YAML editor makes it easy to create and edit pricing models, so you can focus on what matters most.',
  },
  {
    icon: <FaUniversalAccess />,
    title: 'Efficient Management',
    description: 'Track and manage changes to your pricing and the SaaS pricings you rely on using integrated VCS tools.',
  },
  {
    icon: <FaBrain />,
    title: 'Built-in Intelligence',
    description: 'Leverage HARVEY, our virtual assistant, for a customized analysis on SaaS pricings or use AI4Pricing to automatically transform static web pricing into iPricing.',
  },
  {
    icon: <FiTool />,
    title: 'Customization',
    description: 'Customize SPHERE to fit your unique needs with our powerful API and flexible integration options.',
  },
]

export default function FeaturesLanding() {
  return (
    <div className="flex w-dvw justify-center gap-6">
      <img
        alt=""
        src="assets/landing/team.webp"
        width={350}
        height={700}
        className="aspect-[1/2] rounded-2xl object-cover"
      />
      <section className="bg-transparent py-8 sm:py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1024px] px-4">
          <div className="mb-8 sm:mb-12">
            <h2 className="mb-2 text-center text-[32px] font-bold sm:text-[40px]">
              What is SPHERE?
            </h2>
            <p className="mx-auto max-w-[768px] text-center text-lg leading-relaxed text-sphere-grey-600">
              SPHERE (SaaS Pricing Holistic Evaluation and Regulation Environment) is your comprehensive platform for intelligent pricing-driven solutions. Grouping all our advanced applications, datasets and tools, SPHERE offers a unified experience to model, analyze, and optimize SaaS pricing with ease.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}