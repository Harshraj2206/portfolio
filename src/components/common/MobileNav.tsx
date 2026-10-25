import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import {
  User,
  Layers,
  Sparkles,
  Briefcase,
  Mail,
  Award,
  MoreHorizontal,
  X,
  FileDown
} from 'lucide-react';

interface MobileNavProps {
  activeSection: string;
  onSelectSection?: (id: string) => void;
  preferredName: string;
  resumeUrl: string;
  onDownloadResume: () => void;
  hasHighlights?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeSection,
  onSelectSection,
  preferredName,
  resumeUrl,
  onDownloadResume,
  hasHighlights = false,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // All navigation sections
  const allSections = [
    { id: 'about', label: 'About', href: '#about', icon: User },
    { id: 'projects', label: 'Projects', href: '#projects', icon: Briefcase },
    { id: 'skills', label: 'Skills', href: '#skills', icon: Layers },
    ...(hasHighlights ? [{ id: 'highlights', label: 'Highlights', href: '#highlights', icon: Award }] : []),
    { id: 'beyond-code', label: 'Beyond Code', href: '#beyond-code', icon: Sparkles },
    { id: 'contact', label: 'Contact', href: '#contact', icon: Mail },
  ];

  // Mobile Bottom Bar shows 5 items: 4 primary sections + "More"
  const bottomBarItems = [
    { id: 'about', label: 'About', href: '#about', icon: User },
    { id: 'projects', label: 'Projects', href: '#projects', icon: Briefcase },
    { id: 'skills', label: 'Skills', href: '#skills', icon: Layers },
    ...(hasHighlights
      ? [{ id: 'highlights', label: 'Highlights', href: '#highlights', icon: Award }]
      : [{ id: 'beyond-code', label: 'Beyond Code', href: '#beyond-code', icon: Sparkles }]),
    { id: 'more', label: 'More', href: '#more', icon: MoreHorizontal, isDrawerTrigger: true },
  ];

  // Determine which bottom bar item is active
  const isUnderMore = !bottomBarItems.some((item) => item.id === activeSection) && activeSection !== 'hero';
  const activeNavId = isUnderMore
    ? 'more'
    : bottomBarItems.some((item) => item.id === activeSection)
    ? activeSection
    : null;

  const springConfig = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 30 };

  return (
    <>
      {/* Top Compact Mobile Bar with Quick Reachable Resume Button */}
      <header
        data-sound-group="nav"
        className="fixed top-3 left-2.5 right-2.5 sm:left-4 sm:right-4 z-50 md:hidden pointer-events-auto flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 rounded-pill glass-nav shadow-lg"
      >
        <a
          href="#hero"
          onClick={() => onSelectSection?.('hero')}
          className="flex items-center gap-2 text-[14px] sm:text-[15px] font-medium tracking-[-0.01em] text-[#F5F5F7] min-h-[44px] py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-pill"
          aria-label={`${preferredName} home`}
        >
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white text-[12px] font-semibold shrink-0">
            {preferredName[0] || 'H'}
          </div>
          <span className="font-medium tracking-[-0.01em] truncate max-w-[100px] sm:max-w-none">{preferredName}</span>
        </a>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Reachable Resume Button */}
          <a
            href={resumeUrl}
            download="Harsh_Raj_Resume.pdf"
            onClick={onDownloadResume}
            className="nav-resume-btn flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[14px] font-medium tracking-[-0.01em] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white select-none"
            aria-label="Download Resume"
          >
            <FileDown className="w-3.5 h-3.5 shrink-0" />
            <span>Resume</span>
          </a>

          <button
            onClick={() => setSheetOpen(true)}
            aria-label="Open navigation menu"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#9A9AA0] hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Bottom Floating Glass Tab Bar with 5 items (min-h-[44px] touch target) */}
      <nav
        data-sound-group="nav"
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-3 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-50 md:hidden pointer-events-auto flex items-center justify-between p-1 rounded-pill glass-nav shadow-2xl"
      >
        {bottomBarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavId === item.id;

          if (item.isDrawerTrigger) {
            return (
              <button
                key={item.id}
                onClick={() => setSheetOpen(true)}
                aria-label="Open full menu"
                aria-expanded={sheetOpen}
                className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-pill min-h-[44px] transition-colors duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isActive
                    ? 'text-[#F5F5F7]'
                    : 'text-[#9A9AA0] hover:text-[#F5F5F7]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileSlidingNavBubble"
                    className="absolute inset-0 nav-glass-bubble-active rounded-pill pointer-events-none"
                    transition={springConfig}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="text-[11px] font-medium tracking-[-0.01em] mt-0.5 relative z-10">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <a
              key={item.id}
              href={item.href}
              onClick={() => {
                onSelectSection?.(item.id);
              }}
              aria-current={isActive ? 'true' : undefined}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-pill min-h-[44px] transition-colors duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isActive
                  ? 'text-[#F5F5F7]'
                  : 'text-[#9A9AA0] hover:text-[#F5F5F7]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileSlidingNavBubble"
                  className="absolute inset-0 nav-glass-bubble-active rounded-pill pointer-events-none"
                  transition={springConfig}
                />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="text-[11px] font-medium tracking-[-0.01em] mt-0.5 relative z-10">
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Expandable "More" Glass Sheet Menu */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-md flex flex-col justify-end"
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              data-sound-group="nav"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-[#0A0A0A]/95 backdrop-blur-2xl p-6 rounded-t-[28px] border-t border-white/10 shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-[15px] font-medium tracking-[-0.01em] text-[#F5F5F7]">
                  Navigation &amp; Sections
                </span>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 text-[#9A9AA0] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {allSections.map((link) => {
                  const Icon = link.icon;
                  const isCurrent = activeSection === link.id;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        onSelectSection?.(link.id);
                        setSheetOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-card text-[15px] font-medium tracking-[-0.01em] transition-colors ${
                        isCurrent
                          ? 'bg-white/15 text-white'
                          : 'text-[#D1D1D6] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-white/70" />
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <a
                  href={resumeUrl}
                  download="Harsh_Raj_Resume.pdf"
                  onClick={() => {
                    onDownloadResume();
                    setSheetOpen(false);
                  }}
                  className="nav-resume-btn group inline-flex items-center justify-center rounded-pill px-[22px] py-3 text-[15px] font-medium tracking-[-0.01em] gap-2 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer w-full"
                  aria-label="Download Resume"
                >
                  <FileDown className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>Resume (PDF)</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
