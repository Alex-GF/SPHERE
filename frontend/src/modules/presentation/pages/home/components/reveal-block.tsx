import { useEffect, useRef, useState, type ReactNode } from 'react';

export default function RevealBlock({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const revealRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = revealRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -12% 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={revealRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform-gpu transition-all duration-[900ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${isVisible ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-16 opacity-0 blur-md'} ${className}`}
    >
      {children}
    </div>
  );
}
