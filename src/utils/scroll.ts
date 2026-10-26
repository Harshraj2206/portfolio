/**
 * Scroll Utility for Portfolio
 * Smoothly scrolls to a section using Lenis, landing with the section heading
 * just below the fixed navbar: offset: -(navbar height + 24).
 * Adjusts and settles accurately even when reveal animations change page height.
 */

export function scrollToSection(sectionId: string) {
  const lenis = typeof window !== 'undefined' ? window.__lenis : undefined;

  if (sectionId === 'hero') {
    if (lenis) {
      lenis.scrollTo(0);
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }

  const el = document.getElementById(sectionId);
  if (!el) return;

  // Land with the section heading just below the fixed navbar
  const target = el.querySelector('h2') || el;

  const getOffset = () => {
    const navEl = document.querySelector('header nav') || document.querySelector('header');
    const navBottom = navEl
      ? navEl.getBoundingClientRect().bottom
      : window.innerWidth < 768
      ? 60
      : 72;
    return -(navBottom + 24);
  };

  const offset = getOffset();

  if (lenis) {
    const settle = () => {
      const currentOffset = getOffset();
      const desiredTop = -currentOffset;
      const actualTop = target.getBoundingClientRect().top;
      // If reveal animations shifted the element, readjust immediately
      if (Math.abs(actualTop - desiredTop) > 3) {
        lenis.scrollTo(target, { offset: currentOffset, immediate: true });
      }
    };

    lenis.scrollTo(target, {
      offset,
      onComplete: settle,
    });

    // Settle after reveal animations progress
    setTimeout(settle, 300);
    setTimeout(settle, 750);
  } else {
    const navOffset = -getOffset();
    const targetY = target.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }
}
