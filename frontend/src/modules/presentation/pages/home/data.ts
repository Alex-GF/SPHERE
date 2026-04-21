export type NavChild = {
  label: string;
  to: string;
};

export type NavItem = {
  label: string;
  to?: string;
  children?: NavChild[];
};

export type ToolItem = {
  name: string;
  description: string;
  to: string;
  tone: 'blue' | 'emerald' | 'amber' | 'violet';
  label: string;
  glyph: 'editor' | 'assistant' | 'playground' | 'catalog' | 'collections' | 'research';
};

export type StoryChapter = {
  title: string;
  description: string;
};

export type Funder = {
  name: string;
  href: string;
  image: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Tools',
    children: [
      { label: 'Pricing2Yaml Editor', to: '/editor' },
      { label: 'HARVEY', to: '/harvey' },
      { label: 'HARVEY (Playground)', to: '/harvey-play' },
    ],
  },
  {
    label: 'Pricings',
    children: [
      { label: 'Pricings', to: '/pricings' },
      { label: 'Collections', to: '/pricings/collections' },
    ],
  },
  { label: 'Team', to: '/team' },
  { label: 'Research', to: '/research' },
];

export const SPHERE_TOOLS: ToolItem[] = [
  {
    name: 'Pricing2Yaml Editor',
    description: 'Transform and validate pricing models into a clean YAML source of truth.',
    to: '/editor',
    tone: 'blue',
    label: 'Model authoring',
    glyph: 'editor',
  },
  {
    name: 'HARVEY Assistant',
    description: 'Get guided pricing strategy suggestions from an AI-native planning copilot.',
    to: '/harvey',
    tone: 'emerald',
    label: 'AI copilot',
    glyph: 'assistant',
  },
  {
    name: 'HARVEY Playground',
    description: 'Run exploratory prompt flows and evaluate alternative monetization narratives.',
    to: '/harvey-play',
    tone: 'violet',
    label: 'Prompt labs',
    glyph: 'playground',
  },
  {
    name: 'Pricings Catalog',
    description: 'Browse structured pricing artifacts, compare revisions, and inspect live variants.',
    to: '/pricings',
    tone: 'amber',
    label: 'Catalog explorer',
    glyph: 'catalog',
  },
  {
    name: 'Collections',
    description: 'Group related pricing assets into reusable collection workspaces for teams.',
    to: '/pricings/collections',
    tone: 'blue',
    label: 'Team workspace',
    glyph: 'collections',
  },
  {
    name: 'Research Library',
    description: 'Access papers, benchmarks, and evidence-backed guidance for pricing decisions.',
    to: '/research',
    tone: 'emerald',
    label: 'Evidence base',
    glyph: 'research',
  },
];

export const PROOF_LOGOS = ['ISA Group', 'SCORE Lab', 'SPHERE Research', 'Pricing4TS', 'DevOps Studies', 'SaaS Benchmarks'];

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    title: 'Frame the pricing hypothesis',
    description:
      'Compose package structures, limits, and monetization rules while preserving version lineage and semantic consistency.',
  },
  {
    title: 'Stress-test scenarios quickly',
    description:
      'Simulate adoption and revenue shifts under controlled assumptions, then compare candidate strategies side by side.',
  },
  {
    title: 'Publish with governance controls',
    description:
      'Ship approved artifacts into downstream systems with transparent review checkpoints and rollback-ready snapshots.',
  },
];

export const RESEARCH_HIGHLIGHTS = [
  'assets/landing/research/presenter1.webp',
  'assets/landing/research/presenter3.webp',
  'assets/landing/research/group.webp',
  'assets/landing/research/award.webp',
];

export const FUNDERS: Funder[] = [
  {
    name: 'SCORE Lab',
    href: 'https://score.us.es',
    image: 'assets/landing/score.png',
  },
  {
    name: 'Spanish Research Agency',
    href: 'https://www.aei.gob.es',
    image: 'assets/landing/government.png',
  },
  {
    name: 'Universidad de Sevilla',
    href: 'https://www.us.es',
    image: 'assets/landing/university.png',
  },
];
