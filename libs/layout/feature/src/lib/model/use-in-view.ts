import { useEffect, useState, type RefObject } from 'react';

/**
 * Whether the referenced element intersects the viewport.
 *
 * Starts as `true` and stays `true` where IntersectionObserver does not exist,
 * so server rendering and old environments get the normal, non-compact layout.
 */
export function useInView(ref: RefObject<Element | null>): boolean {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setInView(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}
