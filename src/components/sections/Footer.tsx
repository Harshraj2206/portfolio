import React from 'react';
import { PortfolioContent } from '../../data/content.schema';
import { ArrowUp } from 'lucide-react';

interface FooterProps {
  personal: PortfolioContent['personal'];
  meta: PortfolioContent['meta'];
  resumeUrl: string;
}

export const Footer: React.FC<FooterProps> = ({ personal, meta, resumeUrl }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Skills', href: '#skills' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
    { label: 'Résumé', href: resumeUrl, isExternal: true },
  ];

  return (
    <footer className="border-t border-black/5 dark:border-white/10 bg-white/40 dark:bg-[#0B0C10]/80 backdrop-blur-xl py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            <div className="w-5 h-5 rounded-full bg-[#0A84FF] flex items-center justify-center text-white text-[11px] font-bold">
              {personal.preferredName[0] || 'A'}
            </div>
            <span>{personal.fullName}</span>
          </div>
          <div className="text-[13px] text-apple-gray-500 dark:text-[#A1A1A6]">
            © {meta.copyrightYear} {personal.fullName}. Senior Software Engineer.
          </div>
        </div>

        {/* Center: Sitemap Links (Labels at least 13px) */}
        <nav
          aria-label="Footer Sitemap"
          className="flex flex-wrap items-center justify-center gap-5 text-[13px] font-medium text-apple-gray-600 dark:text-[#A1A1A6]"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              className="hover:text-[#0A84FF] dark:hover:text-[#409CFF] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Side: Back to Top Control */}
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="flex items-center gap-1.5 text-[13px] font-medium text-apple-gray-700 dark:text-[#F5F5F7] hover:text-[#0A84FF] transition-colors px-3.5 py-1.5 rounded-pill glass-surface"
        >
          <span>Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
