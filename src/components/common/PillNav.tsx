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
  writingEnabled?: boolean;
}

export const PillNav: React.FC<PillNavProps> = ({
  activeSection,
  theme,
  resolvedTheme,
  onToggleTheme,
  preferredName,
  resumeUrl,
  onDownloadResume,
  writingEnabled = false,
}) => {
  const [scrolled, setScrolled] = useState(false);

  const navItems: NavItem[] = [
    { id: 'hero', label: 'Home', href: '#hero' },
    { id: 'projects', label: 'Work', href: '#projects' },
    { id: 'timeline', label: 'The Record', href: '#timeline' },
    { id: 'skills', label: 'Skills', href: '#skills' },
    { id: 'about', label: 'About', href: '#about' },
    ...(writingEnabled ? [{ id: 'writing', label: 'Writing', href: '#writing' }] : []),
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
          scrolled ? 'py-1.5 px-3 shadow-lg scale-95' : 'py-2 px-4 shadow-md'
        }`}
      >
        {/* Monogram / Brand mark */}
        <a
          href="#hero"
          className="flex items-center gap-2 pl-3 pr-2 py-1 text-xs font-semibold text-apple-gray-900 dark:text-white rounded-pill hover:opacity-80 transition-opacity"
          aria-label={`${preferredName} home`}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-apple-blue to-apple-purple flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
            {preferredName[0] || 'A'}
          </div>
          <span className="hidden lg:inline text-xs font-medium tracking-tight">
            {preferredName}
          </span>
        </a>

        <div className="h-4 w-px bg-black/10 dark:bg-white/15 mx-1" />

        {/* Links with Sliding Active Indicator */}
        <div className="flex items-center gap-1 relative">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`relative px-3.5 py-1.5 text-xs font-medium rounded-pill transition-colors duration-200 ${
                  isActive
                    ? 'text-apple-gray-900 dark:text-white font-semibold'
                    : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePillIndicator"
                    className="absolute inset-0 bg-white/70 dark:bg-white/15 rounded-pill shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="h-4 w-px bg-black/10 dark:bg-white/15 mx-1" />

        {/* Actions: Résumé Download Pill & Theme Toggle */}
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
