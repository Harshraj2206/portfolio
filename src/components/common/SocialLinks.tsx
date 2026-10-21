import React from 'react';
import { SocialLink } from '../../data/content.schema';
import {
  Github,
  Linkedin,
  Mail,
  FileText,
  Calendar,
  Twitter,
  ExternalLink
} from 'lucide-react';

interface SocialLinksProps {
  links: SocialLink[];
  variant?: 'pills' | 'icons';
  className?: string;
  onLinkClick?: (platform: string) => void;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  links,
  variant = 'pills',
  className = '',
  onLinkClick,
}) => {
  const getIcon = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'resume':
        return <FileText className="w-4 h-4" />;
      case 'calendly':
        return <Calendar className="w-4 h-4" />;
      case 'x':
        return <Twitter className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  // Only render enabled links with a valid URL
  const visibleLinks = links.filter((l) => l.enabled && l.url);

  if (variant === 'icons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {visibleLinks.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            onClick={() => onLinkClick?.(link.platform)}
            className="p-2.5 rounded-full glass-surface text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-blue dark:hover:text-apple-blue hover:scale-105 active:scale-95 transition-all shadow-xs"
          >
            {getIcon(link.platform)}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {visibleLinks.map((link) => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onLinkClick?.(link.platform)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-pill glass-surface text-xs font-medium text-apple-gray-700 dark:text-apple-gray-200 hover:text-apple-blue dark:hover:text-apple-blue hover:border-apple-blue/40 shadow-xs transition-all active:scale-95"
        >
          {getIcon(link.platform)}
          <span>{link.label}</span>
          {link.handleOrNote && (
            <span className="text-[11px] text-apple-gray-400">
              ({link.handleOrNote})
            </span>
          )}
        </a>
      ))}
    </div>
  );
};
