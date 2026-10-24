import * as THREE from 'three';

export interface WebglPortraitOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  imageSrc: string;
  onReady?: () => void;
}

interface ParticleTarget {
  x: number; // 0 to 1 relative to portrait bounding box
  y: number; // 0 to 1
  size: number;
  brightness: number;
  bottomAlpha: number;
}

const VERTEX_SHADER = `
uniform float uTime;
uniform float uDustAlpha;
uniform float uConverge;
uniform float uScroll;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uPixelRatio;

attribute vec3 aDustPosition;
attribute vec3 aTargetPosition;
attribute vec3 aControlPoint;
attribute vec2 aTiming; // x: delay (0..1.2), y: duration (1.6..2.4)
attribute vec4 aProps;  // x: baseSize, y: brightness, z: seed, w: bottomAlpha

varying float vAlpha;
varying float vBrightness;

// Simplex/Curl 2D noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec2 curlNoise(vec2 p) {
  float eps = 0.5;
  float n1 = snoise(vec2(p.x, p.y + eps));
  float n2 = snoise(vec2(p.x, p.y - eps));
  float n3 = snoise(vec2(p.x + eps, p.y));
  float n4 = snoise(vec2(p.x - eps, p.y));
  float x = (n1 - n2) / (2.0 * eps);
  float y = -(n3 - n4) / (2.0 * eps);
  return vec2(x, y);
}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void main() {
  float delay = aTiming.x;
  float duration = aTiming.y;
  float baseSize = aProps.x;
  float brightness = aProps.y;
  float seed = aProps.z;
  float bottomAlpha = aProps.w;

  // Normalized convergence progress tRaw in [0, 1]
  float tRaw = clamp((uConverge - delay) / duration, 0.0, 1.0);

  // Slow dust drift with curl noise
  vec2 drift = curlNoise(aDustPosition.xy * 0.003 + vec2(uTime * 0.05, seed * 0.1)) * 38.0;
  vec3 dustPos = aDustPosition + vec3(drift, 0.0);

  // Quadratic Bezier travel path with overshoot in the last 10%
  float travelT;
  if (tRaw < 0.9) {
    travelT = easeInOutCubic(tRaw / 0.9) * 0.9;
  } else {
    float overT = (tRaw - 0.9) / 0.1;
    float overshoot = sin(overT * 3.14159) * 0.035; // ~6px overshoot
    travelT = 0.9 + overT * 0.1 + overshoot;
  }

  float invT = 1.0 - clamp(travelT, 0.0, 1.0);
  vec3 currentPos = invT * invT * dustPos + 2.0 * invT * travelT * aControlPoint + travelT * travelT * aTargetPosition;

  // Turbulence scales smoothly down to 0 as particle arrives
  float turbulenceAmp = (1.0 - tRaw) * 28.0;
  vec2 turb = curlNoise(currentPos.xy * 0.007 + vec2(uTime * 0.08, seed)) * turbulenceAmp;
  currentPos.xy += turb;

  // Post-convergence subtle shimmer & mouse repel
  if (tRaw > 0.88) {
    float arriveWeight = (tRaw - 0.88) / 0.12;
    vec2 shimmer = vec2(
      sin(uTime * 2.8 + seed * 6.28) * 1.5,
      cos(uTime * 2.4 + seed * 4.15) * 1.5
    ) * arriveWeight;
    currentPos.xy += shimmer;

    if (uMouse.x > 0.0 && uMouse.y > 0.0) {
      vec2 toParticle = currentPos.xy - uMouse;
      float dist = length(toParticle);
      float repelRadius = 150.0;
      if (dist < repelRadius && dist > 0.01) {
        float force = (1.0 - dist / repelRadius) * 55.0 * arriveWeight;
        currentPos.xy += (toParticle / dist) * force;
      }
    }
  }

  // Scroll-linked dispersal (uScroll in 0.15 to 1.0)
  float scrollDispersal = 0.0;
  if (uScroll > 0.15) {
    float scrollFactor = clamp((uScroll - 0.15) / 0.85, 0.0, 1.0);
    scrollDispersal = scrollFactor;
    
    vec2 scatterDir = curlNoise(currentPos.xy * 0.003 + vec2(uTime * 0.15, seed * 0.7));
    // Upward drift bias
    scatterDir.y -= 2.0;
    // Outward from center bias
    float fromCenter = (currentPos.x - uResolution.x * 0.5) / max(100.0, uResolution.x * 0.5);
    scatterDir.x += fromCenter * 1.8;

    currentPos.xy += scatterDir * (scrollFactor * 320.0);
  }

  // Map pixel coords (0..uResolution) to clip space (-1..1), Y flipped
  vec2 ndc = (currentPos.xy / uResolution) * 2.0 - 1.0;
  ndc.y = -ndc.y;

  gl_Position = vec4(ndc, 0.0, 1.0);

  // Point size ramps up smoothly
  float currentSize = mix(1.1, baseSize, tRaw);
  gl_PointSize = currentSize * uPixelRatio;

  // Alpha composition
  float alpha = mix(uDustAlpha * 0.65, 1.0, tRaw);
  alpha *= mix(1.0, bottomAlpha, tRaw);
  if (scrollDispersal > 0.0) {
    alpha *= (1.0 - scrollDispersal);
  }

  vAlpha = clamp(alpha, 0.0, 1.0);
  vBrightness = mix(0.45, brightness, tRaw);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying float vAlpha;
varying float vBrightness;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) {
    discard;
  }
  float edge = smoothstep(0.5, 0.35, dist);

  // Pure silver/white palette
  vec3 color = mix(vec3(0.88, 0.90, 0.95), vec3(1.0, 1.0, 1.0), vBrightness);
  color *= vBrightness;

  gl_FragColor = vec4(color, vAlpha * edge);
}
`;

export class WebglParticleEngine {
  private canvas: HTMLCanvasElement;
  private container: HTMLElement;
  private imageSrc: string;
  private onReady?: () => void;

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.OrthographicCamera | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private points: THREE.Points | null = null;
  private geometry: THREE.BufferGeometry | null = null;

  private particleCount: number = 24000;
  private sampledTargets: ParticleTarget[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  private animFrameId: number | null = null;
  private startTime: number = performance.now();
  private isDestroyed: boolean = false;
  private isHeroInView: boolean = true;
  private isTabVisible: boolean = true;
  private currentScrollP: number = 0;

  // Portrait layout targets
  private wordTop: number = 0;
  private wordHeight: number = 0;

  constructor(options: WebglPortraitOptions) {
    this.canvas = options.canvas;
    this.container = options.container;
    this.imageSrc = options.imageSrc;
    this.onReady = options.onReady;

    this.particleCount = window.innerWidth < 768 ? 9000 : 24000;

    this.init();
  }

  private init() {
    try {
      // 1. Initialize Three.js WebGLRenderer
      const renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);

      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      this.renderer = renderer;
      this.scene = scene;
      this.camera = camera;

      // 2. Setup shader material
      this.material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uDustAlpha: { value: 0 },
          uConverge: { value: 0 },
          uScroll: { value: 0 },
          uMouse: { value: new THREE.Vector2(-1000, -1000) },
          uResolution: { value: new THREE.Vector2(width, height) },
          uPixelRatio: { value: dpr },
        },
      });

      // 3. Sample cutout image off-main-thread asynchronously
      this.loadAndSampleCutout();

      // 4. Setup Observers & Listeners
      this.setupObservers();
      this.setupMouseEvents();

      // 5. Start Render Loop
      this.tick();
    } catch (err) {
      console.warn('WebGL initialization failed, falling back gracefully:', err);
    }
  }

  private loadAndSampleCutout() {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.imageSrc;

    img.onload = () => {
      if (this.isDestroyed) return;

      // Process image in idle chunks or microtasks to prevent main-thread freeze
      const sampleAsync = () => {
        const offscreen = document.createElement('canvas');
        const sw = 320;
        const sh = Math.round((img.height / img.width) * sw);
        offscreen.width = sw;
        offscreen.height = sh;
        const ctx = offscreen.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, sw, sh);
        const imgData = ctx.getImageData(0, 0, sw, sh);
        const data = imgData.data;

        // Find subject bounding box to eliminate transparent empty margins
        let minX = sw;
        let maxX = 0;
        let minY = sh;
        let maxY = 0;

        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const idx = (y * sw + x) * 4;
            const a = data[idx + 3];
            if (a > 25) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        const bboxW = Math.max(1, maxX - minX);
        const bboxH = Math.max(1, maxY - minY);
        // Optical center of person
        const subjectCenterX = (minX + maxX) / 2;

        const candidates: ParticleTarget[] = [];

        // Grid scan with contrast and luminance weighting
        const step = 1;
        for (let y = minY; y <= maxY; y += step) {
          const relY = (y - minY) / bboxH; // 0 (top of head) to 1 (bottom torso)
          // Soft fade out on bottom 12%
          const bottomAlpha = relY > 0.88 ? Math.max(0, (1.0 - relY) / 0.12) : 1.0;

          for (let x = minX; x <= maxX; x += step) {
            const idx = (y * sw + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3] / 255;

            if (a < 0.15) continue;

            const rawLum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            // Contrast boost curve
            const lum = Math.min(1.0, Math.pow(rawLum, 0.72) * 1.35);

            // Probability sampling weighted by luminance & alpha
            const prob = Math.max(0.12, lum * 0.95) * a * (0.3 + 0.7 * bottomAlpha);
            if (Math.random() <= prob) {
              // Normalized X centered around subject optical center
              const normX = (x - subjectCenterX) / bboxH; // Aspect ratio preserved relative to height
              const normY = relY; // 0 to 1

              // Facial region detection (upper 45%, center 50%)
              const isFace = relY > 0.12 && relY < 0.48 && Math.abs(x - subjectCenterX) < bboxW * 0.28;
              const baseSize = isFace ? 2.6 + lum * 1.4 : 1.4 + lum * 1.2;

              candidates.push({
                x: normX,
                y: normY,
                size: baseSize,
                brightness: Math.min(1.0, 0.4 + lum * 0.8),
                bottomAlpha,
              });
            }
          }
        }

        this.sampledTargets = candidates;
        this.buildParticleBuffer();
        this.onReady?.();
      };

      if ('requestIdleCallback' in window) {
        (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(sampleAsync);
      } else {
        setTimeout(sampleAsync, 16);
      }
    };
  }

  private buildParticleBuffer() {
    if (!this.scene || this.sampledTargets.length === 0) return;

    const count = this.particleCount;
    const targets = this.sampledTargets;
    const targetCount = targets.length;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Portrait target bounding box within hero
    // Shoulders overlap top half of PORTFOLIO word in lower third
    const isMobile = width < 768;
    const portraitH = Math.min(height * 0.74, isMobile ? 420 : 680);
    const finalWordTop = this.wordTop > 0
      ? this.wordTop
      : height * 0.76 - (this.wordHeight || 140) * 0.5;
    const portraitCenterY = finalWordTop + (this.wordHeight || 140) * 0.25 - portraitH * 0.52;
    const portraitCenterX = width * 0.5;

    const dustPositions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const controlPoints = new Float32Array(count * 3);
    const timings = new Float32Array(count * 2);
    const props = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
      const t = targets[i % targetCount];

      // 1. Dust starting position (random distribution across hero)
      const dustX = Math.random() * width;
      const dustY = Math.random() * height;
      const dustZ = (Math.random() - 0.5) * 80;
      dustPositions[i * 3] = dustX;
      dustPositions[i * 3 + 1] = dustY;
      dustPositions[i * 3 + 2] = dustZ;

      // 2. Final portrait target position
      const targetX = portraitCenterX + t.x * portraitH;
      const targetY = portraitCenterY + t.y * portraitH;
      targetPositions[i * 3] = targetX;
      targetPositions[i * 3 + 1] = targetY;
      targetPositions[i * 3 + 2] = 0;

      // 3. Quadratic bezier control point with perpendicular swirl
      const midX = (dustX + targetX) * 0.5;
      const midY = (dustY + targetY) * 0.5;
      const dx = targetX - dustX;
      const dy = targetY - dustY;
      const len = Math.max(1, Math.hypot(dx, dy));
      const perpX = -dy / len;
      const perpY = dx / len;
      const swirlDist = ((Math.random() - 0.5) * 180 + (t.x > 0 ? 50 : -50));

      controlPoints[i * 3] = midX + perpX * swirlDist;
      controlPoints[i * 3 + 1] = midY + perpY * swirlDist;
      controlPoints[i * 3 + 2] = (Math.random() - 0.5) * 50;

      // 4. Timing: each particle with its own independent random delay (0 to 1.2s) and duration (1.6 to 2.4s)
      // Pure uniform distribution: no sweep, no wipe, no region that appears all at once
      const delay = Math.random() * 1.2;
      const duration = 1.6 + Math.random() * 0.8;
      timings[i * 2] = delay;
      timings[i * 2 + 1] = duration;

      // 5. Props: baseSize, brightness, seed, bottomAlpha
      props[i * 4] = isMobile ? t.size * 0.85 : t.size;
      props[i * 4 + 1] = t.brightness;
      props[i * 4 + 2] = Math.random() * 100.0;
      props[i * 4 + 3] = t.bottomAlpha;
    }

    if (this.geometry) {
      this.geometry.dispose();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    geometry.setAttribute('aDustPosition', new THREE.BufferAttribute(dustPositions, 3));
    geometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(targetPositions, 3));
    geometry.setAttribute('aControlPoint', new THREE.BufferAttribute(controlPoints, 3));
    geometry.setAttribute('aTiming', new THREE.BufferAttribute(timings, 2));
    geometry.setAttribute('aProps', new THREE.BufferAttribute(props, 4));

    this.geometry = geometry;

    if (this.points) {
      this.scene.remove(this.points);
    }

    if (this.material) {
      this.points = new THREE.Points(geometry, this.material);
      this.scene.add(this.points);
    }
  }

  public setWordPosition(top: number, height: number) {
    if (Math.abs(this.wordTop - top) < 2 && Math.abs(this.wordHeight - height) < 2) {
      return;
    }
    this.wordTop = top;
    this.wordHeight = height;
    if (this.sampledTargets.length > 0) {
      this.buildParticleBuffer();
    }
  }

  public setDustAlpha(alpha: number) {
    if (this.material) {
      this.material.uniforms.uDustAlpha.value = alpha;
    }
  }

  public setGatherProgress(progress: number) {
    if (this.material) {
      // Scale progress to cover max delay (1.2) + max duration (2.4) = 3.6
      this.material.uniforms.uConverge.value = progress * 3.6;
    }
  }

  public getConvergenceProgress(): number {
    if (!this.material) return 0;
    return Math.min(1.0, Math.max(0.0, this.material.uniforms.uConverge.value / 3.6));
  }

  public setScroll(scrollP: number) {
    this.currentScrollP = scrollP;
    if (this.material) {
      this.material.uniforms.uScroll.value = scrollP;
    }
    // Resume loop if scrolling back into hero
    if (scrollP < 1 && !this.animFrameId && !this.isDestroyed) {
      this.tick();
    }
  }

  public isReady(): boolean {
    return this.points !== null && this.sampledTargets.length > 0;
  }

  public reset(): void {
    if (this.material) {
      this.material.uniforms.uDustAlpha.value = 0.0;
      this.material.uniforms.uConverge.value = 0.0;
      this.material.uniforms.uScroll.value = 0.0;
    }
  }

  public jumpToFinal() {
    if (this.material) {
      this.material.uniforms.uDustAlpha.value = 1.0;
      this.material.uniforms.uConverge.value = 5.0; // Fully converged
    }
  }

  private setupObservers() {
    // 1. ResizeObserver on Hero Element
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.handleResize(width, height);
        }
      }
    });
    this.resizeObserver.observe(this.container);

    // 2. IntersectionObserver to pause when hero is off-screen
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        this.isHeroInView = entry.isIntersecting;
        if (this.isHeroInView && !this.animFrameId && !this.isDestroyed) {
          this.tick();
        }
      },
      { threshold: 0 }
    );
    this.intersectionObserver.observe(this.container);

    // 3. Tab Visibility change
    const onVisibilityChange = () => {
      this.isTabVisible = !document.hidden;
      if (this.isTabVisible && !this.animFrameId && !this.isDestroyed) {
        this.tick();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  private handleResize(width: number, height: number) {
    if (!this.renderer || !this.material) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);

    this.material.uniforms.uResolution.value.set(width, height);
    this.material.uniforms.uPixelRatio.value = dpr;

    this.particleCount = width < 768 ? 9000 : 24000;
    this.buildParticleBuffer();
  }

  private setupMouseEvents() {
    const onMouseMove = (e: MouseEvent) => {
      if (!this.material) return;
      const rect = this.container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.material.uniforms.uMouse.value.set(x, y);
    };

    const onMouseLeave = () => {
      if (!this.material) return;
      this.material.uniforms.uMouse.value.set(-1000, -1000);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });
  }

  private tick = () => {
    if (this.isDestroyed) return;

    // Pause conditions: off screen, hidden tab, or hero completely scrolled away (p >= 1)
    if (!this.isHeroInView || !this.isTabVisible || this.currentScrollP >= 1) {
      this.animFrameId = null;
      return;
    }

    const elapsed = (performance.now() - this.startTime) * 0.001;

    if (this.material) {
      this.material.uniforms.uTime.value = elapsed;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();

    if (this.points && this.scene) {
      this.scene.remove(this.points);
    }
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer?.dispose();
  }
}
