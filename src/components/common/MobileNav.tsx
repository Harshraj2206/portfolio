import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { GlassButton } from './GlassButton';
import {
  Home,
  Briefcase,
  GitCommit,
  Layers,
  Mail,
  Menu,
  X,
  FileDown
} from 'lucide-react';

interface MobileNavProps {
  activeSection: string;
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  preferredName: string;
  resumeUrl: string;
  onDownloadResume: () => void;
  writingEnabled?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeSection,
  theme,
  resolvedTheme,
  onToggleTheme,
  preferredName,
  resumeUrl,
  onDownloadResume,
  writingEnabled = false,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const mainItems = [
    { id: 'hero', label: 'Home', href: '#hero', icon: Home },
    { id: 'projects', label: 'Work', href: '#projects', icon: Briefcase },
    { id: 'timeline', label: 'Record', href: '#timeline', icon: GitCommit },
    { id: 'skills', label: 'Skills', href: '#skills', icon: Layers },
    { id: 'contact', label: 'Contact', href: '#contact', icon: Mail },
  ];

  const fullNavLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Featured Projects & Case Studies', href: '#projects' },
    { label: 'The Record (Education & Experience)', href: '#timeline' },
    { label: 'Skills & Capabilities', href: '#skills' },
    { label: 'About & Engineering Ethos', href: '#about' },
    ...(writingEnabled ? [{ label: 'Writing & Learning Notes', href: '#writing' }] : []),
    { label: 'Recommendations & Praise', href: '#recommendations' },
    { label: 'Contact & Let\'s Talk', href: '#contact' },
  ];

  return (
    <>
      {/* Top Compact Mobile Bar */}
      <header className="fixed top-3 left-3 right-3 z-40 md:hidden flex items-center justify-between px-4 py-2.5 rounded-pill glass-nav shadow-sm">
        <a
          href="#hero"
          className="flex items-center gap-2 text-xs font-semibold text-apple-gray-900 dark:text-white"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-apple-blue to-apple-purple flex items-center justify-center text-white text-[11px] font-bold">
            {preferredName[0] || 'A'}
          </div>
          <span className="font-semibold tracking-tight">{preferredName}</span>
        </a>

        <div className="flex items-center gap-1">
          <ThemeToggle
            theme={theme}
            resolvedTheme={resolvedTheme}
            onToggle={onToggleTheme}
          />
          <button
            onClick={() => setSheetOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-full text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Bottom Floating Glass Dock for Mobile */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-3 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-40 md:hidden flex items-center justify-around py-1.5 px-1 sm:px-3 rounded-pill glass-nav shadow-lg"
      >
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-3 rounded-pill transition-colors ${
                isActive
                  ? 'text-apple-blue font-semibold scale-105'
                  : 'text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Expandable Glass Sheet Menu */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-md flex flex-col justify-end"
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white/90 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl p-6 rounded-t-panel border-t border-white/30 dark:border-white/10 shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
                <span className="text-sm font-semibold text-apple-gray-900 dark:text-white">
                  Navigation
                </span>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-apple-gray-500"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {fullNavLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setSheetOpen(false)}
                    className="block px-4 py-3 rounded-card text-sm font-medium text-apple-gray-800 dark:text-apple-gray-200 hover:bg-apple-blue/10 hover:text-apple-blue transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/10 flex flex-col gap-3">
                <GlassButton
                  variant="primary"
                  size="md"
                  href={resumeUrl}
                  isExternal
                  onClick={() => {
                    onDownloadResume();
                    setSheetOpen(false);
                  }}
                  icon={<FileDown className="w-4 h-4" />}
                  className="w-full justify-center"
                >
                  Download Résumé (PDF)
                </GlassButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
