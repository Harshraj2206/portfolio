import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';
import { PortfolioContent } from '../../data/content.schema';
import { Chip } from '../common/Chip';
import { WebglParticleEngine } from './hero/webglPortrait';
import { soundEngine } from '../../audio/soundEngine';
import { introSound } from '../../audio/introSound';
import { markPortraitDone } from '../../utils/introState';
import { scrollToSection } from '../../utils/scroll';
import {
  INTRO_TIMING,
  DOT_MODE,
  LETTER_STAGGER,
  LETTER_DURATION,
  DOT_DROP_DURATION,
} from '../../config/introTiming';

interface HeroProps {
  personal: PortfolioContent['personal'];
  availability?: PortfolioContent['availability'];
  resumeUrl: string;
  onDownloadResume: () => void;
  onNavFadeIn?: () => void;
  onIntroComplete?: () => void;
  isIntroAlreadyDone?: boolean;
  onSelectSection?: (id: string) => void;
}

export interface ReelSlotConfig {
  startChar: string;
  targetChar: string;
  reelChars: string[];
}

// 9 Character Slots: 1:1 mapping from "HARSH RAJ" to "PORTFOLIO"
// Each slot contains 9 items: [startChar, 7 intermediate uppercase letters (never equal to neighbor), targetChar]
export const REEL_CONFIGS: ReelSlotConfig[] = [
  { startChar: 'H', targetChar: 'P', reelChars: ['H', 'K', 'M', 'E', 'B', 'W', 'N', 'X', 'P'] },
  { startChar: 'A', targetChar: 'O', reelChars: ['A', 'D', 'G', 'Z', 'U', 'Q', 'V', 'T', 'O'] },
  { startChar: 'R', targetChar: 'R', reelChars: ['R', 'T', 'V', 'M', 'G', 'L', 'S', 'K', 'R'] },
  { startChar: 'S', targetChar: 'T', reelChars: ['S', 'U', 'W', 'H', 'Y', 'N', 'D', 'E', 'T'] },
  { startChar: 'H', targetChar: 'F', reelChars: ['H', 'J', 'L', 'P', 'R', 'B', 'M', 'C', 'F'] },
  { startChar: ' ', targetChar: 'O', reelChars: [' ', 'N', 'Q', 'K', 'X', 'Z', 'W', 'U', 'O'] },
  { startChar: 'R', targetChar: 'L', reelChars: ['R', 'A', 'E', 'G', 'H', 'S', 'F', 'P', 'L'] },
  { startChar: 'A', targetChar: 'I', reelChars: ['A', 'C', 'F', 'O', 'Y', 'J', 'B', 'H', 'I'] },
  { startChar: 'J', targetChar: 'O', reelChars: ['J', 'M', 'P', 'T', 'V', 'R', 'K', 'D', 'O'] },
];

interface FontAndSlotMetrics {
  nSize: number;
  pSize: number;
  dotDiameter: number;
  nWs: number[];
  pWs: number[];
  nTotal: number;
  pTotal: number;
}

function computeSizesAndWidths(containerW: number): FontAndSlotMetrics {
  // 1. Name Font Size: fits container with >=20px margin on mobile (390px), clamp up to 140px on desktop
  const maxNameW = Math.max(240, containerW - 48);
  let nSize = Math.floor(maxNameW / 5.55);
  nSize = Math.min(140, Math.max(36, nSize));

  // 2. PORTFOLIO Font Size: fits container with >=16px margin on each side
  const maxPortW = Math.max(260, containerW - 44);
  let pSize = Math.floor(maxPortW / 5.65);
  pSize = Math.min(220, Math.max(44, pSize));

  const dotDiameter = Math.max(12, Math.round(nSize * 0.12));

  let nWs = [60, 58, 60, 56, 60, 26, 60, 58, 48];
  let pWs = [70, 70, 68, 66, 64, 70, 62, 28, 70];

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `800 ${nSize}px "Inter Variable", Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
      const trackingOffsetN = nSize * 0.04;
      nWs = REEL_CONFIGS.map((slot) => {
        if (slot.startChar === ' ') {
          return Math.round(ctx.measureText(' ').width * 0.85);
        }
        return Math.max(12, Math.round(ctx.measureText(slot.startChar).width - trackingOffsetN));
      });

      ctx.font = `800 ${pSize}px "Inter Variable", Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
      const trackingOffsetP = pSize * 0.04;
      pWs = REEL_CONFIGS.map((slot) => {
        return Math.max(12, Math.round(ctx.measureText(slot.targetChar).width - trackingOffsetP));
      });
    }
  }

  const nTotal = nWs.reduce((a, b) => a + b, 0);
  const pTotal = pWs.reduce((a, b) => a + b, 0);

  return { nSize, pSize, dotDiameter, nWs, pWs, nTotal, pTotal };
}

export const Hero: React.FC<HeroProps> = ({
  personal,
  availability,
  resumeUrl,
  onDownloadResume,
  onNavFadeIn,
  onIntroComplete,
  isIntroAlreadyDone = false,
  onSelectSection,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const wordContainerRef = useRef<HTMLDivElement>(null);
  const nameLineRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const skipBtnRef = useRef<HTMLButtonElement>(null);

  const particleEngineRef = useRef<WebglParticleEngine | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const metricsRef = useRef<FontAndSlotMetrics | null>(null);

  const isSessionDone = typeof window !== 'undefined' && (() => {
    try {
      return sessionStorage.getItem('portfolio_intro_done') === 'true';
    } catch {
      return false;
    }
  })();
  const effectiveIntroDone = isIntroAlreadyDone || Boolean(isSessionDone);

  const [isIntroActive, setIsIntroActive] = useState(!effectiveIntroDone);
  const [showSkipBtn, setShowSkipBtn] = useState(false);
  const [dotRemoved, setDotRemoved] = useState(effectiveIntroDone);

  const isSkippingRef = useRef(false);
  const introStartTimeRef = useRef<number>(0);

  // Complete Intro Handler: guarantees instant jump straight to final hero state
  const finishIntro = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    introSound.stopAll(0);
    setIsIntroActive(false);
    setShowSkipBtn(false);
    setDotRemoved(true);
    document.body.style.overflow = '';

    const initialDot = document.getElementById('initial-intro-dot');
    const initialVignette = document.getElementById('initial-intro-vignette');
    if (initialDot) initialDot.remove();
    if (initialVignette) initialVignette.remove();

    if (dotRef.current) {
      gsap.killTweensOf(dotRef.current);
      gsap.set(dotRef.current, { opacity: 0, scale: 0 });
    }

    if (wordContainerRef.current && containerRef.current) {
      gsap.killTweensOf(wordContainerRef.current);
      const heroH = containerRef.current.clientHeight || window.innerHeight;
      const heroW = containerRef.current.clientWidth || window.innerWidth;
      const metrics = metricsRef.current || computeSizesAndWidths(heroW);
      const finalScale = metrics.pSize / metrics.nSize;
      gsap.set(wordContainerRef.current, {
        opacity: 1,
        y: heroH * 0.26,
        scale: finalScale,
        filter: 'blur(0px)',
      });

      if (particleEngineRef.current) {
        const heroRect = containerRef.current.getBoundingClientRect();
        const wordRect = wordContainerRef.current.getBoundingClientRect();
        particleEngineRef.current.setWordPosition(wordRect.top - heroRect.top, wordRect.height || metrics.pSize);
      }
    }

    slotRefs.current.forEach((slot, idx) => {
      if (slot) {
        gsap.killTweensOf(slot);
        gsap.set(slot, {
          width: 'auto',
          overflow: 'hidden',
        });
      }
      const reelEl = reelRefs.current[idx];
      if (reelEl) {
        gsap.killTweensOf(reelEl);
        const spans = reelEl.querySelectorAll('span');
        spans.forEach((span, cIdx) => {
          if (cIdx < 8) {
            const s = span as HTMLElement;
            s.style.width = '0px';
            s.style.overflow = 'hidden';
          } else {
            const s = span as HTMLElement;
            s.style.display = 'block';
            s.style.visibility = 'visible';
          }
        });
        gsap.set(reelEl, {
          x: 0,
          y: '-8em',
          scale: 1,
          rotationZ: 0,
          rotationX: 0,
          rotationY: 0,
          filter: 'blur(0px)',
          opacity: 1,
        });
      }
    });

    const extraGlyphs = nameLineRef.current?.querySelectorAll('.reel-extra-glyph');
    if (extraGlyphs) {
      extraGlyphs.forEach((el) => {
        (el as HTMLElement).style.visibility = 'visible';
      });
    }

    if (subtitleRef.current) {
      const words = subtitleRef.current.querySelectorAll('.pop-word');
      gsap.killTweensOf(words);
      gsap.set(words, { y: '0%', opacity: 1 });
    }

    if (bottomRowRef.current) {
      const items = bottomRowRef.current.querySelectorAll('.pop-item');
      gsap.killTweensOf(items);
      gsap.set(items, { y: '0%', opacity: 1 });
    }

    if (scrollCueRef.current) {
      gsap.killTweensOf(scrollCueRef.current);
      gsap.set(scrollCueRef.current, { opacity: 1 });
    }

    if (particleEngineRef.current) {
      particleEngineRef.current.jumpToFinal();
    }

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('portfolio_intro_done', 'true');
      }
    } catch {
      // Ignore storage errors
    }

    markPortraitDone();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hero:portraitDone'));
    }
    onNavFadeIn?.();
    onIntroComplete?.();
  }, [onNavFadeIn, onIntroComplete]);

  // Skip Intro Handler: jump timeline straight to end so every tween reaches final value
  const skipIntro = useCallback(() => {
    soundEngine.play('state', { gain: 0.60 });
    introSound.stopAll(0);
    isSkippingRef.current = true;
    if (timelineRef.current) {
      timelineRef.current.progress(1);
    } else {
      finishIntro();
    }
  }, [finishIntro]);

  // Keyboard (Esc), Scroll, and Touch Skip Listeners (only Escape/wheel/touchmove skip)
  useEffect(() => {
    if (!isIntroActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipIntro();
      }
    };

    const handleWheelOrTouch = (e: Event) => {
      if (e.type === 'wheel' || e.type === 'touchmove') {
        skipIntro();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheelOrTouch, { passive: true });
    window.addEventListener('touchmove', handleWheelOrTouch, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheelOrTouch);
      window.removeEventListener('touchmove', handleWheelOrTouch);
    };
  }, [isIntroActive, skipIntro]);



  // Scroll Dispersal Listener for WebGL portrait: p = clamp(scrollY / heroHeight, 0, 1)
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !particleEngineRef.current) return;
      const heroH = containerRef.current.offsetHeight || window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const p = Math.min(1.0, Math.max(0.0, scrollY / heroH));
      particleEngineRef.current.setScroll(p);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Main Canvas & GSAP Intro Setup (Runs ONCE on mount)
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let isCancelled = false;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const isReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initSequence() {
      if (isCancelled) return;

      const heroW = container.clientWidth || window.innerWidth;
      const metrics = computeSizesAndWidths(heroW);
      metricsRef.current = metrics;

      // Apply measured font size to the name line container
      if (nameLineRef.current) {
        nameLineRef.current.style.fontSize = `${metrics.nSize}px`;
      }

      // Initialize WebGL Particle Engine
      const engine = new WebglParticleEngine({
        canvas,
        container,
        imageSrc: personal.photoUrl || '/images/harsh-raj.png',
        onReady: () => {
          if (wordContainerRef.current) {
            const heroRect = container.getBoundingClientRect();
            const wordRect = wordContainerRef.current.getBoundingClientRect();
            engine.setWordPosition(wordRect.top - heroRect.top, wordRect.height || metrics.pSize);
          }
          if (effectiveIntroDone || isReducedMotion) {
            engine.jumpToFinal();
          }
        },
      });
      particleEngineRef.current = engine;

      // Handle Reduced Motion or already played session
      if (effectiveIntroDone || isReducedMotion) {
        finishIntro();
        setDotRemoved(true);
        const initialDot = document.getElementById('initial-intro-dot');
        const initialVignette = document.getElementById('initial-intro-vignette');
        if (initialDot) initialDot.remove();
        if (initialVignette) initialVignette.remove();
        if (wordContainerRef.current) {
          const heroH = container.clientHeight || window.innerHeight;
          const finalScale = metrics.pSize / metrics.nSize;
          gsap.set(wordContainerRef.current, {
            opacity: 1,
            y: heroH * 0.26,
            scale: finalScale,
            filter: 'blur(0px)',
          });
        }
        slotRefs.current.forEach((slot, idx) => {
          if (slot) {
            gsap.set(slot, {
              width: 'auto',
              overflow: 'hidden',
            });
          }
          const reelEl = reelRefs.current[idx];
          if (reelEl) {
            const spans = reelEl.querySelectorAll('span');
            spans.forEach((span, cIdx) => {
              if (cIdx < 8) {
                const s = span as HTMLElement;
                s.style.width = '0px';
                s.style.overflow = 'hidden';
              } else {
                (span as HTMLElement).style.display = 'block';
              }
            });
            gsap.set(reelEl, { y: '-8em', opacity: 1, filter: 'blur(0px)' });
          }
        });
        if (subtitleRef.current) {
          const words = subtitleRef.current.querySelectorAll('.pop-word');
          gsap.set(words, { y: '0%', opacity: 1 });
        }
        if (bottomRowRef.current) {
          const items = bottomRowRef.current.querySelectorAll('.pop-item');
          gsap.set(items, { y: '0%', opacity: 1 });
        }
        if (scrollCueRef.current) gsap.set(scrollCueRef.current, { opacity: 1 });

        return;
      }

      // Lock page scroll during the cinematic intro
      document.body.style.overflow = 'hidden';

      const resetDOMIntroState = (m: FontAndSlotMetrics) => {
        setDotRemoved(false);
        if (dotRef.current) {
          dotRef.current.style.width = `${m.dotDiameter}px`;
          dotRef.current.style.height = `${m.dotDiameter}px`;
          gsap.set(dotRef.current, {
            opacity: 1,
            y: -window.innerHeight * 0.36,
            scaleX: 1,
            scaleY: 1,
            scale: 1,
          });
        }

        if (wordContainerRef.current) {
          gsap.set(wordContainerRef.current, {
            opacity: 1,
            y: 0,
            scale: 1.0,
            filter: 'blur(0px)',
          });
        }

        slotRefs.current.forEach((slot) => {
          if (slot) {
            gsap.set(slot, {
              width: 0,
              overflow: 'visible',
            });
          }
        });

        reelRefs.current.forEach((reel) => {
          if (!reel) return;
          gsap.set(reel, {
            opacity: 0,
            scale: 0.2,
            filter: 'blur(3px)',
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
          });
          const extraGlyphs = reel.querySelectorAll('.reel-extra-glyph');
          extraGlyphs.forEach((el) => {
            (el as HTMLElement).style.visibility = 'hidden';
          });
        });

        if (subtitleRef.current) {
          const words = subtitleRef.current.querySelectorAll('.pop-word');
          gsap.set(words, { y: '110%', opacity: 0 });
        }

        if (bottomRowRef.current) {
          const items = bottomRowRef.current.querySelectorAll('.pop-item');
          gsap.set(items, { y: '110%', opacity: 0 });
        }

        if (scrollCueRef.current) {
          gsap.set(scrollCueRef.current, { opacity: 0 });
        }
      };

      const createMasterTimeline = (m: FontAndSlotMetrics, eng: WebglParticleEngine) => {
        const tl = gsap.timeline({
          paused: true,
          onComplete: finishIntro,
        });

        // Start intro audio bus fade-in at t=0
        tl.call(() => introSound.start(), [], 0);

        // Show skip button at 0.4s
        tl.call(() => setShowSkipBtn(true), [], 0.4);

      // -------------------------------------------------------------
      // Step 1: DOT DROP (0.0s to ~1.1s)
      // Falls from above viewport to exact center with gravity easing,
      // squashes on impact, then 2 bounces of decreasing height.
      // -------------------------------------------------------------
      let curTime = 0.0;
      if (dotRef.current) {
        // Drop with gravity easing (power2.in)
        tl.to(
          dotRef.current,
          {
            y: 0,
            duration: DOT_DROP_DURATION,
            ease: 'power2.in',
          },
          curTime
        );
        curTime += DOT_DROP_DURATION;

        // Impact 1: first contact with line
        tl.addLabel('impact1', curTime);
        tl.call(() => introSound.bounce(1), [], 'impact1');

        // Small squash on impact
        tl.to(
          dotRef.current,
          {
            scaleX: 1.4,
            scaleY: 0.7,
            duration: INTRO_TIMING.dotSquashDuration,
            ease: 'power1.out',
          },
          curTime
        );
        curTime += INTRO_TIMING.dotSquashDuration;

        // Bounce 1 (up to -80px, down to 0 with squash)
        tl.to(
          dotRef.current,
          {
            y: -INTRO_TIMING.dotBounce1Height,
            scaleX: 0.9,
            scaleY: 1.1,
            duration: INTRO_TIMING.dotBounce1UpDuration,
            ease: 'power2.out',
          },
          curTime
        );
        curTime += INTRO_TIMING.dotBounce1UpDuration;

        tl.to(
          dotRef.current,
          {
            y: 0,
            scaleX: 1.25,
            scaleY: 0.8,
            duration: INTRO_TIMING.dotBounce1DownDuration,
            ease: 'power2.in',
          },
          curTime
        );
        curTime += INTRO_TIMING.dotBounce1DownDuration;

        // Impact 2: second contact with line
        tl.addLabel('impact2', curTime);
        tl.call(() => introSound.bounce(2), [], 'impact2');

        // Bounce 2 (up to -28px, down to 0 and settles)
        tl.to(
          dotRef.current,
          {
            y: -INTRO_TIMING.dotBounce2Height,
            scaleX: 0.95,
            scaleY: 1.05,
            duration: INTRO_TIMING.dotBounce2UpDuration,
            ease: 'power2.out',
          },
          curTime
        );
        curTime += INTRO_TIMING.dotBounce2UpDuration;

        tl.to(
          dotRef.current,
          {
            y: 0,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: INTRO_TIMING.dotBounce2DownDuration,
            ease: 'power2.in',
          },
          curTime
        );
        curTime += INTRO_TIMING.dotBounce2DownDuration;

        // Impact 3: third contact with line
        tl.addLabel('impact3', curTime);
        tl.call(() => introSound.bounce(3), [], 'impact3');

        // Rest hold at center
        curTime += INTRO_TIMING.dotRestHold;
      }

      // -------------------------------------------------------------
      // Step 2: LETTERS POP OUT OF THE DOT (~1.1s to ~3.5s)
      // Starts ~1.1s, one letter every 0.22s.
      // Dot is the last item of flex row ('cursor' mode) or screen center ('center' mode).
      // Each letter reserves its slot width first (0.35s, power3.out),
      // glyph emerges from dot's exact center, arcs up 0.35em with 3D spin and blur,
      // and lands with back.out(1.4). Dot pulses at each letter launch.
      // Space character adds gap with a 12px dot hop (0.25s).
      // When J launches, dot scales to 0 in 80ms and unmounts!
      // -------------------------------------------------------------
      const letterStartTime = curTime;
      let lastGlyphLandTime = letterStartTime;

      REEL_CONFIGS.forEach((slot, index) => {
        const slotStart = letterStartTime + index * LETTER_STAGGER;
        const slotEl = slotRefs.current[index];
        const reelEl = reelRefs.current[index];

        // 1. Slot width expands: reserves space first so letters never overlap
        if (slotEl) {
          tl.to(
            slotEl,
            {
              width: metrics.nWs[index],
              duration: INTRO_TIMING.slotWidthDuration,
              ease: 'power3.out',
            },
            slotStart
          );
        }

        // 2. Space character: adds only a gap; dot makes a tiny hop (12px up and down, 0.20s), no glyph
        if (index === 5) {
          tl.addLabel('spaceHop', slotStart);
          tl.call(() => introSound.spaceHop(), [], 'spaceHop');

          if (dotRef.current) {
            tl.to(
              dotRef.current,
              {
                y: -INTRO_TIMING.spaceHopHeight,
                duration: INTRO_TIMING.spaceHopDuration * 0.48,
                ease: 'power2.out',
              },
              slotStart
            );
            tl.to(
              dotRef.current,
              {
                y: 0,
                duration: INTRO_TIMING.spaceHopDuration * 0.52,
                ease: 'power2.in',
              },
              slotStart + INTRO_TIMING.spaceHopDuration * 0.48
            );
          }
          return;
        }

        // Tonal letter launch hook: letters 0..4 (HARSH), space is skipped, letters 5..7 (RAJ)
        const letterIndex = index < 5 ? index : index - 1;
        const letterLabel = `letterLaunch${letterIndex}`;
        tl.addLabel(letterLabel, slotStart);
        tl.call(() => introSound.letterPop(letterIndex), [], letterLabel);

        // 3. Dot pulses once (scale 1.0 -> 1.25 -> 1.0, 120ms) at each letter launch
        if (dotRef.current) {
          tl.to(
            dotRef.current,
            {
              scale: 1.25,
              duration: INTRO_TIMING.dotPulseDuration * 0.5,
              ease: 'power2.out',
            },
            slotStart
          );
          tl.to(
            dotRef.current,
            {
              scale: 1.0,
              duration: INTRO_TIMING.dotPulseDuration * 0.5,
              ease: 'power2.in',
            },
            slotStart + INTRO_TIMING.dotPulseDuration * 0.5
          );
        }

        // 4. Letter glyph launch animation from dot's exact center
        if (reelEl) {
          const landTime = slotStart + LETTER_DURATION;
          if (landTime > lastGlyphLandTime) {
            lastGlyphLandTime = landTime;
          }

          tl.call(
            () => {
              const dotEl = dotRef.current;
              const sEl = slotRefs.current[index];
              const rEl = reelRefs.current[index];
              const nameLine = nameLineRef.current;
              if (!dotEl || !sEl || !rEl || !nameLine) return;

              const dRect = dotEl.getBoundingClientRect();
              const sRect = sEl.getBoundingClientRect();
              const wRect = nameLine.getBoundingClientRect();

              const dotCenterX = dRect.left + dRect.width / 2;
              const dotCenterY = dRect.top + dRect.height / 2;
              const slotCenterX = sRect.left + sRect.width / 2;
              const slotCenterY = sRect.top + sRect.height / 2;

              // Cap-height midline check: exactly at 0.50 of line box in Inter Variable 800
              const capMidlineY = wRect.top + wRect.height * 0.50;
              console.assert(
                Math.abs(dotCenterY - capMidlineY) <= 2,
                `[Hero Intro Assertion] Dot vertical center (${dotCenterY.toFixed(2)}) is not within 2px of cap-height midline (${capMidlineY.toFixed(2)})`
              );

              // Compute offset from dot center to slot center at launch time
              const startOffsetX = dotCenterX - slotCenterX;
              const startOffsetY = dotCenterY - slotCenterY;

              const rotZ = gsap.utils.random(-160, 160);
              const rotX = gsap.utils.random(-90, 90);
              const rotY = gsap.utils.random(-90, 90);
              const arcPeak = -metrics.nSize * 0.35;

              // Set initial state directly on rEl at launch time
              gsap.set(rEl, {
                x: startOffsetX,
                y: startOffsetY,
                scale: 0.2,
                opacity: 0,
                rotationZ: rotZ,
                rotationX: rotX,
                rotationY: rotY,
                filter: 'blur(3px)',
                transformOrigin: '50% 0.5em',
              });

              // Glyph start center assertion
              const firstSpan = rEl.firstElementChild as HTMLElement;
              if (firstSpan) {
                const gRect = firstSpan.getBoundingClientRect();
                const gCenterX = gRect.left + gRect.width / 2;
                const gCenterY = gRect.top + gRect.height / 2;
                console.assert(
                  Math.abs(gCenterX - dotCenterX) <= 2 && Math.abs(gCenterY - dotCenterY) <= 2,
                  `[Hero Intro Assertion] Glyph '${slot.startChar}' start center (${gCenterX.toFixed(2)}, ${gCenterY.toFixed(2)}) is not within 2px of dot center (${dotCenterX.toFixed(2)}, ${dotCenterY.toFixed(2)})`
                );
              }

              // Animate: travels from dot to slot
              gsap.to(rEl, {
                x: 0,
                scale: 1.0,
                rotationZ: 0,
                rotationX: 0,
                rotationY: 0,
                filter: 'blur(0px)',
                duration: LETTER_DURATION,
                ease: `back.out(${INTRO_TIMING.glyphOvershoot})`,
              });

              // Fast fade-in
              gsap.to(rEl, {
                opacity: 1,
                duration: LETTER_DURATION * 0.25,
                ease: 'power2.out',
              });

              // Upward arc in Y: peak about 0.35em above the line, then land with back.out(1.4)
              gsap.to(rEl, {
                y: startOffsetY + arcPeak,
                duration: LETTER_DURATION * 0.38,
                ease: 'power2.out',
                onComplete: () => {
                  gsap.to(rEl, {
                    y: 0,
                    duration: LETTER_DURATION * 0.62,
                    ease: `back.out(${INTRO_TIMING.glyphOvershoot})`,
                  });
                },
              });
            },
            [],
            slotStart
          );
        }

        // 6. When J launches (index 8), dot scales to 0 in 80ms (power4.in) and is unmounted
        if (index === 8) {
          // Dot vanishes bubble-pop
          tl.addLabel('dotVanish', slotStart);
          tl.call(() => introSound.vanish(), [], 'dotVanish');

          // Name complete chime chord (~250ms after J launch)
          tl.addLabel('nameComplete', slotStart + 0.25);
          tl.call(() => introSound.nameComplete(), [], 'nameComplete');

          if (dotRef.current) {
            tl.to(
              dotRef.current,
              {
                scale: 0,
                opacity: 0,
                duration: INTRO_TIMING.dotDisappearDuration,
                ease: 'power4.in',
                onComplete: () => {
                  setDotRemoved(true);
                },
              },
              slotStart
            );
          }
        }
      });

      // -------------------------------------------------------------
      // Step 3: HOLD (about 0.5s) with full name "HARSH RAJ" resting
      // -------------------------------------------------------------
      const nameHoldStart = Math.max(
        lastGlyphLandTime,
        letterStartTime + (REEL_CONFIGS.length - 1) * LETTER_STAGGER + LETTER_DURATION
      );
      const shuffleStart = nameHoldStart + INTRO_TIMING.nameHoldDuration;

      // -------------------------------------------------------------
      // Step 4: SHUFFLE TO "PORTFOLIO" (~2.0s total, travel-edit text-reel style)
      // Switch slots to overflow: hidden so exactly one glyph is visible
      // -------------------------------------------------------------
      tl.call(
        () => {
          slotRefs.current.forEach((slot) => {
            if (slot) slot.style.overflow = 'hidden';
          });
          const extraGlyphs = nameLineRef.current?.querySelectorAll('.reel-extra-glyph');
          if (extraGlyphs) {
            extraGlyphs.forEach((el) => {
              (el as HTMLElement).style.visibility = 'visible';
            });
          }
          if (reelRefs.current[5]) {
            gsap.set(reelRefs.current[5], {
              opacity: 1,
              scale: 1.0,
              filter: 'blur(0px)',
              x: 0,
              y: 0,
            });
          }
        },
        [],
        shuffleStart
      );

      // Schedule split-flap flutter ticks across shuffle slots
      tl.addLabel('shuffleSlotStart0', shuffleStart);
      tl.call(
        () => {
          introSound.scheduleShuffle({
            startTime: 0,
            slotDuration: INTRO_TIMING.shuffleSlotDuration,
            slotStagger: INTRO_TIMING.shuffleSlotStagger,
            numSlots: 9,
            glyphSteps: 8,
          });
        },
        [],
        'shuffleSlotStart0'
      );

      REEL_CONFIGS.forEach((_, index) => {
        const slotStart = shuffleStart + index * INTRO_TIMING.shuffleSlotStagger;
        const landTime = slotStart + INTRO_TIMING.shuffleSlotDuration;
        const slotEl = slotRefs.current[index];
        const reelEl = reelRefs.current[index];

        const startLabel = `shuffleSlotStart${index}`;
        const landLabel = `shuffleSlotLand${index}`;
        if (index > 0) {
          tl.addLabel(startLabel, slotStart);
        }
        tl.addLabel(landLabel, landTime);
        tl.call(() => introSound.slotLand(index), [], landLabel);

        if (slotEl) {
          // Slot width tweens to target glyph width with same duration and ease
          tl.to(
            slotEl,
            {
              width: metrics.pWs[index],
              duration: INTRO_TIMING.shuffleSlotDuration,
              ease: 'power4.out',
              onComplete: () => {
                // When finished, remove inline width override so slots use natural advance width
                slotEl.style.width = 'auto';
                if (reelEl) {
                  const spans = reelEl.querySelectorAll('span');
                  spans.forEach((span, cIdx) => {
                    if (cIdx < 8) {
                      const s = span as HTMLElement;
                      s.style.width = '0px';
                      s.style.overflow = 'hidden';
                    }
                  });
                }
              },
            },
            slotStart
          );
        }

        if (reelEl) {
          // Blur and slightly reduced opacity during motion
          tl.to(
            reelEl,
            {
              filter: 'blur(1.5px)',
              opacity: 0.85,
              duration: INTRO_TIMING.shuffleSlotDuration * 0.35,
              ease: 'power2.out',
            },
            slotStart
          );

          tl.to(
            reelEl,
            {
              filter: 'blur(0px)',
              opacity: 1.0,
              duration: INTRO_TIMING.shuffleSlotDuration * 0.65,
              ease: 'power2.in',
            },
            slotStart + INTRO_TIMING.shuffleSlotDuration * 0.35
          );

          // translateY from 0 to -8em (target glyph at index 8)
          tl.to(
            reelEl,
            {
              y: '-8em',
              duration: INTRO_TIMING.shuffleSlotDuration,
              ease: 'power4.out',
            },
            slotStart
          );
        }
      });

      // Settle hold after last slot lands
      const lastShuffleStart = shuffleStart + (REEL_CONFIGS.length - 1) * INTRO_TIMING.shuffleSlotStagger;
      const allLandedTime = lastShuffleStart + INTRO_TIMING.shuffleSlotDuration;
      const portfolioSlideStart = allLandedTime + INTRO_TIMING.shuffleEndHold;

      // Arrival chord when all slots land
      tl.addLabel('shuffleDone', allLandedTime);
      tl.call(() => introSound.arrival(), [], 'shuffleDone');

      // -------------------------------------------------------------
      // Step 5: SLIDE PORTFOLIO & REVEAL HERO
      // -------------------------------------------------------------
      // Deep, soft settle thock at the moment the word arrives at its final position
      const portfolioSettleTime = portfolioSlideStart + INTRO_TIMING.portfolioSlideDuration;
      tl.addLabel('portfolioSettle', portfolioSettleTime);
      tl.call(() => introSound.portfolioSettle(), [], 'portfolioSettle');

      if (wordContainerRef.current) {
        const heroH = container.clientHeight || window.innerHeight;
        const finalScale = m.pSize / m.nSize;

        tl.to(
          wordContainerRef.current,
          {
            y: heroH * 0.26,
            scale: finalScale,
            duration: INTRO_TIMING.portfolioSlideDuration,
            ease: 'power3.inOut',
            onUpdate: () => {
              if (particleEngineRef.current && wordContainerRef.current) {
                const heroRect = container.getBoundingClientRect();
                const wordRect = wordContainerRef.current.getBoundingClientRect();
                particleEngineRef.current.setWordPosition(wordRect.top - heroRect.top, wordRect.height || m.pSize);
              }
            },
          },
          portfolioSlideStart
        );
      }

      if (subtitleRef.current) {
        const words = subtitleRef.current.querySelectorAll('.pop-word');
        tl.to(
          words,
          {
            y: '0%',
            opacity: 1,
            duration: INTRO_TIMING.subtitlePopDuration,
            ease: 'power3.out',
          },
          portfolioSlideStart + 0.35
        );
      }

      if (bottomRowRef.current) {
        const items = bottomRowRef.current.querySelectorAll('.pop-item');
        tl.to(
          items,
          {
            y: '0%',
            opacity: 1,
            stagger: 0.06,
            duration: INTRO_TIMING.subtitlePopDuration,
            ease: 'power3.out',
          },
          portfolioSlideStart + 0.5
        );
      }

      if (scrollCueRef.current) {
        tl.to(
          scrollCueRef.current,
          {
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
          },
          portfolioSlideStart + 0.65
        );
      }

      // Dust & Portrait Convergence: Two discrete events only (no continuous sound)
      const dustStart = portfolioSlideStart - 0.3;
      tl.addLabel('dustStart', dustStart);

      // Hold dust phase if particle targets are not ready yet without delaying anything earlier
      tl.call(
        () => {
          if (!isSkippingRef.current && eng && !eng.isReady()) {
            tl.pause();
            const readyCheck = setInterval(() => {
              if (eng.isReady()) {
                clearInterval(readyCheck);
                tl.play();
              }
            }, 30);
          }
        },
        [],
        dustStart
      );

      const dustObj = { alpha: 0 };
      tl.to(
        dustObj,
        {
          alpha: 1,
          duration: INTRO_TIMING.dustFadeDuration,
          ease: 'power2.out',
          onUpdate: () => eng.setDustAlpha(dustObj.alpha),
        },
        dustStart
      );

      // Dust must already be visible for at least 0.8s before the first particle starts converging
      const convergeStart = dustStart + 0.85;
      const convergeDuration = INTRO_TIMING.particleConvergeDuration; // 3.0s

      const portraitStartTime = convergeStart + convergeDuration * 0.02; // progress 0.02
      const portraitHalfTime = convergeStart + convergeDuration * 0.50;  // progress 0.50
      const portraitDoneTime = convergeStart + convergeDuration * 0.98;  // progress 0.98

      tl.addLabel('portraitStart', portraitStartTime);

      tl.addLabel('portraitHalf', portraitHalfTime);
      tl.call(() => introSound.portraitHalf(), [], 'portraitHalf');

      tl.addLabel('portraitDone', portraitDoneTime);
      tl.call(
        () => {
          introSound.portraitDone();
          markPortraitDone();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('hero:portraitDone'));
          }
        },
        [],
        'portraitDone'
      );

      const convergeObj = { progress: 0 };
      tl.to(
        convergeObj,
        {
          progress: 1,
          duration: convergeDuration,
          ease: 'none',
          onUpdate: () => eng.setGatherProgress(convergeObj.progress),
        },
        convergeStart
      );

      // Nav Fades in 0.4s after portraitDone
      const navStartTime = portraitDoneTime + 0.4;
      tl.call(
        () => {
          setShowSkipBtn(false);
          onNavFadeIn?.();
        },
        [],
        navStartTime
      );

      return tl;
    };

    resetDOMIntroState(metrics);
    const tl = createMasterTimeline(metrics, engine);
    timelineRef.current = tl;
    if (typeof window !== 'undefined') {
      (window as unknown as { __heroTimeline?: gsap.core.Timeline }).__heroTimeline = tl;
    }

    requestAnimationFrame(() => {
      if (isCancelled) return;
      const initialDot = document.getElementById('initial-intro-dot');
      const initialVignette = document.getElementById('initial-intro-vignette');
      if (initialDot) initialDot.remove();
      if (initialVignette) initialVignette.remove();

      if (import.meta.env.DEV) {
        const firstMoveTime = performance.now();
        const paints = performance.getEntriesByType('paint');
        const fp = paints.find((p) => p.name === 'first-paint')?.startTime || 0;
        const deltaFp = fp > 0 ? (firstMoveTime - fp).toFixed(1) : 'N/A';
        console.log(`[Intro] Time from navigation start to dot's first movement: ${firstMoveTime.toFixed(1)}ms`);
        console.log(`[Intro] Time after first paint to dot's first movement: ${deltaFp}ms (target: <150ms)`);
      }

      introStartTimeRef.current = performance.now();
      tl.play();
    });
  }

  initSequence();

    return () => {
      isCancelled = true;
      document.body.style.overflow = '';
      introSound.stopAll(50);
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (particleEngineRef.current) {
        particleEngineRef.current.destroy();
      }
    };
  }, []); // Run once on mount

  // Resize handler to update particle engine coordinates
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !wordContainerRef.current || !particleEngineRef.current) return;
      const heroW = containerRef.current.clientWidth || window.innerWidth;
      const metrics = computeSizesAndWidths(heroW);
      metricsRef.current = metrics;

      const heroRect = containerRef.current.getBoundingClientRect();
      const wordRect = wordContainerRef.current.getBoundingClientRect();
      particleEngineRef.current.setWordPosition(wordRect.top - heroRect.top, wordRect.height || metrics.pSize);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      aria-label="Hero Introduction"
      className="relative w-full h-[100dvh] min-h-[100dvh] bg-transparent overflow-hidden select-text isolation-isolate flex flex-col justify-center items-center"
      style={{ isolation: 'isolate' }}
    >
      {/* Soft Neutral Radial Vignette */}
      <div className="absolute inset-0 pointer-events-none hero-vignette z-0" aria-hidden="true" />

      <div
        role="img"
        aria-label={`Halftone particle portrait of ${personal.fullName}`}
        className="sr-only"
      />

      {/* WebGL Particle Portrait Canvas (z-index: 1, inside hero) */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      />

      {/* Word Container (z-index: 2, in front of lower torso) */}
      <div
        ref={wordContainerRef}
        id="hero-word-wrapper"
        className="relative z-[2] flex flex-col items-center justify-center select-none pointer-events-none"
        style={{
          width: '100%',
          maxWidth: '100%',
          willChange: 'transform, opacity',
        }}
      >
        {/* Name Line / Morphing Slots Line */}
        <div
          ref={nameLineRef}
          id="portfolio-word-display"
          className="relative flex items-center justify-center font-apple font-extrabold uppercase tracking-[-0.04em] leading-[1] select-none whitespace-nowrap gap-0"
          style={{
            perspective: '900px',
          }}
          aria-hidden="true"
        >
          {/* 9 Character Slots */}
          {REEL_CONFIGS.map((slot, index) => (
            <div
              key={`slot-${index}`}
              ref={(el) => (slotRefs.current[index] = el)}
              className="relative inline-flex flex-col items-center justify-start flex-shrink-0"
              style={{
                width: 0,
                height: '1em',
                overflow: 'visible',
                willChange: 'width, transform',
                transformStyle: 'preserve-3d',
                zIndex: 10 + index,
              }}
            >
              <div
                ref={(el) => (reelRefs.current[index] = el)}
                className="flex flex-col items-center justify-start w-full"
                style={{
                  willChange: 'transform, filter, opacity',
                  transformStyle: 'preserve-3d',
                  transformOrigin: '50% 0.5em',
                }}
              >
                {slot.reelChars.map((char, cIdx) => (
                  <span
                    key={`c-${cIdx}`}
                    className={`metallic-text-gradient block h-[1em] leading-[1em] select-none text-center font-apple font-extrabold uppercase tracking-[-0.04em] ${
                      cIdx > 0 ? 'reel-extra-glyph' : 'reel-main-glyph'
                    }`}
                    style={{
                      visibility: effectiveIntroDone || cIdx === 0 ? 'visible' : 'hidden',
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* White Dot with soft glow: placed directly AFTER newest character in 'cursor' mode */}
          {!dotRemoved && (
            <div
              ref={dotRef}
              className={
                DOT_MODE === 'cursor'
                  ? 'relative inline-flex items-center justify-center flex-shrink-0 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.9),0_0_32px_rgba(255,255,255,0.5)] pointer-events-none z-[30] select-none'
                  : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.9),0_0_32px_rgba(255,255,255,0.5)] pointer-events-none z-[30] select-none'
              }
              style={{
                width: `${metricsRef.current?.dotDiameter || 14}px`,
                height: `${metricsRef.current?.dotDiameter || 14}px`,
                willChange: 'transform, opacity',
                transformOrigin: 'center center',
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Subtitle & Bottom Row (z-index: 3) */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-[1050px] px-4 mt-3 sm:mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 z-[3] pointer-events-auto"
        >
          {/* Bottom-left block: Name (h1) + Subtitle */}
          <div
            ref={subtitleRef}
            className="flex flex-col items-start overflow-hidden"
          >
            {/* Page's only h1: Harsh Raj */}
            <h1 className="overflow-hidden inline-flex m-0 p-0 leading-tight mb-1" style={{ marginBottom: '4px' }}>
              <span className="pop-word font-bold text-white text-[28px] sm:text-[35px] leading-tight tracking-[-0.02em] whitespace-nowrap inline-block">
                {personal.fullName || 'Harsh Raj'}
              </span>
            </h1>

            {/* Subtitle masked pop-up: "CSE (AI & ML) Student" */}
            <div className="flex items-center gap-1.5 text-[18px] sm:text-[22px] tracking-[-0.01em] overflow-hidden">
              <div className="overflow-hidden inline-flex">
                <span className="pop-word font-semibold text-[#F5F5F7] inline-block">
                  CSE&nbsp;(AI&nbsp;&amp;&nbsp;ML)
                </span>
              </div>
              <div className="overflow-hidden inline-flex">
                <span className="pop-word font-light italic text-[#9A9AA0] inline-block">
                  Student
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Right Row: Badge + View my work + Resume */}
          <div
            ref={bottomRowRef}
            className="flex flex-wrap items-center gap-3 sm:gap-6 text-[14px] sm:text-[15px] overflow-hidden"
          >
            {/* Open to internships badge */}
            {availability?.isOpen && (
              <div className="overflow-hidden inline-flex">
                <Chip
                  variant="status"
                  status="live"
                  className="pop-item"
                >
                  {availability.statusText}
                </Chip>
              </div>
            )}

            {/* View my work */}
            <div className="overflow-hidden inline-flex">
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSection?.('projects');
                  scrollToSection('projects');
                  window.history.pushState(null, '', '#projects');
                }}
                className="pop-item text-[#D1D1D6] hover:text-white transition-colors duration-200 underline-offset-4 hover:underline hover:decoration-1 font-medium text-[14px] sm:text-[15px] py-2 sm:py-1.5 min-h-[44px] inline-flex items-center cursor-pointer"
              >
                View my work
              </a>
            </div>

            {/* Resume */}
            <div className="overflow-hidden inline-flex">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onDownloadResume}
                className="pop-item text-[#D1D1D6] hover:text-white transition-colors duration-200 underline-offset-4 hover:underline hover:decoration-1 font-medium text-[14px] sm:text-[15px] py-2 sm:py-1.5 min-h-[44px] inline-flex items-center cursor-pointer"
              >
                Resume
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* "Scroll" cue lifted to at least 32px from bottom, contrast #D1D1D6 (hidden on phones to avoid overlap) */}
      <div
        ref={scrollCueRef}
        data-testid="scroll-cue"
        className="hidden md:flex absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 pointer-events-none select-none text-[13px] tracking-[0.2em] text-[#D1D1D6] font-medium opacity-0 z-[3]"
        aria-hidden="true"
      >
        <span>Scroll</span>
        <div className="w-[1px] h-4 bg-gradient-to-b from-[#D1D1D6] via-[#D1D1D6]/40 to-transparent animate-pulse" />
      </div>

      {/* Skip Intro Button: min 44px glass pill, bottom-center on mobile, bottom-right on desktop, contrast AA, keyboard focusable */}
      {showSkipBtn && isIntroActive && (
        <button
          ref={skipBtnRef}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            skipIntro();
          }}
          data-sound="state"
          aria-label="Skip introductory animation"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-8 md:right-8 md:left-auto md:translate-x-0 z-[100] pointer-events-auto apple-glass-chip apple-glass-chip-button apple-glass-chip-interactive min-h-[44px] px-5 text-[#F5F5F7] hover:text-white text-[14px] font-medium tracking-[-0.01em] shadow-2xl flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white select-none cursor-pointer"
        >
          <span>Skip intro</span>
          <ArrowRight className="w-4 h-4 text-white/80" />
        </button>
      )}
    </section>
  );
};
