import { motion } from 'framer-motion';

const partners = [
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

export default function FoundingPartnersSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Founding Partners</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Founded by Public Entities</h2>
          <p className="mt-3 max-w-3xl text-sm text-justify leading-relaxed text-slate-600">
            SPHERE is a collaborative effort backed by public entities, dedicated to advancing research and innovation in SaaS pricing. Our mission is to democratize access to cutting-edge technology, empowering researchers worldwide.
Discover the public entities, projects, and grants that have made SPHERE possible.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {partners.map((partner) => (
          <a
            key={partner.name}
            href={partner.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
          >
            <img src={partner.image} alt={partner.name} className="h-20 w-full object-contain" />
            <p className="mt-3 text-center text-sm font-medium text-slate-600 group-hover:text-slate-900">{partner.name}</p>
          </a>
        ))}
      </div>
    </motion.section>
  );
}
