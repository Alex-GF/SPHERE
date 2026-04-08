import { FaMoneyCheckDollar } from 'react-icons/fa6';
import { StyledButtonLanding } from '../styled-button-landing';

export default function FoundingLanding() {
  return (
    <div className="my-8 w-dvw sm:my-12">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center px-4">
        <h2 className="mb-2 text-center text-[32px] font-bold sm:text-[40px]">
          Founded by Public Entities
        </h2>
        <p className="mx-auto max-w-[1024px] text-center text-lg leading-relaxed text-sphere-grey-600">
          SPHERE is a collaborative effort backed by public entities, dedicated to advancing research and innovation in SaaS pricing. Our mission is to democratize access to cutting-edge technology, empowering researchers worldwide.
        </p>
        <p className="mx-auto max-w-[768px] text-center text-lg leading-relaxed text-sphere-grey-600">
          Discover the public entities, projects, and grants that have made SPHERE possible.
        </p>
        <StyledButtonLanding className="mt-5" startIcon={<FaMoneyCheckDollar />}>
          Find Out Our Partners
        </StyledButtonLanding>
        <div className="mt-5 flex items-center gap-4 md:grid-cols-3">
            <a href="https://score.us.es" target="_blank" rel="noreferrer">
              <img
                  alt="SCORE Lab"
                  src="assets/landing/score.png"
                  width={400}
                  height={125}
                  className="rounded-2xl object-contain"
              />
            </a>
            <a href="https://www.aei.gob.es" target="_blank" rel="noreferrer">
              <img
                  alt="Spanish and European Government"
                  src="assets/landing/government.png"
                  width={400}
                  height={125}
                  className="rounded-2xl object-contain"
              />
            </a>
            <a href="https://www.us.es" target="_blank" rel="noreferrer">
              <img
                  alt="US"
                  src="assets/landing/university.png"
                  width={400}
                  height={125}
                  className="rounded-2xl object-contain"
              />
            </a>
        </div>
      </div>
    </div>
  );
}
