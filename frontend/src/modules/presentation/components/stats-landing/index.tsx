export default function StatsLanding() {
    return(
        <div className="flex w-dvw justify-center">
            <div className="mx-auto w-full max-w-[1280px] px-4">
                <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
                    <div>
                        <div className="mb-4">
                            <h1 className="mb-2 text-[2rem] font-bold leading-tight sm:text-[2.5rem] md:text-[3rem]">
                            The Ultimate Platform For Pricing-driven Solutions
                            </h1>
                            <p className="text-[0.875rem] leading-relaxed text-sphere-grey-600 md:text-base xl:text-lg">
                            SPHERE is the leading platform for intelligent pricing-driven solutions, trusted by several developers. With over 150 pricings analyzed, more than 20 SaaS leveraging our tools, and a satisfaction rate exceeding 90%, SPHERE empowers both businesses and researchers to extract actionable insights, streamline pricing management, and enhance decision-making with unparalleled accuracy.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <h2 className="text-[2rem] font-bold text-sphere-primary-700">
                                    150+
                                </h2>
                                    <p className="text-sm text-sphere-grey-600">
                                    pricings analyzed.
                                    </p>
                            </div>
                            <div>
                                <h2 className="text-[2rem] font-bold text-sphere-primary-700">
                                    20+
                                </h2>
                                    <p className="text-sm text-sphere-grey-600">
                                    SaaS use our tools.
                                    </p>
                            </div>
                            <div>
                                <h2 className="text-[2rem] font-bold text-sphere-primary-700">
                                    +90%
                                </h2>
                                    <p className="text-sm text-sphere-grey-600">
                                    satisfaction rate.
                                    </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="my-8 flex justify-center sm:my-12 md:ml-5">
                            <img
                            alt="Professional in a modern office setting"
                            src="assets/landing/woman.webp"
                            width={800}
                            height={600}
                            className="aspect-[4/3] rounded-2xl object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}