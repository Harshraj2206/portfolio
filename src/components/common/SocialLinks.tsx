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
            className="p-2.5 rounded-full apple-glass-chip apple-glass-chip-interactive text-white/80 hover:text-white transition-colors shadow-xs"
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
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-pill apple-glass-chip apple-glass-chip-interactive text-[14px] font-medium text-white/90 hover:text-white shadow-xs transition-colors"
        >
          {getIcon(link.platform)}
          <span>{link.label}</span>
          {link.handleOrNote && (
            <span className="text-[13px] text-[#A8A8AF]">
              ({link.handleOrNote})
            </span>
          )}
        </a>
      ))}
    </div>
  );
};
