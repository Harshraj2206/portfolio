import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { soundEngine } from './audio/soundEngine';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './styles/index.css';

// Module scope: eagerly create AudioContext before React mounts and call resume() immediately
soundEngine.ensureContext();

const tryQuietResume = () => {
  const c = soundEngine.getContext();
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {});
  }
};

// 1. Immediate resume call
tryQuietResume();

// 2. Check navigator.userActivation
if (typeof navigator !== 'undefined' && (navigator as unknown as { userActivation?: { hasBeenActive?: boolean } }).userActivation?.hasBeenActive) {
  tryQuietResume();
}

// 3. Retry resume quietly at 50, 150, 300, 600, and 1000ms after load
const retryDelays = [50, 150, 300, 600, 1000];
retryDelays.forEach((delay) => {
  setTimeout(() => {
    tryQuietResume();
  }, delay);
});

// 4. Retry on pageshow, focus, and visibilitychange
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', tryQuietResume, { passive: true });
  window.addEventListener('focus', tryQuietResume, { passive: true });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (!document.hidden) {
        tryQuietResume();
      }
    },
    { passive: true }
  );

  // 5. Invisible, passive window listeners (capture) for pointerdown, mousedown, keydown, touchstart, touchend, click
  const gestureEvents = [
    'pointerdown',
    'mousedown',
    'keydown',
    'touchstart',
    'touchend',
    'click',
  ] as const;

  const onFirstGesture = () => {
    tryQuietResume();
    gestureEvents.forEach((evt) => {
      window.removeEventListener(evt, onFirstGesture, { capture: true });
    });
  };

  gestureEvents.forEach((evt) => {
    window.addEventListener(evt, onFirstGesture, { capture: true, passive: true });
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
