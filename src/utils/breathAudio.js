// src/utils/breathAudio.js
// Synthesized breathing sounds using Web Audio API

let audioCtx = null;
let activeOsc = null;
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
    if (activeOsc) {
        try {
            activeOsc.stop();
            activeOsc.disconnect();
        } catch (e) { /* already stopped */ }
        activeOsc = null;
    }
    if (activeGain) {
        try { activeGain.disconnect(); } catch (e) { /* ok */ }
        activeGain = null;
    }
}

/**
 * Play a smooth tonal cue for a breathing phase.
 * - Inhale: rising tone (soft wind-like, ascending)
 * - Hold:   gentle steady hum (calm sustained tone)
 * - Exhale: descending tone (releasing, going down)
 */
export function playBreathPhase(phase, durationSeconds) {
    const ctx = getContext();
    stopCurrent();

    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    activeGain = gain;

    const now = ctx.currentTime;
    const dur = durationSeconds;

    if (phase === 'inhale') {
        // Soft rising tone — like breathing in
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(440, now + dur);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + dur * 0.3);
        gain.gain.setValueAtTime(0.15, now + dur * 0.7);
        gain.gain.linearRampToValueAtTime(0.08, now + dur);

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + dur);
        activeOsc = osc;

    } else if (phase === 'hold') {
        // Gentle steady hum — calm and sustained
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);

        // Very subtle vibrato
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(2, now);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(3, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.5);
        gain.gain.setValueAtTime(0.08, now + dur - 0.5);
        gain.gain.linearRampToValueAtTime(0.04, now + dur);

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + dur);

        // Store osc for cleanup
        activeOsc = osc;
        // LFO will stop with osc since they share the context lifetime

    } else if (phase === 'exhale') {
        // Descending tone — like releasing breath
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(180, now + dur);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.setValueAtTime(0.12, now + dur * 0.5);
        gain.gain.linearRampToValueAtTime(0, now + dur);

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + dur);
        activeOsc = osc;
    }
}

export function stopBreathAudio() {
    stopCurrent();
}
