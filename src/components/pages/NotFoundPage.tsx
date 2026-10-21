import React from 'react';
import { Link } from 'react-router-dom';
import { GlassButton } from '../common/GlassButton';
import { WindowFrame } from '../common/WindowFrame';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { Home, Compass, Briefcase, Mail } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  useDocumentHead({
    title: '404 — Page Not Found | Senior Engineer Portfolio',
    description: "The page or case study you were looking for doesn't exist or has moved.",
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F5F5F7] dark:bg-[#0B0C10] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors">
      <div className="ambient-lighting" aria-hidden="true">
        <div className="top-blue-glow" />
      </div>

      <div className="relative z-10 max-w-md w-full">
        <WindowFrame title="Terminal — 404 Not Found">
          <div className="p-6 sm:p-10 text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#0A84FF]/10 text-[#0A84FF] flex items-center justify-center mx-auto shadow-inner">
              <Compass className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-pill neutral-glass-chip text-[12px] font-mono font-medium">
                HTTP Status: 404
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-[-0.03em]">
                Page not found
              </h1>
              <p className="text-[14px] text-apple-gray-600 dark:text-[#A1A1A6] leading-relaxed">
                The requested URL or case study route does not exist.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link to="/">
                <GlassButton
                  variant="primary"
                  size="md"
                  icon={<Home className="w-4 h-4" />}
                  className="w-full justify-center"
                >
                  Return to home
                </GlassButton>
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/#projects">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={<Briefcase className="w-3.5 h-3.5" />}
                    className="w-full justify-center text-[13px]"
                  >
                    Projects
                  </GlassButton>
                </Link>
                <Link to="/#contact">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={<Mail className="w-3.5 h-3.5" />}
                    className="w-full justify-center text-[13px]"
                  >
                    Contact
                  </GlassButton>
                </Link>
              </div>
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
};
