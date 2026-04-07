import { FaCheckCircle } from "react-icons/fa";

export default function BulletsLanding() {
    return (
        <div className="my-8 flex w-dvw justify-center sm:my-12">
          <div className="w-full max-w-[1280px] px-4">
          <h2 className="mb-2 mr-5 text-center text-[32px] font-bold sm:text-[40px]">
            Our Key Features
          </h2>
          <ul>
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
              <li key={index} className="flex items-start gap-3 rounded-md p-2 transition-colors duration-300 hover:cursor-pointer hover:bg-[rgba(2,62,138,0.04)]">
                <FaCheckCircle className="mt-1 text-sphere-primary-700" />
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm text-sphere-grey-600">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
          </div>
        </div>
    );
}