import { useState, useEffect, useRef } from 'react';

export function useScrollSpy(sectionIds: string[], offset = 120) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '');
  const isClickScrollRef = useRef(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computeActiveSection = () => {
      if (isClickScrollRef.current) return;

      // 1. If at top of page or About is still below the upper-middle threshold, Hero is active
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        const aboutRect = aboutEl.getBoundingClientRect();
        // If the top of the About section hasn't reached the 40% mark of viewport height
        if (aboutRect.top > window.innerHeight * 0.4 || window.scrollY < 120) {
          if (sectionIds.includes('hero')) {
            setActiveSection('hero');
            return;
          }
        }
      } else if (window.scrollY < 120 && sectionIds.length > 0) {
        setActiveSection(sectionIds[0]);
        return;
      }

      // 2. Bottom of page check
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        if (sectionIds.length > 0) {
          setActiveSection(sectionIds[sectionIds.length - 1]);
          return;
        }
      }

      // 3. Find the section that covers the target line just below the navbar (~140px from top)
      const targetY = 140;
      let matchedSection = '';

      for (const id of sectionIds) {
        if (id === 'hero') continue;
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= targetY && rect.bottom > targetY) {
          matchedSection = id;
          break;
        }
      }

      if (!matchedSection) {
        let maxTop = -Infinity;
        for (const id of sectionIds) {
          if (id === 'hero') continue;
          const el = document.getElementById(id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top <= targetY && rect.top > maxTop) {
            maxTop = rect.top;
            matchedSection = id;
          }
        }
      }

      if (matchedSection) {
        setActiveSection(matchedSection);
      }
    };

    const handleScroll = () => {
      computeActiveSection();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    computeActiveSection();

    const lenis = (window as unknown as { __lenis?: { on: (event: string, fn: () => void) => void; off: (event: string, fn: () => void) => void } }).__lenis;
    if (lenis) {
      lenis.on('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (lenis) {
        lenis.off('scroll', handleScroll);
      }
    };
  }, [sectionIds, offset]);

  const setManualSection = (id: string) => {
    setActiveSection(id);
    isClickScrollRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollRef.current = false;
    }, 850);
  };

  return [activeSection, setManualSection] as const;
}
