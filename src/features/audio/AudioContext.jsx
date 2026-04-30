import { createContext, useContext, useState, useRef } from 'react';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  // Web Audio API ref
  const audioCtxRef = useRef(null);

  const togglePlay = () => {
    if (!audioCtxRef.current) {
      // Iniciar magia de sonido
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    
    if (isPlaying) {
      audioCtxRef.current.suspend();
    } else {
      audioCtxRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const changeVolume = (val) => {
    setVolume(val);
    // Aquí conectar nodo de ganancia (GainNode)
  };

  return (
    <AudioContext.Provider value={{ isPlaying, volume, togglePlay, changeVolume }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
