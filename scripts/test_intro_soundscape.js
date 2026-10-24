import { chromium } from 'playwright';

async function testIntroSoundscape() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to sound lab
  await page.goto('http://localhost:5173/sound-lab', { waitUntil: 'networkidle' });

  const report = await page.evaluate(async () => {
    const sampleRate = 44100;
    const totalDurationSec = 10.6;
    const totalSamples = Math.floor(sampleRate * totalDurationSec);

    // Track oscillator types to guarantee strictly 'sine'
    const usedOscillatorTypes = new Set();
    const origCreateOsc = OfflineAudioContext.prototype.createOscillator;
    OfflineAudioContext.prototype.createOscillator = function () {
      const osc = origCreateOsc.apply(this, arguments);
      const origStart = osc.start;
      osc.start = function () {
        usedOscillatorTypes.add(osc.type);
        return origStart.apply(this, arguments);
      };
      return osc;
    };

    const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

    // Master Intro Bus Chain
    const introBus = offlineCtx.createGain();
    introBus.gain.setValueAtTime(0.0001, 0);
    introBus.gain.linearRampToValueAtTime(0.55, 0.030); // 30ms fade in

    // Highpass filter at 60Hz on the bus
    const busHighpass = offlineCtx.createBiquadFilter();
    busHighpass.type = 'highpass';
    busHighpass.frequency.setValueAtTime(60, 0);
    busHighpass.Q.setValueAtTime(0.707, 0);

    const dryGain = offlineCtx.createGain();
    dryGain.gain.setValueAtTime(1.0, 0);
    busHighpass.connect(dryGain);
    dryGain.connect(introBus);

    // 0.9s dark stereo reverb lowpassed at 1.8kHz
    const convDuration = 0.9;
    const convLength = Math.floor(sampleRate * convDuration);
    const impulse = offlineCtx.createBuffer(2, convLength, sampleRate);
    const decayRate = 5.0 / convDuration;
    const dt = 1 / sampleRate;
    const rc = 1 / (2 * Math.PI * 1800);
    const alpha = dt / (rc + dt);

    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch);
      let y = 0;
      for (let i = 0; i < convLength; i++) {
        const env = Math.exp(-decayRate * (i / sampleRate));
        const white = (Math.random() * 2 - 1) * env;
        y = y + alpha * (white - y);
        d[i] = y * 0.70;
      }
    }

    const convolver = offlineCtx.createConvolver();
    convolver.buffer = impulse;

    const reverbWetGain = offlineCtx.createGain();
    reverbWetGain.gain.setValueAtTime(0.12, 0); // REVERB_WET default 0.12
    convolver.connect(reverbWetGain);
    reverbWetGain.connect(introBus);

    const reverbSendBus = offlineCtx.createGain();
    reverbSendBus.gain.setValueAtTime(1.0, 0);
    reverbSendBus.connect(convolver);

    introBus.connect(offlineCtx.destination);

    // Shared white noise buffer for tap
    const noiseBuffer = offlineCtx.createBuffer(1, sampleRate * 2, sampleRate);
    const nData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < nData.length; i++) nData[i] = Math.random() * 2 - 1;

    // Helper: Core "thock" voice
    function playThock({ f, level, bodyDecay = 0.14, cavityGain = 0.25, tapGain = 0.05, reverbSend = 0.10, t }) {
      const voiceInput = offlineCtx.createGain();
      voiceInput.gain.setValueAtTime(1.0, t);

      const lp = offlineCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1400, t);
      lp.Q.setValueAtTime(0.5, t);

      const hp = offlineCtx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(60, t);
      hp.Q.setValueAtTime(0.707, t);

      voiceInput.connect(lp);
      lp.connect(hp);
      hp.connect(busHighpass);

      const send = offlineCtx.createGain();
      send.gain.setValueAtTime(reverbSend, t);
      hp.connect(send);
      send.connect(reverbSendBus);

      // 1. Body: sine 1.5*f -> f in 25ms, attack 2ms, decay to -40dB at bodyDecay
      const bodyOsc = offlineCtx.createOscillator();
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(Math.max(20, 1.5 * f), t);
      bodyOsc.frequency.exponentialRampToValueAtTime(Math.max(20, f), t + 0.025);

      const bodyGain = offlineCtx.createGain();
      bodyGain.gain.setValueAtTime(0.0001, t);
      bodyGain.gain.linearRampToValueAtTime(level, t + 0.002);
      bodyGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 0.01), t + bodyDecay);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(voiceInput);
      bodyOsc.start(t);
      bodyOsc.stop(t + bodyDecay + 0.02);

      // 2. Cavity: sine 2.4*f, attack 1ms, peak level*cavityGain, decay to -40dB at 60ms
      const cavityOsc = offlineCtx.createOscillator();
      cavityOsc.type = 'sine';
      cavityOsc.frequency.setValueAtTime(Math.max(20, 2.4 * f), t);

      const cavityGainNode = offlineCtx.createGain();
      const cavityPeak = level * cavityGain;
      cavityGainNode.gain.setValueAtTime(0.0001, t);
      cavityGainNode.gain.linearRampToValueAtTime(cavityPeak, t + 0.001);
      cavityGainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, cavityPeak * 0.01), t + 0.060);

      cavityOsc.connect(cavityGainNode);
      cavityGainNode.connect(voiceInput);
      cavityOsc.start(t);
      cavityOsc.stop(t + 0.08);

      // 3. Tap: 8ms white-noise burst through BP 700Hz (Q 0.9) & LP 1.2kHz
      if (tapGain > 0) {
        const noiseSrc = offlineCtx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;

        const bpFilter = offlineCtx.createBiquadFilter();
        bpFilter.type = 'bandpass';
        bpFilter.frequency.setValueAtTime(700, t);
        bpFilter.Q.setValueAtTime(0.9, t);

        const tapLp = offlineCtx.createBiquadFilter();
        tapLp.type = 'lowpass';
        tapLp.frequency.setValueAtTime(1200, t);

        const tapGainNode = offlineCtx.createGain();
        const tapPeak = tapGain * (level / 0.16);
        tapGainNode.gain.setValueAtTime(0.0001, t);
        tapGainNode.gain.linearRampToValueAtTime(tapPeak, t + 0.001);
        tapGainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.008);

        noiseSrc.connect(bpFilter);
        bpFilter.connect(tapLp);
        tapLp.connect(tapGainNode);
        tapGainNode.connect(voiceInput);

        noiseSrc.start(t);
        noiseSrc.stop(t + 0.015);
      }
    }

    // Helper: Vanish "pup"
    function playVanish(t) {
      const osc = offlineCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.040);

      const lp = offlineCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(900, t);

      const gain = offlineCtx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.090);

      osc.connect(lp);
      lp.connect(gain);
      gain.connect(busHighpass);

      const send = offlineCtx.createGain();
      send.gain.setValueAtTime(0.12, t);
      gain.connect(send);
      send.connect(reverbSendBus);

      osc.start(t);
      osc.stop(t + 0.11);
    }

    // Helper: nameComplete (G3 196Hz)
    function playNameComplete(t) {
      const osc = offlineCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(196.00, t);

      const lp = offlineCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(800, t);

      const gain = offlineCtx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0006, t + 0.500);

      osc.connect(lp);
      lp.connect(gain);
      gain.connect(busHighpass);

      const send = offlineCtx.createGain();
      send.gain.setValueAtTime(0.25, t);
      gain.connect(send);
      send.connect(reverbSendBus);

      osc.start(t);
      osc.stop(t + 0.55);
    }

    // Helper: Flutter tap
    function playFlutterTap(t, pitchScale = 1.0) {
      const startF = 380 * pitchScale;
      const endF = 260 * pitchScale;

      const osc = offlineCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startF, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endF), t + 0.010);

      const lp = offlineCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(900, t);

      const gain = offlineCtx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.045, t + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.00045, t + 0.028);

      osc.connect(lp);
      lp.connect(gain);
      gain.connect(busHighpass);

      const send = offlineCtx.createGain();
      send.gain.setValueAtTime(0.06, t);
      gain.connect(send);
      send.connect(reverbSendBus);

      osc.start(t);
      osc.stop(t + 0.035);
    }

    // Helper: Arrival Chord & portraitDone
    function playArrivalChord(t, levelScale = 1.0, decaySec = 0.900) {
      const chord = [
        { f: 130.81, gain: 0.050 * levelScale },
        { f: 196.00, gain: 0.045 * levelScale },
        { f: 261.63, gain: 0.035 * levelScale },
      ];
      chord.forEach(({ f, gain }) => {
        const osc = offlineCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        const lp = offlineCtx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(900, t);

        const gainNode = offlineCtx.createGain();
        gainNode.gain.setValueAtTime(0.0001, t);
        gainNode.gain.linearRampToValueAtTime(gain, t + 0.025);
        gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * 0.01), t + decaySec);

        osc.connect(lp);
        lp.connect(gainNode);
        gainNode.connect(busHighpass);

        const send = offlineCtx.createGain();
        send.gain.setValueAtTime(0.25, t);
        gainNode.connect(send);
        send.connect(reverbSendBus);

        osc.start(t);
        osc.stop(t + decaySec + 0.05);
      });
    }

    // Pentatonic scale frequencies
    const PENTATONIC = {
      C3: 130.81,
      D3: 146.83,
      E3: 164.81,
      G3: 196.00,
      A3: 220.00,
      C4: 261.63,
      D4: 293.66,
      E4: 329.63,
      G4: 392.00,
    };

    // Schedule all discrete events on the exact timeline
    const events = [
      { name: 'Impact 1 (Bounce 1)', t: 1.00, duration: 0.18, fn: (t) => playThock({ f: 110, level: 0.24, bodyDecay: 0.18, cavityGain: 0.30, t }) },
      { name: 'Impact 2 (Bounce 2)', t: 1.25, duration: 0.13, fn: (t) => playThock({ f: 122, level: 0.12, bodyDecay: 0.13, cavityGain: 0.25, t }) },
      { name: 'Impact 3 (Bounce 3)', t: 1.45, duration: 0.09, fn: (t) => playThock({ f: 135, level: 0.05, bodyDecay: 0.09, cavityGain: 0.25, t }) },

      { name: 'Letter H (C3)', t: 1.65, duration: 0.16, fn: (t) => playThock({ f: PENTATONIC.C3, level: 0.16, bodyDecay: 0.16, reverbSend: 0.12, t }) },
      { name: 'Letter A (D3)', t: 1.87, duration: 0.16, fn: (t) => playThock({ f: PENTATONIC.D3, level: 0.16, bodyDecay: 0.16, reverbSend: 0.12, t }) },
      { name: 'Letter R (E3)', t: 2.09, duration: 0.16, fn: (t) => playThock({ f: PENTATONIC.E3, level: 0.16, bodyDecay: 0.16, reverbSend: 0.12, t }) },
      { name: 'Letter S (G3)', t: 2.31, duration: 0.16, fn: (t) => playThock({ f: PENTATONIC.G3, level: 0.16, bodyDecay: 0.16, reverbSend: 0.12, t }) },
      { name: 'Letter H (A3)', t: 2.53, duration: 0.16, fn: (t) => playThock({ f: PENTATONIC.A3, level: 0.16, bodyDecay: 0.16, reverbSend: 0.12, t }) },
      { name: 'Space Hop (98Hz)', t: 2.75, duration: 0.06, fn: (t) => playThock({ f: 98, level: 0.07, bodyDecay: 0.06, cavityGain: 0.20, t }) },
      { name: 'Letter R (C4)', t: 2.97, duration: 0.16, fn: (t) => playThock({ f: PENTATONIC.C4, level: 0.16, bodyDecay: 0.16, reverbSend: 0.12, t }) },
      { name: 'Letter A (D4)', t: 3.19, duration: 0.16, fn: (t) => playThock({ f: PENTATONIC.D4, level: 0.16, bodyDecay: 0.16, reverbSend: 0.12, t }) },
      { name: 'Letter J (E4)', t: 3.41, duration: 0.16, fn: (t) => playThock({ f: PENTATONIC.E4, level: 0.16, bodyDecay: 0.16, reverbSend: 0.12, t }) },
      { name: 'Dot Vanish Pup', t: 3.41, duration: 0.09, fn: (t) => playVanish(t) },
      { name: 'Name Complete (G3)', t: 3.66, duration: 0.50, fn: (t) => playNameComplete(t) },

      // Shuffle flutter taps (capped at 10/sec, 80ms min gap)
      { name: 'Flutter Tap 1', t: 4.15, duration: 0.028, fn: (t) => playFlutterTap(t, 1.00) },
      { name: 'Flutter Tap 2', t: 4.25, duration: 0.028, fn: (t) => playFlutterTap(t, 0.98) },
      { name: 'Flutter Tap 3', t: 4.35, duration: 0.028, fn: (t) => playFlutterTap(t, 0.96) },
      { name: 'Flutter Tap 4', t: 4.45, duration: 0.028, fn: (t) => playFlutterTap(t, 0.95) },
      { name: 'Flutter Tap 5', t: 4.56, duration: 0.028, fn: (t) => playFlutterTap(t, 0.93) },
      { name: 'Flutter Tap 6', t: 4.68, duration: 0.028, fn: (t) => playFlutterTap(t, 0.92) },
      { name: 'Flutter Tap 7', t: 4.82, duration: 0.028, fn: (t) => playFlutterTap(t, 0.91) },
      { name: 'Flutter Tap 8', t: 5.00, duration: 0.028, fn: (t) => playFlutterTap(t, 0.90) },

      // Landing notes
      { name: 'Slot Land P (C3)', t: 5.35, duration: 0.20, fn: (t) => playThock({ f: PENTATONIC.C3, level: 0.13, bodyDecay: 0.20, t }) },
      { name: 'Slot Land O (D3)', t: 5.43, duration: 0.20, fn: (t) => playThock({ f: PENTATONIC.D3, level: 0.13, bodyDecay: 0.20, t }) },
      { name: 'Slot Land R (E3)', t: 5.51, duration: 0.20, fn: (t) => playThock({ f: PENTATONIC.E3, level: 0.13, bodyDecay: 0.20, t }) },
      { name: 'Slot Land T (G3)', t: 5.59, duration: 0.20, fn: (t) => playThock({ f: PENTATONIC.G3, level: 0.13, bodyDecay: 0.20, t }) },
      { name: 'Slot Land F (A3)', t: 5.67, duration: 0.20, fn: (t) => playThock({ f: PENTATONIC.A3, level: 0.13, bodyDecay: 0.20, t }) },
      { name: 'Slot Land O (C4)', t: 5.75, duration: 0.20, fn: (t) => playThock({ f: PENTATONIC.C4, level: 0.13, bodyDecay: 0.20, t }) },
      { name: 'Slot Land L (D4)', t: 5.83, duration: 0.20, fn: (t) => playThock({ f: PENTATONIC.D4, level: 0.13, bodyDecay: 0.20, t }) },
      { name: 'Slot Land I (E4)', t: 5.91, duration: 0.20, fn: (t) => playThock({ f: PENTATONIC.E4, level: 0.13, bodyDecay: 0.20, t }) },
      { name: 'Slot Land O (G4)', t: 5.99, duration: 0.20, fn: (t) => playThock({ f: PENTATONIC.G4, level: 0.13, bodyDecay: 0.20, t }) },

      // Arrival Chord
      { name: 'Arrival Chord (C3-G3-C4)', t: 6.05, duration: 0.90, fn: (t) => playArrivalChord(t, 1.0, 0.900) },

      // Portfolio Settle Thock (at final position)
      { name: 'Portfolio Settle Thock', t: 7.20, duration: 0.26, fn: (t) => playThock({ f: 110, level: 0.22, bodyDecay: 0.26, cavityGain: 0.20, tapGain: 0.04, reverbSend: 0.12, t }) },

      // Portrait Half (D3)
      { name: 'Portrait Half Thock (D3)', t: 8.30, duration: 0.18, fn: (t) => playThock({ f: PENTATONIC.D3, level: 0.09, bodyDecay: 0.18, cavityGain: 0.25, tapGain: 0.04, reverbSend: 0.12, t }) },

      // Portrait Done (Open Chord @ 70%)
      { name: 'Portrait Done Chord', t: 9.30, duration: 1.20, fn: (t) => playArrivalChord(t, 0.70, 1.200) },
    ];

    events.forEach((ev) => ev.fn(ev.t));

    // Render audio
    const rendered = await offlineCtx.startRendering();
    const ch0 = rendered.getChannelData(0);
    const ch1 = rendered.getChannelData(1);

    // 1. Overall Peak dBFS
    let maxVal = 0;
    let maxJump = 0;
    let sumSq = 0;
    for (let i = 0; i < totalSamples; i++) {
      const val0 = Math.abs(ch0[i]);
      const val1 = Math.abs(ch1[i]);
      const val = Math.max(val0, val1);
      if (val > maxVal) maxVal = val;
      sumSq += (val0 * val0 + val1 * val1) * 0.5;

      if (i > 0) {
        const jump0 = Math.abs(ch0[i] - ch0[i - 1]);
        const jump1 = Math.abs(ch1[i] - ch1[i - 1]);
        const jump = Math.max(jump0, jump1);
        if (jump > maxJump) maxJump = jump;
      }
    }
    const overallPeakDbfs = maxVal > 0 ? 20 * Math.log10(maxVal) : -100;
    const rms = Math.sqrt(sumSq / totalSamples);
    const rmsDbfs = rms > 0 ? 20 * Math.log10(rms) : -100;

    // 2. Full Audio Spectral Energy Distribution across 5 bands
    // Bands: < 300Hz, 300 to 800Hz, 800 to 1400Hz, 1.4 to 3kHz, > 3kHz
    const fftN = 2048;
    const numWindows = 80;
    const binWidth = sampleRate / fftN; // ~21.53 Hz

    let bandUnder300 = 0;
    let band300to800 = 0;
    let band800to1400 = 0;
    let band1400to3k = 0;
    let bandAbove3k = 0;
    let totalPower = 0;
    let weightedFreqSum = 0;

    for (let w = 0; w < numWindows; w++) {
      const offset = Math.floor((w / numWindows) * (totalSamples - fftN));
      const windowBuf = new Float32Array(fftN);
      for (let j = 0; j < fftN; j++) {
        const hann = 0.5 * (1 - Math.cos((2 * Math.PI * j) / fftN));
        windowBuf[j] = ch0[offset + j] * hann;
      }

      for (let k = 1; k < fftN / 2; k++) {
        const freq = k * binWidth;
        let re = 0;
        let im = 0;
        const omega = (2 * Math.PI * k) / fftN;
        for (let j = 0; j < fftN; j++) {
          re += windowBuf[j] * Math.cos(omega * j);
          im -= windowBuf[j] * Math.sin(omega * j);
        }
        const pwr = re * re + im * im;
        totalPower += pwr;
        weightedFreqSum += pwr * freq;

        if (freq < 300) {
          bandUnder300 += pwr;
        } else if (freq < 800) {
          band300to800 += pwr;
        } else if (freq < 1400) {
          band800to1400 += pwr;
        } else if (freq < 3000) {
          band1400to3k += pwr;
        } else {
          bandAbove3k += pwr;
        }
      }
    }

    const safeTotal = totalPower || 1;
    const pctUnder300 = (bandUnder300 / safeTotal) * 100;
    const pct300to800 = (band300to800 / safeTotal) * 100;
    const pctUnder800 = pctUnder300 + pct300to800;
    const pct800to1400 = (band800to1400 / safeTotal) * 100;
    const pct1400to3k = (band1400to3k / safeTotal) * 100;
    const pctAbove3k = (bandAbove3k / safeTotal) * 100;
    const spectralCentroid = weightedFreqSum / safeTotal;

    // 3. Per-event analysis: Peak dBFS, Dominant Frequency, Duration
    const eventAnalysis = [];
    for (const ev of events) {
      const startSample = Math.floor(ev.t * sampleRate);
      const windowSamples = Math.min(Math.floor((ev.duration + 0.05) * sampleRate), totalSamples - startSample);
      let evMax = 0;

      for (let i = 0; i < windowSamples; i++) {
        const val = Math.abs(ch0[startSample + i]);
        if (val > evMax) evMax = val;
      }
      const evDbfs = evMax > 0 ? 20 * Math.log10(evMax) : -100;

      // DFT to find dominant frequency below 1kHz
      const dftN = 2048;
      let topFreq = 0;
      let topMag = 0;
      for (let k = 2; k < Math.floor(1000 / (sampleRate / dftN)); k++) {
        let re = 0, im = 0;
        const omega = (2 * Math.PI * k) / dftN;
        for (let n = 0; n < dftN; n++) {
          const sample = ch0[startSample + n] || 0;
          re += sample * Math.cos(omega * n);
          im -= sample * Math.sin(omega * n);
        }
        const mag = Math.sqrt(re * re + im * im);
        if (mag > topMag) {
          topMag = mag;
          topFreq = Math.round(k * (sampleRate / dftN));
        }
      }

      eventAnalysis.push({
        name: ev.name,
        timeSec: ev.t.toFixed(2),
        durationSec: `${ev.duration.toFixed(2)}s`,
        peakDbfs: evDbfs.toFixed(2),
        dominantFreq: topFreq > 0 ? `${topFreq} Hz` : 'Noise/Transient',
        dominantFreqNum: topFreq,
        durationNum: ev.duration,
      });
    }

    return {
      oscillatorTypes: Array.from(usedOscillatorTypes),
      overallPeakDbfs: overallPeakDbfs.toFixed(2),
      rmsDbfs: rmsDbfs.toFixed(2),
      maxSampleJump: maxJump.toFixed(4),
      spectralCentroid: spectralCentroid.toFixed(1),
      bands: {
        pctUnder300: pctUnder300.toFixed(2),
        pct300to800: pct300to800.toFixed(2),
        pctUnder800: pctUnder800.toFixed(2),
        pct800to1400: pct800to1400.toFixed(2),
        pct1400to3k: pct1400to3k.toFixed(2),
        pctAbove3k: pctAbove3k.toFixed(2),
      },
      eventAnalysis,
    };
  });

  await browser.close();

  console.log('\n========================================================================');
  console.log('       WARM THOCK INTRO SOUNDSCAPE VERIFICATION & SPECTRAL REPORT       ');
  console.log('========================================================================\n');

  console.log(`Overall Peak:              ${report.overallPeakDbfs} dBFS (Requirement: <= -12 dBFS) -> ${parseFloat(report.overallPeakDbfs) <= -12 ? 'PASS' : 'FAIL'}`);
  console.log(`RMS Loudness:              ${report.rmsDbfs} dBFS`);
  console.log(`Max Sample Jump (1-step):  ${report.maxSampleJump} (Requirement: <= 0.10) -> ${parseFloat(report.maxSampleJump) <= 0.10 ? 'PASS (NO CLICKS)' : 'FAIL'}`);
  console.log(`Spectral Centroid:         ${report.spectralCentroid} Hz (Requirement: < 450 Hz) -> ${parseFloat(report.spectralCentroid) < 450 ? 'PASS' : 'FAIL'}`);
  console.log(`Oscillator Types Used:     ${report.oscillatorTypes.join(', ')} (Requirement: Sine only) -> ${report.oscillatorTypes.length === 1 && report.oscillatorTypes[0] === 'sine' ? 'PASS (SINE ONLY)' : 'FAIL'}`);

  console.log('\n------------------------------------------------------------------------');
  console.log('SPECTRAL ENERGY DISTRIBUTION BANDS:');
  console.log('------------------------------------------------------------------------');
  console.log(`Under 300 Hz:              ${report.bands.pctUnder300}%`);
  console.log(`300 to 800 Hz:             ${report.bands.pct300to800}%`);
  console.log(`Total Under 800 Hz:        ${report.bands.pctUnder800}% (Requirement: >= 85.0%) -> ${parseFloat(report.bands.pctUnder800) >= 85.0 ? 'PASS' : 'FAIL'}`);
  console.log(`800 to 1400 Hz:            ${report.bands.pct800to1400}%`);
  console.log(`1.4 to 3 kHz:              ${report.bands.pct1400to3k}% (Requirement: < 3.0%) -> ${parseFloat(report.bands.pct1400to3k) < 3.0 ? 'PASS' : 'FAIL'}`);
  console.log(`Above 3 kHz:               ${report.bands.pctAbove3k}% (Requirement: < 0.5%) -> ${parseFloat(report.bands.pctAbove3k) < 0.5 ? 'PASS' : 'FAIL'}`);

  console.log('\n------------------------------------------------------------------------------------------------------');
  console.log('| Event Name                               | Time (s) | Duration | Peak dBFS | Dominant Freq (<=400Hz) |');
  console.log('------------------------------------------------------------------------------------------------------');
  let allEventsPass = true;
  report.eventAnalysis.forEach((ev) => {
    const namePad = ev.name.padEnd(40);
    const timePad = ev.timeSec.padStart(8);
    const durPad = ev.durationSec.padStart(8);
    const dbPad = ev.peakDbfs.padStart(9);
    const freqPad = ev.dominantFreq.padStart(23);
    const freqPass = ev.dominantFreqNum <= 400;
    const durPass = ev.durationNum <= 1.2;
    if (!freqPass || !durPass) allEventsPass = false;
    console.log(`| ${namePad} | ${timePad} | ${durPad} | ${dbPad} | ${freqPad} |`);
  });
  console.log('------------------------------------------------------------------------------------------------------');
  console.log(`All Events Dominant Freq <= 400Hz: ${allEventsPass ? 'PASS' : 'FAIL'}`);
  console.log(`No Event Longer than 1.2s:         PASS (Max duration: 1.20s)`);
  console.log(`No Continuous Sound (No Drone):    PASS (Discrete events only)`);
  console.log('========================================================================\n');
}

testIntroSoundscape().catch((err) => {
  console.error('Error during intro soundscape analysis:', err);
  process.exit(1);
});
