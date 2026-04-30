// src/utils/breathAudio.js
// Synthesized realistic human breathing sounds using Web Audio API Noise shaping

let audioCtx = null;
let activeSource = null;
let activeGain = null;

function getContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function stopCurrent() {
    if (activeSource) {
        try {
            activeSource.stop();
            activeSource.disconnect();
        } catch (e) { /* already stopped */ }
        activeSource = null;
    }
    if (activeGain) {
        try { activeGain.disconnect(); } catch (e) { /* ok */ }
        activeGain = null;
    }
}

// Function to create a short buffer of white noise
function createNoiseBuffer(ctx, durationSecs) {
    const bufferSize = ctx.sampleRate * durationSecs; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // white noise
    }
    return buffer;
}

export function playBreathPhase(phase, durationSeconds) {
    const ctx = getContext();
    stopCurrent();

    const now = ctx.currentTime;
    const dur = durationSeconds;

    // Master gain for this breath part
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    activeGain = masterGain;

    // Filter to shape white noise into soft pinkish "breath" noise
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.connect(masterGain);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(ctx, dur + 1); // generate noise slightly longer than needed
    noiseSource.loop = false;
    noiseSource.connect(filter);
    activeSource = noiseSource;

    if (phase === 'inhale') {
        // Inhale sounds like a rising "Hshhh"
        // Frequency rises
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.linearRampToValueAtTime(1200, now + dur);
        filter.Q.value = 0.5;

        // Volume curve: slow start, peaks, slightly drops at end
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.3, now + dur * 0.7);
        masterGain.gain.linearRampToValueAtTime(0.1, now + dur);

        noiseSource.start(now);
        noiseSource.stop(now + dur);

    } else if (phase === 'hold') {
        // Hold sounds almost silent, maybe just a very low subtle heartbeat or hum? 
        // A human holding breath makes no wind sound. Let's make it completely silent.
        masterGain.gain.setValueAtTime(0, now);
        noiseSource.start(now);
        noiseSource.stop(now + dur);

    } else if (phase === 'exhale') {
        // Exhale sounds like a falling "Ffffhh"
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.linearRampToValueAtTime(300, now + dur);
        filter.Q.value = 0.5;

        // Volume curve: bursts out, then fades
        masterGain.gain.setValueAtTime(0.1, now);
        masterGain.gain.linearRampToValueAtTime(0.35, now + dur * 0.2);
        masterGain.gain.linearRampToValueAtTime(0, now + dur);

        noiseSource.start(now);
        noiseSource.stop(now + dur);
    }
}

export function stopBreathAudio() {
    stopCurrent();
}
