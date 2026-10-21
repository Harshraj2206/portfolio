import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { portfolioContent } from './data/content';
import { useTheme } from './hooks/useTheme';
import { HomePage } from './pages/HomePage';

const ProjectPage = lazy(() =>
  import('./pages/ProjectPage').then((m) => ({ default: m.ProjectPage }))
);
const NotFoundPage = lazy(() =>
  import('./components/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

export function App() {
  const { meta } = portfolioContent;
  const { theme, resolvedTheme, toggleTheme } = useTheme(meta.defaultTheme);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-apple-gray-100 dark:bg-[#0B0D12]">
          <div className="w-8 h-8 rounded-full border-2 border-apple-blue border-t-transparent animate-spin" />
        </div>
      }
    >
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              theme={theme}
              resolvedTheme={resolvedTheme}
              onToggleTheme={toggleTheme}
            />
          }
        />
        <Route
          path="/projects/:slug"
          element={
            <ProjectPage
              theme={theme}
              resolvedTheme={resolvedTheme}
              onToggleTheme={toggleTheme}
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
