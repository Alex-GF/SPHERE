import { motion } from 'framer-motion';
import { FiCode, FiExternalLink } from 'react-icons/fi';
import { useRouter } from '../../../../core/hooks/useRouter';

type ToolCard = {
  title: string;
  description: string;
  logo?: string;
  primary: {
    label: string;
    href: string;
    kind: 'internal' | 'external';
  };
  links: Array<{
    label: string;
    href: string;
    kind: 'internal' | 'external';
  }>;
  badge?: string;
  customLogo?: 'ipricing-editor' | 'pricing2yaml';
};

const cards: ToolCard[] = [
  {
    title: 'iPricing Editor',
    description:
      'Real-time iPricing editor and renderer using Pricing2Yaml syntax, integrated into SPHERE.',
    customLogo: 'ipricing-editor',
    badge: 'Inside SPHERE',
    primary: {
      label: 'Open editor',
      href: '/editor',
      kind: 'internal',
    },
    links: [{ label: 'Use in SPHERE', href: '/editor', kind: 'internal' }],
  },
  {
    title: 'AMINT',
    description:
      'Automatically transform any public pricing from the web into an iPricing for analysis and experimentation.',
    logo: '/assets/logos/amint.webp',
    badge: 'Inside HARVEY',
    primary: {
      label: 'Try in HARVEY',
      href: '/harvey',
      kind: 'internal',
    },
    links: [
      { label: 'Use in SPHERE', href: '/harvey', kind: 'internal' },
      { label: 'Repository', href: '#', kind: 'external' },
    ],
  },
  {
    title: 'PRIME',
    description:
      'API for iPricing analysis and validation to extract metrics from plans, features, and configurations.',
    logo: '/assets/logos/prime-short.webp',
    badge: 'Metrics in SPHERE',
    primary: {
      label: 'View metrics',
      href: '/pricings',
      kind: 'internal',
    },
    links: [
      { label: 'Pricings', href: '/pricings', kind: 'internal' },
      { label: 'Collections', href: '/collections', kind: 'internal' },
      {
        label: 'Repository',
        href: 'https://github.com/isa-group/Pricing-Intelligence-Interpretation-Process/tree/main/analysis_api',
        kind: 'external',
      },
    ],
  },
  {
    title: 'SPACE',
    description:
      'Self-adaptive software that keeps your SaaS aligned with pricing changes without requiring development',
    logo: '/assets/logos/space.webp',
    badge: 'External tool',
    primary: {
      label: 'Open repository',
      href: 'https://github.com/isa-group/space',
      kind: 'external',
    },
    links: [
      { label: 'Repository', href: 'https://github.com/isa-group/space', kind: 'external' },
      {
        label: 'Documentation',
        href: 'https://sphere-docs.vercel.app/docs/2.0.1/api/space/introduction',
        kind: 'external',
      },
    ],
  },
  {
    title: 'Pricing2Yaml',
    description:
      'YAML-based language for structured, readable, and reusable iPricing representation.',
    customLogo: 'pricing2yaml',
    badge: 'Language',
    primary: {
      label: 'Read syntax',
      href: 'https://sphere-docs.vercel.app/docs/2.0.1/api/pricing-description-languages/Pricing2Yaml/the-pricing2yaml-syntax',
      kind: 'external',
    },
    links: [
      {
        label: 'Documentation',
        href: 'https://sphere-docs.vercel.app/docs/2.0.1/api/pricing-description-languages/Pricing2Yaml/the-pricing2yaml-syntax',
        kind: 'external',
      },
    ],
  },
  {
    title: 'HARVEY',
    description:
      'AI-powered assistant for pricing strategy analysis and decision-making support.',
    logo: '/assets/logos/harvey.webp',
    badge: 'Inside SPHERE',
    primary: {
      label: 'Open HARVEY',
      href: '/harvey',
      kind: 'internal',
    },
    links: [
      { label: 'Use in SPHERE', href: '/harvey', kind: 'internal' },
      {
        label: 'Repository',
        href: 'https://github.com/isa-group/Pricing-Intelligence-Interpretation-Process',
        kind: 'external',
      },
    ],
  },
];

export default function ToolsCatalogSection() {
  const router = useRouter();

  const openLink = (href: string, kind: 'internal' | 'external') => {
    if (kind === 'internal') {
      router.push(href);
      return;
    }

    if (href === '#') {
      return;
    }

    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tools</p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
          SPHERE pricing tools ecosystem
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {cards.map((card) => (
          <article
            key={card.title}
            onClick={() => openLink(card.primary.href, card.primary.kind)}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="relative inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                {card.customLogo === 'ipricing-editor' ? (
                  <span className="font-mono text-[32px] font-bold text-cyan-700">&lt;/&gt;</span>
                ) : card.customLogo === 'pricing2yaml' ? (
                  <FiCode className="h-12 w-12 text-purple-600" />
                ) : (
                  <img
                    src={card.logo}
                    alt={`${card.title} logo`}
                    className="h-full w-full object-contain p-2"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              {card.badge ? (
                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
                  {card.badge}
                </span>
              ) : null}
            </div>

            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {card.links.map((link) => (
                <button
                  key={`${card.title}-${link.label}`}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openLink(link.href, link.kind);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
                >
                  {link.label}
                  {link.kind === 'external' ? <FiExternalLink className="text-[10px]" /> : null}
                </button>
              ))}
            </div>

            <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700">
              {card.primary.label}
              <FiExternalLink className={card.primary.kind === 'internal' ? 'rotate-45 text-[10px]' : 'text-[10px]'} />
            </p>
          </article>
        ))}
      </motion.div>
    </section>
  );
}
