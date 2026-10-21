import React from 'react';
import { Link } from 'react-router-dom';
import { GlassButton } from '../common/GlassButton';
import { WindowFrame } from '../common/WindowFrame';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { Home, Compass, Briefcase, Mail } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  useDocumentHead({
    title: '404 — Page Not Found | Glass Portfolio',
    description: "The page or case study you were looking for doesn't exist or has moved.",
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-apple-gray-100 dark:bg-[#0B0D12] text-apple-gray-900 dark:text-apple-gray-100 transition-colors">
      <div className="max-w-md w-full">
        <WindowFrame title="Terminal — 404 Not Found">
          <div className="p-6 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-apple-blue/15 text-apple-blue flex items-center justify-center mx-auto shadow-inner">
              <Compass className="w-8 h-8 animate-spin-slow" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-pill bg-black/5 dark:bg-white/10 text-xs font-mono font-bold text-apple-blue tracking-wider uppercase">
                HTTP Status: 404
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-apple-gray-900 dark:text-white tracking-tight">
                Page Not Found
              </h1>
              <p className="text-xs sm:text-sm text-apple-gray-600 dark:text-apple-gray-400 leading-relaxed">
                The requested URL or case study route does not exist. Let's get you back to the portfolio work.
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
                  Return to Home
                </GlassButton>
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/#projects">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={<Briefcase className="w-3.5 h-3.5" />}
                    className="w-full justify-center text-xs"
                  >
                    View Projects
                  </GlassButton>
                </Link>
                <Link to="/#contact">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={<Mail className="w-3.5 h-3.5" />}
                    className="w-full justify-center text-xs"
                  >
                    Contact Me
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
