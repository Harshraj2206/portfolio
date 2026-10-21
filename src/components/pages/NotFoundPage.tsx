import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <GlassCard variant="panel" className="max-w-md w-full p-8 md:p-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-apple-blue/15 text-apple-blue flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-apple-blue">
            Error 404
          </span>
          <h1 className="text-3xl font-bold text-apple-gray-900 dark:text-white mt-1">
            Page Not Found
          </h1>
          <p className="mt-3 text-sm text-apple-gray-600 dark:text-apple-gray-400 leading-relaxed">
            The page or case study you were looking for doesn't exist or has moved. Let's get you back on track.
          </p>
        </div>

        <div>
          <GlassButton
            variant="primary"
            size="md"
            href="/"
            icon={<Home className="w-4 h-4" />}
            className="w-full justify-center"
          >
            Return to Portfolio
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
