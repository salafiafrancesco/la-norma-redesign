import { useEffect, useState } from 'react';

function resolveVisibleCount() {
  if (typeof window === 'undefined') {
    return 4;
  }

  return window.innerWidth <= 720 ? 2 : 4;
}

export function useResponsiveCardLimit() {
  const [visibleCount, setVisibleCount] = useState(resolveVisibleCount);

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(resolveVisibleCount());
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);

    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  return visibleCount;
}
