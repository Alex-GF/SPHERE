import { FaRegCheckCircle } from "react-icons/fa";

export default function BulletsLanding() {
    const features = [
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
    ];

    return (
        <section className="my-8 flex w-full justify-center bg-[#eceef1] py-14 sm:my-12 sm:py-20">
          <div className="grid w-full max-w-[1280px] gap-10 px-6 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:px-12">
            <h2 className="text-center text-[30px] font-extrabold leading-tight tracking-tight text-slate-800 md:text-[40px]">
              Our Key Features
            </h2>

            <ul className="space-y-7">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-5">
                  <FaRegCheckCircle className="mt-[3px] shrink-0 text-[29px] text-[#00a9e0]" />
                  <div>
                    <p className="text-[16px] font-medium leading-none text-slate-800">{feature.title}</p>
                    <p className="mt-2 text-[14px] leading-snug text-slate-500">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
    );
}