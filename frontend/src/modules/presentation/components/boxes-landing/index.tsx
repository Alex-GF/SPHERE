export default function BoxesLanding({elements, title, description, isPrimary=true}: {elements: {title: string, icon: JSX.Element, description: string}[], title: string, description?: string, isPrimary?: boolean}) {
    return (
        <div className="flex w-dvw flex-col">
          <div className="mx-auto w-full max-w-[1280px] px-4">
            <div className="my-8 sm:my-12">
                <h2 className="mb-2 text-center text-[32px] font-bold sm:text-[40px]">
                    {title}
                </h2>
                
                <p className="mx-auto max-w-[768px] text-center text-lg leading-relaxed text-sphere-grey-600">
                {description}
                </p>
            </div>
            <div className="mb-8 grid grid-cols-1 gap-3 sm:mb-12 md:grid-cols-2 xl:grid-cols-4">
                {elements.map((e, index) => (
                <div key={index} className="min-h-[200px] rounded-lg bg-white p-4 transition duration-300 hover:translate-y-[-25px] hover:cursor-pointer hover:shadow-md">
                    <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full text-white ${isPrimary ? 'bg-sphere-primary-700' : 'bg-slate-700'}`}>
                      {e.icon}
                    </div>
                        <h3 className="mb-2 text-xl font-semibold">
                        {e.title}
                        </h3>
                        <p className="text-sm text-sphere-grey-700">{e.description}</p>
                </div>
                ))}
            </div>
          </div>
        </div>
    );
}