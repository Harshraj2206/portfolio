/**
 * High-performance Canvas 2D Particle Halftone Portrait Engine
 * Samples public/images/harsh-raj.png and renders an interactive dotted halftone portrait
 * with 4-tier batched rendering, smooth gathering animation, live shimmer, and mouse repel.
 */

export interface Particle {
  normOffsetX: number; // offset from content visual center normalized by portrait height
  normOffsetY: number; // 0..1 in portrait from top of head to bottom of torso
  targetX: number;
  targetY: number;
  originX: number;
  originY: number;
  curX: number;
  curY: number;
  radius: number;
  tier: number; // 0..3
  stagger: number; // 0..1
  shimmerPhase: number;
  driftVx: number;
  driftVy: number;
}

export interface ParticleEngineOptions {
  canvas: HTMLCanvasElement;
  imageSrc: string;
  onReady?: () => void;
}

export class ParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageSrc: string;
  private particles: Particle[] = [];
  private isDestroyed = false;
  private isPaused = false;
  private animFrameId: number | null = null;
  private dpr = 1;
  private width = 0;
  private height = 0;

  // Layout anchor from PORTFOLIO word
  private wordTop: number | null = null;
  private wordHeight: number | null = null;

  // Animation states
  private gatherProgress = 0; // 0 = scattered dust, 1 = fully gathered
  private dustAlpha = 0; // 0..1 global particle canvas opacity
  private mouseX = -9999;
  private mouseY = -9999;
  private isReducedMotion = false;

  // High-contrast crisp white/silver palette for striking halftone appearance
  private tierColors: string[] = [
    'rgba(165, 175, 192, 0.40)', // Tier 0: suit silhouette / hair shadow (silver-gray)
    'rgba(210, 218, 232, 0.70)', // Tier 1: midtones / facial structure
    'rgba(242, 245, 252, 0.90)', // Tier 2: skin definition / highlights
    'rgba(255, 255, 255, 1.0)',  // Tier 3: pure crisp white (shirt collar, forehead, eyes)
  ];

  constructor(options: ParticleEngineOptions) {
    this.canvas = options.canvas;
    const context = this.canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Could not get Canvas 2D context');
    this.ctx = context;
    this.imageSrc = options.imageSrc;

    if (typeof window !== 'undefined') {
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    this.handleResize = this.handleResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.renderLoop = this.renderLoop.bind(this);

    window.addEventListener('resize', this.handleResize, { passive: true });
    window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.init(options.onReady);
  }

  private async init(onReady?: () => void) {
    this.updateDimensions();
    await this.sampleImage();
    if (this.isDestroyed) return;

    if (this.isReducedMotion) {
      this.gatherProgress = 1;
      this.dustAlpha = 1;
      this.particles.forEach((p) => {
        p.curX = p.targetX;
        p.curY = p.targetY;
      });
    }

    onReady?.();
    this.animFrameId = requestAnimationFrame(this.renderLoop);
  }

  private updateDimensions() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private async sampleImage(): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = this.imageSrc;

      img.onload = () => {
        if (this.isDestroyed) {
          resolve();
          return;
        }

        const isMobile = this.width < 768;
        // Step 3 on desktop (~10,500 particles), Step 5 on mobile (~3,800 particles)
        const step = isMobile ? 5 : 3;

        const offCanvas = document.createElement('canvas');
        const nw = img.naturalWidth || 500;
        const nh = img.naturalHeight || 500;
        offCanvas.width = nw;
        offCanvas.height = nh;
        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) {
          resolve();
          return;
        }

        offCtx.drawImage(img, 0, 0, nw, nh);
        const imgData = offCtx.getImageData(0, 0, nw, nh).data;

        // Step A: Determine content bounding box and true visual center
        let minX = nw, maxX = 0, minY = nh, maxY = 0;
        let count = 0;
        for (let y = 0; y < nh; y++) {
          for (let x = 0; x < nw; x++) {
            const a = imgData[(y * nw + x) * 4 + 3];
            if (a > 35) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              count++;
            }
          }
        }

        const contentWidth = Math.max(1, maxX - minX);
        const contentHeight = Math.max(1, maxY - minY);
        // Visual center is the midpoint of the cutout body bounds
        const contentCenterX = count > 0 ? (minX + maxX) / 2 : nw / 2;

        const list: Particle[] = [];

        for (let y = minY; y <= maxY; y += step) {
          for (let x = minX; x <= maxX; x += step) {
            const idx = (y * nw + x) * 4;
            const a = imgData[idx + 3];
            if (a < 45) continue;

            const relY = (y - minY) / contentHeight; // 0.0 at top of head, 1.0 at bottom
            const relX = (x - minX) / contentWidth;  // 0.0 at left, 1.0 at right

            // Fade the bottom 15% to transparent (dissolves into letters with no hard line)
            let bottomAlphaMult = 1.0;
            if (relY > 0.85) {
              bottomAlphaMult = Math.max(0, (1.0 - relY) / 0.15);
              // Sparse dissolve: randomly discard particles as they approach the bottom
              if (Math.random() > bottomAlphaMult) {
                continue;
              }
            }

            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const rawLum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            // Elevated contrast and brightness curve so face and shirt read vividly
            const lum = Math.min(1, Math.pow(rawLum, 0.72) * 1.35);

            // Face detection region
            const isFace = relY >= 0.06 && relY <= 0.44 && relX >= 0.25 && relX <= 0.75;

            let tier = 0;
            let radius = isMobile ? 0.7 : 0.9;

            if (lum >= 0.68) {
              tier = 3;
              // High highlights / shirt collar / face highlights
              radius = isFace
                ? (isMobile ? 1.8 : 2.5)
                : (isMobile ? 1.4 : 2.0);
            } else if (lum >= 0.42) {
              tier = 2;
              // Skin midtones / facial structure
              radius = isFace
                ? (isMobile ? 1.4 : 1.9)
                : (isMobile ? 1.1 : 1.6);
            } else if (lum >= 0.20) {
              tier = 1;
              radius = isFace
                ? (isMobile ? 1.0 : 1.4)
                : (isMobile ? 0.8 : 1.1);
            } else {
              tier = 0;
              radius = isMobile ? 0.6 : 0.8;
            }

            if (relY > 0.85) {
              radius *= Math.max(0.4, Math.sqrt(bottomAlphaMult));
              tier = Math.min(tier, Math.floor(bottomAlphaMult * 3.99));
            }

            // Offset from the true visual center of the cutout
            const normOffsetX = (x - contentCenterX) / contentHeight;
            const normOffsetY = relY;

            // Random initial scattered position across viewport
            const originX = Math.random() * this.width;
            const originY = Math.random() * this.height;

            list.push({
              normOffsetX,
              normOffsetY,
              targetX: 0,
              targetY: 0,
              originX,
              originY,
              curX: originX,
              curY: originY,
              radius,
              tier,
              stagger: relY * 0.35 + Math.random() * 0.25,
              shimmerPhase: Math.random() * Math.PI * 2,
              driftVx: (Math.random() - 0.5) * 0.3,
              driftVy: (Math.random() - 0.5) * 0.3,
            });
          }
        }

        this.particles = list;
        this.recalculateTargets();
        resolve();
      };

      img.onerror = () => {
        resolve();
      };
    });
  }

  public setWordPosition(top: number, height: number) {
    this.wordTop = top;
    this.wordHeight = height;
    this.recalculateTargets();
  }

  public recalculateTargets() {
    const isMobile = this.width < 768;

    // Portrait height:
    // Large enough so shoulders span into PORTFOLIO with head prominently above
    const portraitHeight = isMobile
      ? Math.min(this.width * 0.88, this.height * 0.40, 320)
      : Math.min(this.height * 0.66, 620);

    // Exact horizontal center of page - matches word and nav
    const portraitCenterX = this.width / 2;

    // Vertical anchor:
    // Shoulders (relY ≈ 0.55) overlap the top half of PORTFOLIO (top + height * 0.28)
    // No gap between portrait and word; lower torso passes behind the word
    const wordTop = this.wordTop ?? (isMobile ? this.height * 0.68 : this.height * 0.68);
    const wordH = this.wordHeight ?? (isMobile ? 65 : 180);
    const shoulderTargetY = isMobile ? wordTop + wordH * 0.15 : wordTop + wordH * 0.28;
    const startY = shoulderTargetY - 0.55 * portraitHeight;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.targetX = portraitCenterX + p.normOffsetX * portraitHeight;
      p.targetY = startY + p.normOffsetY * portraitHeight;
    }
  }

  private handleResize() {
    this.updateDimensions();
    this.recalculateTargets();
  }

  private handleMouseMove(e: MouseEvent) {
    if (this.isReducedMotion) return;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  private handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.isPaused = true;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    } else {
      this.isPaused = false;
      if (!this.animFrameId && !this.isDestroyed) {
        this.animFrameId = requestAnimationFrame(this.renderLoop);
      }
    }
  }

  public setDustAlpha(alpha: number) {
    this.dustAlpha = Math.max(0, Math.min(1, alpha));
  }

  public setGatherProgress(progress: number) {
    this.gatherProgress = Math.max(0, Math.min(1, progress));
  }

  public jumpToFinal() {
    this.gatherProgress = 1;
    this.dustAlpha = 1;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.curX = p.targetX;
      p.curY = p.targetY;
    }
  }

  private renderLoop(time: number) {
    if (this.isDestroyed || this.isPaused) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.dustAlpha <= 0.001 && this.gatherProgress <= 0.001) {
      this.animFrameId = requestAnimationFrame(this.renderLoop);
      return;
    }

    const tSec = time * 0.001;
    const isGathered = this.gatherProgress >= 0.999;
    const repelRadius = 88;
    const repelRadiusSq = repelRadius * repelRadius;

    // Group by tier for 4 batched draw calls
    const tierBatches: Particle[][] = [[], [], [], []];

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (!isGathered) {
        // Gathering interpolation phase
        const localProg = Math.max(0, Math.min(1, (this.gatherProgress - p.stagger * 0.3) / 0.7));
        // Cubic ease out
        const ease = 1 - Math.pow(1 - localProg, 3);

        // Drift while waiting
        if (localProg <= 0.001) {
          p.originX += p.driftVx;
          p.originY += p.driftVy;
          if (p.originX < 0) p.originX = this.width;
          if (p.originX > this.width) p.originX = 0;
          if (p.originY < 0) p.originY = this.height;
          if (p.originY > this.height) p.originY = 0;
        }

        p.curX = p.originX + (p.targetX - p.originX) * ease;
        p.curY = p.originY + (p.targetY - p.originY) * ease;
      } else {
        // Fully gathered: live shimmer + gentle spring mouse repel
        let targetX = p.targetX;
        let targetY = p.targetY;

        if (!this.isReducedMotion) {
          // 1-2px organic breathing/shimmer
          const jitterX = Math.sin(tSec * 2.2 + p.shimmerPhase) * 1.1;
          const jitterY = Math.cos(tSec * 1.8 + p.shimmerPhase * 1.4) * 1.1;
          targetX += jitterX;
          targetY += jitterY;

          // Mouse proximity repel
          const dx = targetX - this.mouseX;
          const dy = targetY - this.mouseY;
          const distSq = dx * dx + dy * dy;

          if (distSq < repelRadiusSq && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / repelRadius) * 26; // max 26px displacement
            const angle = Math.atan2(dy, dx);
            targetX += Math.cos(angle) * force;
            targetY += Math.sin(angle) * force;
          }
        }

        // Smooth spring ease towards target
        p.curX += (targetX - p.curX) * 0.14;
        p.curY += (targetY - p.curY) * 0.14;
      }

      tierBatches[p.tier].push(p);
    }

    // Apply global canvas dust alpha
    this.ctx.globalAlpha = this.dustAlpha;

    // Batched render by tier (4 draw calls total)
    for (let t = 0; t < 4; t++) {
      const batch = tierBatches[t];
      if (batch.length === 0) continue;

      this.ctx.fillStyle = this.tierColors[t];
      this.ctx.beginPath();
      for (let j = 0; j < batch.length; j++) {
        const p = batch[j];
        this.ctx.moveTo(p.curX + p.radius, p.curY);
        this.ctx.arc(p.curX, p.curY, p.radius, 0, Math.PI * 2);
      }
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1.0;
    this.animFrameId = requestAnimationFrame(this.renderLoop);
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}
