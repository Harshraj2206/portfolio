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
    { label: 'Work', href: '#projects' },
    { label: 'The Record', href: '#timeline' },
    { label: 'Skills', href: '#skills' },
    { label: 'About', href: '#about' },
    { label: 'Recommendations', href: '#recommendations' },
    { label: 'Contact', href: '#contact' },
    { label: 'Résumé', href: resumeUrl, isExternal: true },
  ];

  return (
    <footer className="border-t border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1">
          <div className="flex items-center gap-2 text-sm font-bold text-apple-gray-900 dark:text-white">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-apple-blue to-apple-purple flex items-center justify-center text-white text-[10px] font-bold">
              {personal.preferredName[0] || 'A'}
            </div>
            <span>{personal.fullName}</span>
          </div>
          <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
            © {meta.copyrightYear} {personal.fullName}. Designed with Apple Liquid Glass craftsmanship.
          </div>
        </div>

        {/* Center: Sitemap Links */}
        <nav aria-label="Footer Sitemap" className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              className="hover:text-apple-blue transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Side: Back to Top Control */}
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="flex items-center gap-1.5 text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 hover:text-apple-blue transition-colors px-3 py-1.5 rounded-pill glass-surface"
        >
          <span>Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
