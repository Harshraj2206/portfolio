import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Sparkles } from 'lucide-react';
import { portfolioContent } from '../data/content';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { Footer } from '../components/sections/Footer';
import { Chip } from '../components/common/Chip';

export const PhotographyPage: React.FC = () => {
  const { personal, meta, creative } = portfolioContent;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useDocumentHead({
    title: 'Photography & Videography — Harsh Raj',
    description: 'Photography and videography portfolio of Harsh Raj.',
    canonicalUrl: 'https://portfolio.example.com/photography',
    noindex: true,
  });

  const photoConfig = creative?.photography || {
    title: 'Photography & videography',
    description: "I love photography and videography, and I'm part of the Turing Club photography team at my university.",
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#F5F5F7] flex flex-col justify-between">
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-4 z-40 max-w-[1120px] mx-auto px-4 sm:px-6 w-full pt-2">
        <nav
          aria-label="Photography Page Navigation"
          className="flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-pill glass-nav shadow-lg"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[15px] font-medium tracking-[-0.01em] text-[#F5F5F7] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-pill"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to portfolio</span>
          </Link>

          <div className="flex items-center gap-2 text-[#C9C9CF] text-[13px] font-sans font-medium">
            <Camera className="w-4 h-4 text-white/70" />
            <span className="hidden sm:inline">visuals</span>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="relative z-10 max-w-[1120px] mx-auto px-6 sm:px-8 pt-12 sm:pt-16 pb-24 w-full">
        {/* Header Block */}
        <div className="space-y-4 mb-12 sm:mb-16">
          <Chip variant="default">
            <Camera className="w-4 h-4 text-white/70" />
            <span>Visual Showcase</span>
          </Chip>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-[#F5F5F7] leading-tight">
            {photoConfig.title}
          </h1>

          <p className="text-[18px] text-[#9A9AA0] max-w-[62ch] font-normal leading-[1.6]">
            {photoConfig.description}
          </p>
        </div>

        {/* Grid of 6 Empty Glass Tiles labelled "Coming soon" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-8 rounded-[28px] glass-surface aspect-[4/3] flex flex-col items-center justify-center text-center space-y-3 transition-colors hover:border-white/20 select-none group"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/50">
                <Sparkles className="w-5 h-5" />
              </div>
              <Chip variant="badge">
                Coming soon
              </Chip>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer
        personal={personal}
        meta={meta}
        resumeUrl="/resume.pdf"
      />
    </div>
  );
};
