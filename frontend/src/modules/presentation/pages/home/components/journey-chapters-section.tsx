import type { StoryChapter } from '../data';
import RevealBlock from './reveal-block';

export default function JourneyChaptersSection({ chapters }: { chapters: StoryChapter[] }) {
  return (
    <section id="journey-chapters" className="py-20 md:py-28 lg:py-32">
      <RevealBlock className="mb-8">
        <span className="inline-flex rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#475467]">
          Journey Chapters
        </span>
      </RevealBlock>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <RevealBlock className="md:col-span-5" delay={80}>
          <div className="md:sticky md:top-28">
            <div className="rounded-[2rem] border border-black/10 bg-black/[0.03] p-1.5 ring-1 ring-black/5">
              <article className="rounded-[calc(2rem-0.375rem)] border border-black/10 bg-white p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.75)] md:p-10">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#667085]">AIDA scroll flow</p>
                <h3 className="mt-4 text-3xl font-medium leading-tight text-[#111827] md:text-5xl">
                  From attention to activation in one continuous narrative.
                </h3>
                <p className="mt-6 text-sm leading-relaxed text-[#475467] md:text-base">
                  This chapter stack keeps message hierarchy stable while the right lane advances through operational proof points.
                </p>
              </article>
            </div>
          </div>
        </RevealBlock>

        <div className="space-y-6 md:col-span-7">
          {chapters.map((chapter, index) => (
            <RevealBlock key={chapter.title} delay={140 + index * 90}>
              <div className="rounded-[2rem] border border-black/10 bg-black/[0.03] p-1.5 ring-1 ring-black/5">
                <article className="rounded-[calc(2rem-0.375rem)] border border-black/10 bg-white p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.75)] md:p-9">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#667085]">Chapter {`0${index + 1}`}</p>
                  <h4 className="mt-3 text-2xl font-medium leading-tight text-[#111827] md:text-3xl">{chapter.title}</h4>
                  <p className="mt-4 text-sm leading-relaxed text-[#475467] md:text-base">{chapter.description}</p>
                </article>
              </div>
            </RevealBlock>
          ))}
        </div>
      </div>
    </section>
  );
}
