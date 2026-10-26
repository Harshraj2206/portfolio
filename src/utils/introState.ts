/**
 * Module-level state with sessionStorage persistence for the cinematic hero intro.
 *
 * Behavior:
 * - First visit in a browsing session: intro plays.
 * - Refresh or client-side navigation within the same session: intro does NOT replay.
 * - Closes and reopens browser/tab: new session, intro plays once.
 */

let hasHeroIntroPlayed = false;
let hasPortraitDone = false;

// Remove any residual sessionStorage item from previous sessions
try {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.removeItem('hero_intro_played');
  }
} catch {
  // Gracefully handle environments with restricted storage
}

type IntroListener = (played: boolean) => void;
type PortraitDoneListener = () => void;

const listeners = new Set<IntroListener>();
const portraitDoneListeners = new Set<PortraitDoneListener>();

export const getHeroIntroPlayed = (): boolean => {
  return hasHeroIntroPlayed;
};

export const getPortraitDone = (): boolean => {
  return hasPortraitDone || hasHeroIntroPlayed;
};

export const markHeroIntroPlayed = (): void => {
  hasHeroIntroPlayed = true;
  hasPortraitDone = true;
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
