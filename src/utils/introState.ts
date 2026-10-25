/**
 * Module-level state with sessionStorage persistence for the cinematic hero intro.
 *
 * Behavior:
 * - First visit in a browsing session: intro plays.
 * - Refresh or client-side navigation within the same session: intro does NOT replay.
 * - Closes and reopens browser/tab: new session, intro plays once.
 */

const SESSION_STORAGE_KEY = 'hero_intro_played';

let hasHeroIntroPlayed = false;
let hasPortraitDone = false;

try {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    hasHeroIntroPlayed = window.sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
    if (hasHeroIntroPlayed) {
      hasPortraitDone = true;
    }
  }
} catch {
  // Gracefully fallback to in-memory state if sessionStorage is restricted (e.g. private mode)
}

type IntroListener = (played: boolean) => void;
type PortraitDoneListener = () => void;

const listeners = new Set<IntroListener>();
const portraitDoneListeners = new Set<PortraitDoneListener>();

export const getHeroIntroPlayed = (): boolean => {
  if (hasHeroIntroPlayed) return true;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (window.sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true') {
        hasHeroIntroPlayed = true;
        hasPortraitDone = true;
        return true;
      }
    }
  } catch {
    // In environments where sessionStorage is blocked
  }
  return hasHeroIntroPlayed;
};

export const getPortraitDone = (): boolean => {
  return hasPortraitDone || getHeroIntroPlayed();
};

export const markHeroIntroPlayed = (): void => {
  hasHeroIntroPlayed = true;
  hasPortraitDone = true;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    }
  } catch {
    // Gracefully handle quota/private browsing errors
  }
  portraitDoneListeners.forEach((fn) => fn());
  listeners.forEach((fn) => fn(true));
};

export const markPortraitDone = (): void => {
  hasPortraitDone = true;
  portraitDoneListeners.forEach((fn) => fn());
};

export const subscribeHeroIntro = (fn: IntroListener): (() => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const subscribePortraitDone = (fn: PortraitDoneListener): (() => void) => {
  portraitDoneListeners.add(fn);
  return () => {
    portraitDoneListeners.delete(fn);
  };
};
