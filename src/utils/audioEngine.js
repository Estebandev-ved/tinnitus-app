// src/utils/audioEngine.js

export const AudioEngine = {
    audioContext: null,
    activeSounds: new Map(), // Stores { source, gainNode } by soundId

    // Notched sound therapy state: removes a band (~1 octave) around the tinnitus frequency
    notch: { frequency: null, enabled: false },

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    // Configure the notch (band-stop) applied to library sounds.
    // frequency: tinnitus center frequency in Hz; enabled: whether to carve it out.
    setNotch(frequency, enabled) {
        this.notch = {
            frequency: frequency ? Number(frequency) : this.notch.frequency,
            enabled: !!enabled
        };
    },

    // Build a band-stop (notch) filter chain centered on `freq`.
    // A single 'notch' biquad only nulls exactly at the center, so we cascade
    // a few stages to deepen the suppression across the band.
    // bandwidthOctaves: 1 octave (Q≈1.41) by default; 0.5 octave (Q≈2.87) is narrower.
    // Returns { input, output } so callers can splice it into a chain.
    createNotchChain(freq, bandwidthOctaves = 1, stages = 3) {
        // Q for a given bandwidth in octaves: Q = sqrt(2^BW) / (2^BW - 1)
        const bw = Math.pow(2, bandwidthOctaves);
        const Q = Math.sqrt(bw) / (bw - 1);

        let input = null;
        let prev = null;
        for (let i = 0; i < stages; i++) {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'notch';
            filter.frequency.value = freq;
            filter.Q.value = Q;
            if (!input) {
                input = filter;
            } else {
                prev.connect(filter);
            }
            prev = filter;
        }
        return { input, output: prev };
    },

    stop(soundId) {
        if (soundId) {
            // Stop specific sound
            const sound = this.activeSounds.get(soundId);
            if (sound) {
                try {
                    sound.source.stop();
                    sound.source.disconnect();
                    sound.gainNode.disconnect();
                } catch (e) { console.warn("Error stopping sound:", e); }
                this.activeSounds.delete(soundId);
            }
        } else {
            // Stop ALL sounds
            this.activeSounds.forEach((sound, id) => {
                try {
                    sound.source.stop();
                    sound.source.disconnect();
                    sound.gainNode.disconnect();
                } catch (e) { console.warn("Error stopping sound:", id, e); }
            });
            this.activeSounds.clear();
        }
    },

    play(soundId) {
        this.init();

        // If sound is already playing, do nothing or restart? Let's just return for now.
        if (this.activeSounds.has(soundId)) return;

        // Create specific Gain Node for this sound
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.5; // Default volume 50% for mixing
        gainNode.connect(this.audioContext.destination);

        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const sourceNode = this.audioContext.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.loop = true;

        let finalNode = sourceNode;

        // Apply Filters based on Sound ID
        if (soundId === 'pink') {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            sourceNode.connect(filter);
            finalNode = filter;
        } else if (soundId === 'fan' || soundId === 'ocean' || soundId === 'brown') {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            sourceNode.connect(filter);
            finalNode = filter;
        } else if (soundId === 'rain') {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highshelf';
            filter.frequency.value = 8000;
            filter.gain.value = -10;
            sourceNode.connect(filter);
            finalNode = filter;
        }

        // Insert notch (band-stop) around the tinnitus frequency when enabled.
        // All library sounds here are broadband noise, so this carves out the band.
        if (this.notch.enabled && this.notch.frequency) {
            const { input, output } = this.createNotchChain(this.notch.frequency);
            finalNode.connect(input);
            finalNode = output;
        }

        // Connect chain
        finalNode.connect(gainNode);
        sourceNode.start();

        // Store in Map
        this.activeSounds.set(soundId, { source: sourceNode, gainNode: gainNode });
    },

    setVolume(soundId, value) {
        const sound = this.activeSounds.get(soundId);
        if (sound && sound.gainNode) {
            sound.gainNode.gain.value = value;
        }
    },

    // Sleep Timer: fade out all sounds over `durationMs` milliseconds
    fadeOutAll(durationMs, onComplete) {
        const fadeSteps = 50;
        const intervalMs = durationMs / fadeSteps;
        let step = 0;

        // Capture current volumes
        const initialVolumes = new Map();
        this.activeSounds.forEach((sound, id) => {
            initialVolumes.set(id, sound.gainNode.gain.value);
        });

        const fadeInterval = setInterval(() => {
            step++;
            const ratio = 1 - (step / fadeSteps);

            this.activeSounds.forEach((sound, id) => {
                const initVol = initialVolumes.get(id) || 0.5;
                sound.gainNode.gain.value = Math.max(0, initVol * ratio);
            });

            if (step >= fadeSteps) {
                clearInterval(fadeInterval);
                this.stop(); // Stop all after fade
                if (onComplete) onComplete();
            }
        }, intervalMs);

        return fadeInterval; // Return so it can be cancelled
    },

    // Custom Noise Generator: play noise filtered to a specific frequency with optional pulsation
    playCustomNoise(frequency, modulationRate = 0) {
        this.init();

        if (this.activeSounds.has('custom')) {
            this.stop('custom');
        }

        const masterGainNode = this.audioContext.createGain();
        masterGainNode.gain.value = 0.5;
        masterGainNode.connect(this.audioContext.destination);

        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const sourceNode = this.audioContext.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.loop = true;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = frequency;
        filter.Q.value = 5;

        sourceNode.connect(filter);

        if (modulationRate > 0) {
            // Apply AM (Amplitude Modulation) for pulsation
            const lfo = this.audioContext.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = modulationRate; // e.g., 0.5 Hz to 2 Hz

            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = 0.5; // Depth of modulation

            // Auto-reduce base volume to allow LFO room
            const baseGain = this.audioContext.createGain();
            baseGain.gain.value = 0.5;

            // LFO modifies baseGain
            lfo.connect(lfoGain);
            lfoGain.connect(baseGain.gain);

            filter.connect(baseGain);
            baseGain.connect(masterGainNode);

            lfo.start();
            this.activeSounds.set('custom', { source: sourceNode, gainNode: masterGainNode, lfo: lfo });
        } else {
            filter.connect(masterGainNode);
            this.activeSounds.set('custom', { source: sourceNode, gainNode: masterGainNode });
        }

        sourceNode.start();
    },

    // Notched Sound Therapy: broadband noise with a band-stop notch REMOVING the
    // tinnitus frequency (the scientific inverse of the bandpass masker above).
    playNotchedNoise(frequency, modulationRate = 0) {
        this.init();

        if (this.activeSounds.has('custom')) {
            this.stop('custom');
        }

        const masterGainNode = this.audioContext.createGain();
        masterGainNode.gain.value = 0.5;
        masterGainNode.connect(this.audioContext.destination);

        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const sourceNode = this.audioContext.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.loop = true;

        // Broadband noise -> notch chain removing the tinnitus band
        const { input: notchIn, output: notchOut } = this.createNotchChain(frequency);
        sourceNode.connect(notchIn);

        if (modulationRate > 0) {
            const lfo = this.audioContext.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = modulationRate;

            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = 0.5;

            const baseGain = this.audioContext.createGain();
            baseGain.gain.value = 0.5;

            lfo.connect(lfoGain);
            lfoGain.connect(baseGain.gain);

            notchOut.connect(baseGain);
            baseGain.connect(masterGainNode);

            lfo.start();
            this.activeSounds.set('custom', { source: sourceNode, gainNode: masterGainNode, lfo: lfo });
        } else {
            notchOut.connect(masterGainNode);
            this.activeSounds.set('custom', { source: sourceNode, gainNode: masterGainNode });
        }

        sourceNode.start();
    }
};

