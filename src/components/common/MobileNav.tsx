import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { GlassButton } from './GlassButton';
import {
  Briefcase,
  GitCommit,
  Layers,
  User,
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
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeSection,
  theme,
  resolvedTheme,
  onToggleTheme,
  preferredName,
  resumeUrl,
  onDownloadResume,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  // Exactly 5 main items
  const mainItems = [
    { id: 'projects', label: 'Projects', href: '#projects', icon: Briefcase },
    { id: 'experience', label: 'Experience', href: '#experience', icon: GitCommit },
    { id: 'skills', label: 'Skills', href: '#skills', icon: Layers },
    { id: 'about', label: 'About', href: '#about', icon: User },
    { id: 'contact', label: 'Contact', href: '#contact', icon: Mail },
  ];

  return (
    <>
      {/* Top Compact Mobile Bar */}
      <header className="fixed top-3 left-3 right-3 z-40 md:hidden flex items-center justify-between px-4 py-2 rounded-pill glass-nav shadow-md">
        <a
          href="#hero"
          className="flex items-center gap-2 text-[13px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]"
        >
          <div className="w-6 h-6 rounded-full bg-[#0A84FF] flex items-center justify-center text-white text-[12px] font-bold">
            {preferredName[0] || 'A'}
          </div>
          <span className="font-semibold tracking-tight">{preferredName}</span>
        </a>

        <div className="flex items-center gap-1.5">
          <ThemeToggle
            theme={theme}
            resolvedTheme={resolvedTheme}
            onToggle={onToggleTheme}
          />
          <button
            onClick={() => setSheetOpen(true)}
            aria-label="Open navigation menu"
            className="p-1.5 rounded-full text-apple-gray-600 dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Bottom Floating Glass Dock for Mobile */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-3 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-40 md:hidden flex items-center justify-around py-2 px-2 rounded-pill glass-nav shadow-lg"
      >
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-pill transition-colors ${
                isActive
                  ? 'text-[#0A84FF] dark:text-[#409CFF] font-semibold scale-105'
                  : 'text-apple-gray-500 dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[11px] mt-0.5">{item.label}</span>
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
            className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-md flex flex-col justify-end"
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-[#FFFFFF]/95 dark:bg-[#16171D]/95 backdrop-blur-2xl p-6 rounded-t-[28px] border-t border-black/10 dark:border-white/10 shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
                <span className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
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
                {mainItems.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setSheetOpen(false)}
                    className="block px-4 py-3 rounded-card text-[15px] font-medium text-apple-gray-800 dark:text-[#D1D1D6] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#0A84FF] transition-colors"
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
                  Résumé
                </GlassButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
