import { useEffect, useState } from 'react';
import { breakpoints } from '../theme/tokens';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${breakpoints.tablet}px)`);
}

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${breakpoints.mobile - 1}px)`);
}
