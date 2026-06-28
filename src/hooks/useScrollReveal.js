import { useEffect, useRef } from 'react';

export default function useScrollReveal({ threshold = 0.1, staggerMs = 80, deps = [] } = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const items = container.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    // Assign stagger delays per grid/flex parent group
    const groups = new Map();
    items.forEach(el => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach(group => {
      group.forEach((el, i) => {
        el.style.transitionDelay = `${i * staggerMs}ms`;
      });
    });

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -32px 0px' }
    );

    items.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, staggerMs, ...deps]);

  return containerRef;
}
