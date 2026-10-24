import { useState, useEffect, useRef } from 'react';

export function useScrollSpy(sectionIds: string[], offset = 120) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '');
  const isClickScrollRef = useRef(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entriesMapRef = useRef<Map<string, IntersectionObserverEntry>>(new Map());

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

      // 3. Fallback to intersecting entry with largest ratio or closest top
      const intersecting = Array.from(entriesMapRef.current.values()).filter(
        (entry) => entry.isIntersecting
      );

      if (intersecting.length > 0) {
        intersecting.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topEntry = intersecting[0];
        if (topEntry?.target?.id) {
          setActiveSection(topEntry.target.id);
        }
      }
    };

    const hasIntersectionObserver = typeof IntersectionObserver !== 'undefined';

    if (hasIntersectionObserver) {
      const observerCallback: IntersectionObserverCallback = (entries) => {
        entries.forEach((entry) => {
          entriesMapRef.current.set(entry.target.id, entry);
        });
        computeActiveSection();
      };

      const observer = new IntersectionObserver(observerCallback, {
        rootMargin: '-15% 0px -50% 0px',
        threshold: [0.1, 0.3, 0.6],
      });

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      const handleScroll = () => {
        computeActiveSection();
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
      };
    } else {
      // Fallback scroll listener
      const handleScroll = () => {
        if (isClickScrollRef.current) return;
        const scrollPosition = window.scrollY + offset;
        for (let i = sectionIds.length - 1; i >= 0; i--) {
          const id = sectionIds[i];
          const element = document.getElementById(id);
          if (element && scrollPosition >= element.offsetTop) {
            setActiveSection(id);
            return;
          }
        }
        if (sectionIds.length > 0) {
          setActiveSection(sectionIds[0]);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
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
