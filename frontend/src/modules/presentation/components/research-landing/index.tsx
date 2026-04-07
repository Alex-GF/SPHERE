import { FaPeopleGroup, FaBookOpen } from 'react-icons/fa6';
import { useRouter } from '../../../core/hooks/useRouter';
import { StyledButtonLanding } from '../styled-button-landing';

export default function ResearchLanding() {
  const router = useRouter();

  return (
    <div className="my-8 w-dvw sm:my-12">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center px-4">
        <h2 className="mb-2 text-center text-[32px] font-bold sm:text-[40px]">
          Powered by Research and Innovation
        </h2>
        <p className="mx-auto max-w-[1024px] text-center text-lg leading-relaxed text-sphere-grey-600">
          Our platform is the result of cutting-edge research and the dedication of a world-class
          team. The scientific publications behind our technology and the brilliant minds of our
          researchers have made it possible to create powerful and flexible solutions for DevOps
          teams and SaaS pricing management.
        </p>
        <p className="mx-auto max-w-[768px] text-center text-lg leading-relaxed text-sphere-grey-600">
          We invite you to explore the foundation of our success and meet the people who make it all
          possible.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <img
            alt=""
            src="assets/landing/research/presenter1.heic"
            width={400}
            height={250}
            className="rounded-2xl object-cover"
          />
          <img
            alt=""
            src="assets/landing/research/presenter3.heic"
            width={400}
            height={250}
            className="rounded-2xl object-cover"
          />
          <img
            alt=""
            src="assets/landing/research/group.heic"
            width={400}
            height={250}
            className="rounded-2xl object-cover"
          />
          <img
            alt=""
            src="assets/landing/research/award.jpg"
            width={400}
            height={250}
            className="rounded-2xl object-cover"
          />
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3.5">
          <StyledButtonLanding
            startIcon={<FaBookOpen />}
            className="w-[400px]"
            onClick={() => router.push('/research')}
          >
            Discover All Our Publications
          </StyledButtonLanding>
          <button
            type="button"
            className="inline-flex w-[400px] items-center justify-center gap-2 rounded-md border border-sphere-primary-700 px-5 py-2 text-center text-sphere-primary-700 transition-colors hover:bg-sphere-primary-700 hover:text-white"
            onClick={() => router.push('/team')}
          >
            <FaPeopleGroup />
            Meet Our Team And Collaborators
          </button>
        </div>
      </div>
    </div>
  );
}
