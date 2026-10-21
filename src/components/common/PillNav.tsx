import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassButton } from './GlassButton';
import { ThemeToggle } from './ThemeToggle';
import { FileDown } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

interface PillNavProps {
  activeSection: string;
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  preferredName: string;
  resumeUrl: string;
  onDownloadResume: () => void;
}

export const PillNav: React.FC<PillNavProps> = ({
  activeSection,
  theme,
  resolvedTheme,
  onToggleTheme,
  preferredName,
  resumeUrl,
  onDownloadResume,
}) => {
  const [scrolled, setScrolled] = useState(false);

  // Exactly 5 links per user specification
  const navItems: NavItem[] = [
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'experience', label: 'Experience', href: '#experience' },
    { id: 'skills', label: 'Skills', href: '#skills' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-5 left-0 right-0 z-40 hidden md:flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Primary Navigation"
        className={`pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-pill glass-nav transition-all duration-300 ${
          scrolled ? 'py-1.5 px-3 shadow-glass-dark scale-95' : 'py-2 px-4 shadow-md'
        }`}
      >
        {/* Monogram Brandmark */}
        <a
          href="#hero"
          className="flex items-center gap-2 pl-2 pr-2 py-1 text-[13px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] rounded-pill hover:opacity-80 transition-opacity"
          aria-label={`${preferredName} home`}
        >
          <div className="w-6 h-6 rounded-full bg-[#0A84FF] flex items-center justify-center text-white text-[12px] font-bold shadow-sm">
            {preferredName[0] || 'A'}
          </div>
          <span className="hidden lg:inline text-[13px] font-medium tracking-tight">
            {preferredName}
          </span>
        </a>

        <div className="h-4 w-px bg-black/10 dark:bg-white/12 mx-1" />

        {/* 5 Links with Sliding Active Indicator */}
        <div className="flex items-center gap-1 relative">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`relative px-3.5 py-1.5 text-[13px] font-medium rounded-pill transition-colors duration-200 ${
                  isActive
                    ? 'text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold'
                    : 'text-apple-gray-600 dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePillIndicator"
                    className="absolute inset-0 bg-black/5 dark:bg-white/12 rounded-pill shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="h-4 w-px bg-black/10 dark:bg-white/12 mx-1" />

        {/* Actions: Résumé Button & Theme Toggle */}
        <div className="flex items-center gap-1.5">
          <GlassButton
            variant="primary"
            size="sm"
            href={resumeUrl}
            isExternal
            onClick={onDownloadResume}
            icon={<FileDown className="w-3.5 h-3.5" />}
          >
            Résumé
          </GlassButton>

          <ThemeToggle
            theme={theme}
            resolvedTheme={resolvedTheme}
            onToggle={onToggleTheme}
          />
        </div>
      </nav>
    </header>
  );
};
