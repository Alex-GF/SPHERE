import { StyledButtonLanding } from "../styled-button-landing";

export default function FinalLanding() {
    return (
        <div className="my-8 flex w-dvw flex-col items-center justify-center sm:my-12">
          <h2 className="mb-2 text-center text-[32px] font-bold sm:text-[40px]">
            Ready to Revolutionize Your Pricing Understanding?
          </h2>
          <p className="mx-auto max-w-[1024px] text-center text-lg leading-relaxed text-sphere-grey-600">
            Join SPHERE today and take advantage of our full suite of pricing-driven apps.
          </p>
          <StyledButtonLanding className="mt-5">
            Sign Up Now
          </StyledButtonLanding>
        </div>
    );
}