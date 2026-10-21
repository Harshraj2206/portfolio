import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { PortfolioContent } from '../../data/content.schema';
import confetti from 'canvas-confetti';
import {
  Clock,
  MapPin,
  Sparkles,
  FileDown,
  Check,
  Copy,
  ExternalLink,
  Zap,
  Briefcase
} from 'lucide-react';

interface RecruiterQuickViewProps {
  recruiterData: PortfolioContent['recruiterQuickView'];
  personal: PortfolioContent['personal'];
  resumeUrl: string;
  onDownloadResume: () => void;
  onSelectProject: (projectId: string) => void;
  className?: string;
}

export const RecruiterQuickView: React.FC<RecruiterQuickViewProps> = ({
  recruiterData,
  personal,
  resumeUrl,
  onDownloadResume,
  onSelectProject,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySnippet = () => {
    const textToCopy = `${personal.fullName} | ${recruiterData.roleSought}\nLocation: ${recruiterData.location}\nTop Skills: ${recruiterData.topSkills.join(', ')}\nEmail: student@university.edu\nPortfolio: https://portfolio.example.com\nRésumé: https://portfolio.example.com${resumeUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0A84FF', '#AF52DE', '#30B0C7'],
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`max-w-6xl mx-auto px-6 mb-16 ${className}`}>
      <GlassCard
        variant="panel"
        className="p-6 md:p-8 border-apple-blue/30 shadow-glass-light dark:shadow-glass-dark"
      >
        {/* Top Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-apple-blue/15 text-apple-blue">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-apple-blue">
                  Recruiter Fast Track
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">
                  <Clock className="w-3 h-3" /> 10-second overview
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-apple-gray-900 dark:text-white">
                {personal.fullName} — Executive Snapshot
              </h3>
            </div>
          </div>

          {/* Quick Copy Snippet Button */}
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={handleCopySnippet}
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied Candidate Card!' : 'Copy Summary Snippet'}
          </GlassButton>
        </div>

        {/* 4 Key Evaluation Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6 border-b border-black/5 dark:border-white/10">
          {/* Target Role */}
          <div>
            <div className="text-xs font-medium text-apple-gray-500 dark:text-apple-gray-400 flex items-center gap-1.5 mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-apple-blue" /> Target Role
            </div>
            <div className="text-sm font-semibold text-apple-gray-900 dark:text-white">
              {recruiterData.roleSought}
            </div>
            <div className="text-xs text-apple-gray-500 mt-1">
              Available Summer 2027 (12+ weeks)
            </div>
          </div>

          {/* Location & Authorization */}
          <div>
            <div className="text-xs font-medium text-apple-gray-500 dark:text-apple-gray-400 flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-apple-blue" /> Location & Mobility
            </div>
            <div className="text-sm font-semibold text-apple-gray-900 dark:text-white">
              {recruiterData.location}
            </div>
            <div className="text-xs text-apple-gray-500 mt-1 truncate" title={recruiterData.workAuthorization}>
              {recruiterData.workAuthorization}
            </div>
          </div>

          {/* Core Strengths */}
          <div>
            <div className="text-xs font-medium text-apple-gray-500 dark:text-apple-gray-400 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-apple-blue" /> Top 3 Technical Strengths
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recruiterData.topSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-pill bg-black/5 dark:bg-white/10 text-xs font-medium text-apple-gray-800 dark:text-apple-gray-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Flagship Case Study */}
          <div>
            <div className="text-xs font-medium text-apple-gray-500 dark:text-apple-gray-400 flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-apple-blue" /> Best Proof of Work
            </div>
            <button
              onClick={() => onSelectProject(recruiterData.flagshipProjectId)}
              className="text-left group text-sm font-semibold text-apple-blue hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5"
            >
              <span>AuraKV Distributed Cache</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <div className="text-xs text-apple-gray-500 mt-1">
              Sub-1.2ms p99 latency under 100k QPS
            </div>
          </div>
        </div>

        {/* Bottom CTA Row: Résumé Download & Direct Contact */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400">
            <span>Verified Links:</span>
            <a
              href="https://github.com/example"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-apple-blue transition-colors underline decoration-dotted"
            >
              GitHub (12+ Repos)
            </a>
            <a
              href="https://linkedin.com/in/example"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-apple-blue transition-colors underline decoration-dotted"
            >
              LinkedIn Profile
            </a>
            <a
              href="mailto:student@university.edu"
              className="hover:text-apple-blue transition-colors underline decoration-dotted"
            >
              student@university.edu
            </a>
          </div>

          <GlassButton
            variant="primary"
            size="md"
            href={resumeUrl}
            isExternal
            onClick={onDownloadResume}
            icon={<FileDown className="w-4 h-4" />}
          >
            Download Official Résumé (PDF)
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
