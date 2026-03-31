import { useEffect, useMemo, useRef, useState } from 'react';

export function useInView(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const observerOptions = useMemo(() => ({
    threshold: options.threshold ?? 0.12,
    root: options.root ?? null,
    rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
  }), [options.root, options.rootMargin, options.threshold]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(element);
      }
    }, observerOptions);

    observer.observe(element);
    return () => observer.disconnect();
  }, [observerOptions]);

  return [ref, isVisible];
}
