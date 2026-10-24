/**
 * Intro Animation Timing Configuration
 * 
 * Adjust SPEED to tune the overall sequence speed:
 * - 1.0 = Default calibrated speed
 * - 1.25 = 25% faster
 * - 0.8 = 20% slower
 */
export const SPEED = 1.0;

// Helper to scale any duration in seconds by the global SPEED multiplier
export const t = (seconds: number): number => seconds / SPEED;

// Mode for dot behavior: 'cursor' (default: dot travels with row) | 'center' (dot stays at screen center)
export const DOT_MODE: 'cursor' | 'center' = 'cursor';

// Required prompt exports
export const LETTER_STAGGER = t(0.22); // starts ~1.06s, one letter every 0.22s
export const LETTER_DURATION = t(0.50); // duration ~0.5s along arc into slot
export const DOT_DROP_DURATION = t(0.55); // falls from above viewport with gravity ease (~0.55s)

export const INTRO_TIMING = {
  // Global speed multiplier & mode
  speed: SPEED,
  dotMode: DOT_MODE,

  // -------------------------------------------------------------
  // 1. Dot Drop (0 to ~1.06s) - Shortened fall by ~20%, quicker & 15% lower bounce
  // -------------------------------------------------------------
  dotDropDuration: DOT_DROP_DURATION,
  dotSquashDuration: t(0.05), // Small squash on impact (50ms)
  dotBounce1UpDuration: t(0.13), // First bounce upward quicker (130ms)
  dotBounce1DownDuration: t(0.13), // First bounce downward quicker (130ms)
  dotBounce1Height: 68, // px height of bounce 1 (15% lower than 80px: 68px)
  dotBounce2UpDuration: t(0.08), // Second bounce upward (80ms)
  dotBounce2DownDuration: t(0.08), // Second bounce downward (80ms)
  dotBounce2Height: 20, // px height of bounce 2
  dotRestHold: t(0.04), // Brief rest at center before letters emerge (40ms)

  // -------------------------------------------------------------
  // 2. Letters Pop Out of Dot (~1.06s to ~3.5s)
  // -------------------------------------------------------------
  letterStagger: LETTER_STAGGER,
  letterDuration: LETTER_DURATION,
  slotWidthDuration: t(0.35), // Slot width expands from 0 to glyph width (power3.out)
  dotPulseDuration: t(0.12), // Dot pulses (scale 1.0 -> 1.25 -> 1.0, 120ms) at each launch
  spaceHopDuration: t(0.20), // Space char: dot hops 12px up and down (~0.20s), completes before next letter
  spaceHopHeight: 12, // px hop height
  glyphOvershoot: 1.4, // back.out(1.4) landing ease
  dotDisappearDuration: t(0.08), // Dot scales to 0 and is removed from DOM in 80ms (power4.in)

  // -------------------------------------------------------------
  // 3. Name Hold (~0.5s)
  // -------------------------------------------------------------
  nameHoldDuration: t(0.50), // Full name "HARSH RAJ" rests in center

  // -------------------------------------------------------------
  // 4. Shuffle to PORTFOLIO (~2.0s total, travel-edit reel style)
  // -------------------------------------------------------------
  shuffleSlotStagger: t(0.14), // Left to right, each slot starts 0.14s after previous
  shuffleSlotDuration: t(0.90), // Reel translateY and slot width duration (power4.out)
  shuffleEndHold: t(0.40), // Hold 0.4s when the last slot lands

  // -------------------------------------------------------------
  // 5. Subsequent Stages (Hero lower-third slide, dust, nav)
  // -------------------------------------------------------------
  portfolioSlideDuration: t(1.0), // PORTFOLIO slides to lower third (power3.inOut)
  subtitlePopDuration: t(0.6), // Subtitle and badges pop up from mask (power3.out)
  dustFadeDuration: t(0.8), // Ambient dust particles fade in (0.8s)
  particleConvergeDuration: t(3.0), // Dust particles converge into portrait (3.0s duration)
  navFadeInLead: t(0.4), // Nav starts fading in slightly before final sequence ends
};
