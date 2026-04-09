import { useEffect, useState } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

function useMatchMedia(query: string) {
  const getMatches = () => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', listener);

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}


export function useResponsive(query: string, start : Breakpoint, end: Breakpoint = 'md') {
  const startPx = BREAKPOINTS[start];
  const endPx = BREAKPOINTS[end];

  const mediaUp = useMatchMedia(`(min-width: ${startPx}px)`);

  const mediaDown = useMatchMedia(`(max-width: ${Math.max(startPx - 0.05, 0)}px)`);

  const mediaBetween = useMatchMedia(
    `(min-width: ${startPx}px) and (max-width: ${Math.max(endPx - 0.05, 0)}px)`
  );

  const orderedBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const currentIndex = orderedBreakpoints.indexOf(start);
  const nextBreakpoint = orderedBreakpoints[currentIndex + 1];
  const nextValue = nextBreakpoint ? BREAKPOINTS[nextBreakpoint] : Number.MAX_SAFE_INTEGER;
  const mediaOnly = useMatchMedia(
    `(min-width: ${startPx}px) and (max-width: ${Math.max(nextValue - 0.05, 0)}px)`
  );

  if (query === 'up') {
    return mediaUp;
  }

  if (query === 'down') {
    return mediaDown;
  }

  if (query === 'between') {
    return mediaBetween;
  }

  return mediaOnly;
}


export function useWidth() {
  const [currentWidth, setCurrentWidth] = useState<Breakpoint>('xs');

  useEffect(() => {
    const getBreakpoint = (): Breakpoint => {
      const width = window.innerWidth;

      if (width >= BREAKPOINTS.xl) return 'xl';
      if (width >= BREAKPOINTS.lg) return 'lg';
      if (width >= BREAKPOINTS.md) return 'md';
      if (width >= BREAKPOINTS.sm) return 'sm';

      return 'xs';
    };

    const handleResize = () => {
      setCurrentWidth(getBreakpoint());
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return currentWidth;
}
