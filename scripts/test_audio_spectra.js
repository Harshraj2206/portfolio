import { chromium } from 'playwright';

async function measureAudioSpectra() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to dev server
  await page.goto('http://localhost:5173/sound-lab', { waitUntil: 'networkidle' });

  // Evaluate sound synthesis inside the browser engine using OfflineAudioContext
  const results = await page.evaluate(async () => {
    const sampleRate = 44100;

    // Helper to generate white noise buffer
    function createNoiseBuffer(ctx, durationSec) {
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    }

    // Measure a rendered audio buffer
    function analyzeBuffer(audioBuffer) {
      const channelData = audioBuffer.getChannelData(0);
      const length = channelData.length;

      // 1. Peak level and dBFS
      let peak = 0;
      let lastSignificantIndex = 0;
      const threshold = 0.001; // -60dB cutoff for duration

      for (let i = 0; i < length; i++) {
        const absVal = Math.abs(channelData[i]);
        if (absVal > peak) peak = absVal;
        if (absVal > threshold) lastSignificantIndex = i;
      }

      const peakDbFS = peak > 0 ? 20 * Math.log10(peak) : -100;
      const activeDurationMs = (lastSignificantIndex / sampleRate) * 1000;

      // 2. FFT for dominant frequencies
      // Find window around peak energy
      const fftSize = 4096;
      const fftBuffer = new Float32Array(fftSize);
      // Grab first 4096 samples or centered
      for (let i = 0; i < Math.min(length, fftSize); i++) {
        // Hann window
        const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / fftSize));
        fftBuffer[i] = channelData[i] * w;
      }

      // Discrete Fourier Transform (DFT for magnitude spectrum bins)
      const numBins = 500; // Up to ~5.3kHz
      const freqResolution = sampleRate / fftSize; // ~10.76 Hz per bin
      const magnitudes = [];

      for (let k = 1; k < numBins; k++) {
        let real = 0;
        let imag = 0;
        const omega = (2 * Math.PI * k) / fftSize;
        for (let n = 0; n < fftSize; n++) {
          real += fftBuffer[n] * Math.cos(omega * n);
          imag -= fftBuffer[n] * Math.sin(omega * n);
        }
        const mag = Math.sqrt(real * real + imag * imag);
        magnitudes.push({ freq: Math.round(k * freqResolution), mag });
      }

      // Sort by magnitude to find top peaks
      magnitudes.sort((a, b) => b.mag - a.mag);
      const topPeaks = magnitudes.slice(0, 3).map((p) => `${p.freq}Hz`);

      return {
        peakLevel: peak.toFixed(3),
        peakDbFS: peakDbFS.toFixed(2),
        durationMs: activeDurationMs.toFixed(1),
        dominantFreqs: topPeaks.join(', '),
      };
    }

    // 1. NAV SOUND
    async function testNav() {
      const renderSec = 0.1;
      const ctx = new OfflineAudioContext(1, sampleRate * renderSec, sampleRate);
      const now = 0;

      // Sine glide 800 -> 560 over 12ms
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.012);

      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(0.30, now + 0.001);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.018);

      // Noise burst 3ms through LP 2.5kHz
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.003);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.003);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      const buffer = await ctx.startRendering();
      return { name: 'nav', ...analyzeBuffer(buffer) };
    }

    // 2. SOCIAL SOUND
    async function testSocial() {
      const renderSec = 0.35;
      const ctx = new OfflineAudioContext(1, sampleRate * renderSec, sampleRate);
      const now = 0;

      const p1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      p1.type = 'sine';
      p1.frequency.setValueAtTime(1318, now);
      g1.gain.setValueAtTime(0.0001, now);
      g1.gain.linearRampToValueAtTime(0.12, now + 0.002);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.220);
      p1.connect(g1);
      g1.connect(ctx.destination);
      p1.start(now);
      p1.stop(now + 0.250);

      const p2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      p2.type = 'sine';
      p2.frequency.setValueAtTime(1976, now);
      g2.gain.setValueAtTime(0.0001, now);
      g2.gain.linearRampToValueAtTime(0.08, now + 0.002);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.220);
      p2.connect(g2);
      g2.connect(ctx.destination);
      p2.start(now);
      p2.stop(now + 0.250);

      // Noise click 2ms HP 3kHz
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.002);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(3000, now);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.05, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.002);
      noise.connect(hp);
      hp.connect(ng);
      ng.connect(ctx.destination);
      noise.start(now);

      const buffer = await ctx.startRendering();
      return { name: 'social', ...analyzeBuffer(buffer) };
    }

    // 3. BUTTON SOUND
    async function testButton() {
      const renderSec = 0.08;
      const ctx = new OfflineAudioContext(1, sampleRate * renderSec, sampleRate);
      const now = 0;

      // Click transient 2100 -> 1800 over 8ms
      const osc = ctx.createOscillator();
      const og = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2100, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.008);
      og.gain.setValueAtTime(0.0001, now);
      og.gain.linearRampToValueAtTime(0.22, now + 0.001);
      og.gain.exponentialRampToValueAtTime(0.001, now + 0.010);
      osc.connect(og);
      og.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.014);

      // Body 500Hz 6ms
      const body = ctx.createOscillator();
      const bg = ctx.createGain();
      body.type = 'sine';
      body.frequency.setValueAtTime(500, now);
      bg.gain.setValueAtTime(0.07, now);
      bg.gain.exponentialRampToValueAtTime(0.001, now + 0.006);
      body.connect(bg);
      bg.connect(ctx.destination);
      body.start(now);
      body.stop(now + 0.008);

      // Noise 2ms BP 2.2kHz
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.002);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2200, now);
      bp.Q.setValueAtTime(1.2, now);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.10, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.002);
      noise.connect(bp);
      bp.connect(ng);
      ng.connect(ctx.destination);
      noise.start(now);

      const buffer = await ctx.startRendering();
      return { name: 'button', ...analyzeBuffer(buffer) };
    }

    // 4. STATE SOUND
    async function testState() {
      const renderSec = 0.65;
      const ctx = new OfflineAudioContext(1, sampleRate * renderSec, sampleRate);
      const now = 0;

      // Two sines at 520 & 780
      const s1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      s1.type = 'sine';
      s1.frequency.setValueAtTime(520, now);
      g1.gain.setValueAtTime(0.0001, now);
      g1.gain.linearRampToValueAtTime(0.16, now + 0.012);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.550);
      s1.connect(g1);
      g1.connect(ctx.destination);
      s1.start(now);
      s1.stop(now + 0.580);

      const s2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      s2.type = 'sine';
      s2.frequency.setValueAtTime(780, now);
      g2.gain.setValueAtTime(0.0001, now);
      g2.gain.linearRampToValueAtTime(0.12, now + 0.012);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.550);
      s2.connect(g2);
      g2.connect(ctx.destination);
      s2.start(now);
      s2.stop(now + 0.580);

      // Body 130 -> 90 over 120ms
      const body = ctx.createOscillator();
      const bg = ctx.createGain();
      body.type = 'sine';
      body.frequency.setValueAtTime(130, now);
      body.frequency.exponentialRampToValueAtTime(90, now + 0.120);
      bg.gain.setValueAtTime(0.0001, now);
      bg.gain.linearRampToValueAtTime(0.15, now + 0.005);
      bg.gain.exponentialRampToValueAtTime(0.001, now + 0.120);
      body.connect(bg);
      bg.connect(ctx.destination);
      body.start(now);
      body.stop(now + 0.130);

      // Noise whoosh 3kHz -> 400Hz over 300ms
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.300);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(3000, now);
      lp.frequency.exponentialRampToValueAtTime(400, now + 0.300);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, now);
      ng.gain.linearRampToValueAtTime(0.10, now + 0.020);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.300);
      noise.connect(lp);
      lp.connect(ng);
      ng.connect(ctx.destination);
      noise.start(now);

      const buffer = await ctx.startRendering();
      return { name: 'state', ...analyzeBuffer(buffer) };
    }

    // 5. HOVER SOUND
    async function testHover() {
      const renderSec = 0.05;
      const ctx = new OfflineAudioContext(1, sampleRate * renderSec, sampleRate);
      const now = 0;

      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.05, now + 0.001);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.006);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.007);

      const buffer = await ctx.startRendering();
      return { name: 'hover', ...analyzeBuffer(buffer) };
    }

    return [
      await testNav(),
      await testSocial(),
      await testButton(),
      await testState(),
      await testHover(),
    ];
  });

  await browser.close();

  console.log('\n=============================================================================');
  console.log('              OFFLINE AUDIO CONTEXT SPECTRAL MEASUREMENTS');
  console.log('=============================================================================');
  console.table(results);
  console.log('=============================================================================\n');

  // Verify requirements
  for (const r of results) {
    const db = parseFloat(r.peakDbFS);
    if (db > -3.0) {
      console.warn(`WARNING: Sound ${r.name} peak level ${db} dBFS exceeds -3.0 dBFS target.`);
    }
  }
}

measureAudioSpectra().catch((err) => {
  console.error(err);
  process.exit(1);
});
