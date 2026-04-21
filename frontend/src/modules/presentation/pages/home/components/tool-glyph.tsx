export default function ToolGlyph({
  tone,
  variant,
}: {
  tone: 'blue' | 'emerald' | 'amber' | 'violet';
  variant: 'editor' | 'assistant' | 'playground' | 'catalog' | 'collections' | 'research';
}) {
  const toneMap = {
    blue: {
      stroke: '#2563eb',
      fill: '#dbeafe',
    },
    emerald: {
      stroke: '#059669',
      fill: '#d1fae5',
    },
    amber: {
      stroke: '#d97706',
      fill: '#fef3c7',
    },
    violet: {
      stroke: '#7c3aed',
      fill: '#ede9fe',
    },
  };

  const selectedTone = toneMap[tone];

  const glyphPath = {
    editor: <path d="M16 31.5L20.5 30.5L32 19L29 16L17.5 27.5L16 31.5ZM23 17H18.5C17.1 17 16 18.1 16 19.5V22" stroke={selectedTone.stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    assistant: <path d="M24 17.5C20.4 17.5 17.5 20.4 17.5 24C17.5 27.6 20.4 30.5 24 30.5C27.6 30.5 30.5 27.6 30.5 24C30.5 20.4 27.6 17.5 24 17.5ZM24 14V16.5M24 31.5V34M14 24H16.5M31.5 24H34" stroke={selectedTone.stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    playground: <path d="M16.5 20.5L24 15L31.5 20.5V29.5L24 35L16.5 29.5V20.5ZM24 20V29M20 22.5L28 27.5" stroke={selectedTone.stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    catalog: <path d="M17 17.5H31M17 24H27M17 30.5H24M31 24V31.5M27.5 28H34.5" stroke={selectedTone.stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    collections: <path d="M15.5 19.5H26L28 22H32.5V31.5H15.5V19.5ZM19 16.5H23" stroke={selectedTone.stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    research: <path d="M21.5 28.5L18 32M20.5 25.5C23.3 28.3 27.8 28.3 30.6 25.5C33.4 22.7 33.4 18.2 30.6 15.4C27.8 12.6 23.3 12.6 20.5 15.4C17.7 18.2 17.7 22.7 20.5 25.5Z" stroke={selectedTone.stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  };

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
      <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="14" stroke={selectedTone.stroke} strokeWidth="1.2" opacity="0.25">
          <animate attributeName="r" values="12;14;12" dur="3.2s" repeatCount="indefinite" />
        </circle>
        <rect x="14" y="14" width="20" height="20" rx="6" fill={selectedTone.fill}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 24 24;6 24 24;0 24 24"
            dur="4.2s"
            repeatCount="indefinite"
          />
        </rect>
        {glyphPath[variant]}
      </svg>
    </div>
  );
}
