// src/utils/audioEngine.js

export const AudioEngine = {
    audioContext: null,
    activeSounds: new Map(), // Stores { source, gainNode } by soundId

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
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
    }
};

