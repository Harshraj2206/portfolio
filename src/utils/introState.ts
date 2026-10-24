/**
 * Module-level in-memory flag for the cinematic hero intro.
 *
 * Behavior:
 * - Fresh page load / browser refresh: memory resets, intro plays.
 * - Client-side SPA route navigation (e.g. ProjectPage -> HomePage):
 *   memory retains true, intro does NOT replay.
 */
let hasHeroIntroPlayed = false;
let hasPortraitDone = false;

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

