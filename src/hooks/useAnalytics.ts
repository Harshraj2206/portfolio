/**
 * Privacy-preserving analytics utility.
 * Supports Plausible or Umami without cookies or personal data tracking.
 */

export function useAnalytics(analyticsId?: string) {
  const trackEvent = (eventName: string, props?: Record<string, string | number | boolean>) => {
    if (typeof window === 'undefined') return;

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`[Analytics Event: ${eventName}]`, { analyticsId, ...(props || {}) });
    }

    // Window Plausible hook
    if (typeof (window as unknown as { plausible?: (event: string, opts?: unknown) => void }).plausible === 'function') {
      (window as unknown as { plausible: (event: string, opts?: unknown) => void }).plausible(eventName, { props });
    }

    // Window Umami hook
    if (typeof (window as unknown as { umami?: { track: (event: string, data?: unknown) => void } }).umami?.track === 'function') {
      (window as unknown as { umami: { track: (event: string, data?: unknown) => void } }).umami.track(eventName, props);
    }
  };

  const trackResumeDownload = () => {
    trackEvent('resume_download', { timestamp: new Date().toISOString() });
  };

  const trackProjectClick = (projectId: string, destination: 'demo' | 'github' | 'casestudy') => {
    trackEvent('project_click', { projectId, destination });
  };

  return { trackEvent, trackResumeDownload, trackProjectClick };
}
