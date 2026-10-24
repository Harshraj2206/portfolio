import React, { useEffect, useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { SectionHeading } from '../common/SectionHeading';
import { Github, Star, GitFork, ExternalLink } from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  fork: boolean;
}

interface GitHubReposWidgetProps {
  username?: string;
  className?: string;
}

const languageColors: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Rust: '#DEA584',
  Go: '#00ADD8',
  'C++': '#F34B7D',
  C: '#555555',
  Java: '#B07219',
  HTML: '#E34F26',
  CSS: '#563D7C',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
};

export const GitHubReposWidget: React.FC<GitHubReposWidgetProps> = ({
  username = 'torvalds',
  className = '',
}) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // If username is empty or placeholder, do not make an invalid request
    if (!username || username === 'example' || username === 'yourname') {
      setHasError(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchRepos() {
      try {
        const response = await fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );

        if (!response.ok) {
          // If 404 or rate limit exceeded, fail gracefully
          setHasError(true);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Filter out forks if there are enough original repos, or take top 6
          const nonForks = data.filter((r: Repo) => !r.fork);
          const displayRepos = nonForks.length >= 3 ? nonForks.slice(0, 6) : data.slice(0, 6);
          setRepos(displayRepos);
        } else {
          setHasError(true);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          setHasError(true);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();

    return () => {
      controller.abort();
    };
  }, [username]);

  // Hidden gracefully if loading failed, rate limited, or empty
  if (hasError || (!loading && repos.length === 0)) {
    return null;
  }

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Updated today';
      if (diffDays === 1) return 'Updated yesterday';
      if (diffDays < 30) return `Updated ${diffDays}d ago`;
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) return `Updated ${diffMonths}mo ago`;
      return `Updated on ${date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`;
    } catch {
      return 'Recently active';
    }
  };

  return (
    <section
      id="github-activity"
      aria-label="Recent Open Source Activity"
      className={`max-w-6xl mx-auto px-4 sm:px-6 mb-28 md:mb-36 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        eyebrow="Open Source Pulse"
        title="Recent Public Repositories"
        subtitle={`Live telemetry synced from GitHub for @${username}.`}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-panel glass-surface animate-pulse bg-white/20 dark:bg-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => {
            const langColor = (repo.language && languageColors[repo.language]) || '#0A84FF';

            return (
              <GlassCard
                key={repo.id}
                variant="card"
                className="p-6 flex flex-col justify-between group hover:border-apple-blue/30 transition-all duration-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-apple-gray-900 dark:text-white group-hover:text-apple-blue transition-colors flex items-center gap-2 break-all"
                    >
                      <Github className="w-4 h-4 shrink-0 text-apple-gray-600 dark:text-apple-gray-400 group-hover:text-apple-blue" />
                      <span>{repo.name}</span>
                    </a>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${repo.name} repository`}
                      className="p-1.5 rounded-full text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-xs md:text-sm text-apple-gray-600 dark:text-apple-gray-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {repo.description || 'Open source software and systems engineering exploration.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-apple-gray-500 dark:text-apple-gray-400">
                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: langColor }}
                        />
                        {repo.language}
                      </span>
                    )}

                    {repo.stargazers_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {repo.stargazers_count}
                      </span>
                    )}

                    {repo.forks_count > 0 && (
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5" />
                        {repo.forks_count}
                      </span>
                    )}
                  </div>

                  <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                    {formatRelativeTime(repo.updated_at)}
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </section>
  );
};
