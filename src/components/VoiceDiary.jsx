import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, X, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import './VoiceDiary.css';

const AI_RESPONSES = [
  "Te escucho. Es normal sentirse así cuando el zumbido aumenta. Respira profundo conmigo.",
  "Entiendo. Recuerda que este pico es temporal y pasará pronto.",
  "Registré lo que dices. Tu historial muestra que relajar la mandíbula te ha ayudado antes.",
  "Gracias por compartirlo. Eres muy fuerte al manejar esto. Vamos a probar un poco de ruido rosa a ver si atenúa la molestia."
];

const VoiceDiary = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [appState, setAppState] = useState('idle'); // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState('');
  const [aiText, setAiText] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = window.speechSynthesis;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';
      
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
    }
    
    return () => {
      recognitionRef.current?.stop();
      synthRef?.cancel();
    };
  }, []);

  const toggleRecording = () => {
    if (appState === 'listening') {
      recognitionRef.current?.stop();
      setAppState('thinking');
      processAiResponse(transcript);
    } else {
      synthRef?.cancel();
      setTranscript('');
      setAiText('');
      setAppState('listening');
      recognitionRef.current?.start();
    }
  };

  const processAiResponse = (userText) => {
    // Simular un request al backend (ej. Claude/GPT) y luego locutar la respuesta
    setTimeout(() => {
      const responseText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      setAiText(responseText);
      setAppState('speaking');
      speak(responseText);

      // Guardar en log (opcional, como pedía en VoiceDiary originalmente)
      if (currentUser && userText) {
        FirestoreService.saveVoiceDiaryEntry(currentUser.uid, {
          transcript: userText,
          aiResponse: responseText,
          createdAt: new Date()
        }).catch(()=>{});
      }
    }, 1500);
  };

  const speak = (text) => {
    if (!synthRef) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.pitch = 1.1; // Voz suave y empática
    utterance.rate = 0.95;
    
    utterance.onend = () => {
      setAppState('idle');
    };
    
    synthRef.speak(utterance);
  };

  return (
    <div className="voice-chat-wrapper animate-fade">
      <div className="voice-chat-container">
        
        <header className="vc-header">
          <h2>TinnitOff AI</h2>
          <button onClick={onClose} className="vc-close-btn"><X size={20}/></button>
        </header>

        <div className="vc-content">
          
          {/* Avatar Animado IA */}
          <div className={`avatar-container state-${appState}`}>
            <div className="aura-ring ring-1"></div>
            <div className="aura-ring ring-2"></div>
            <div className="aura-ring ring-3"></div>
            <div className="ai-core">
               {appState === 'thinking' ? <Activity className="spinner" size={40} color="#fff" /> : 'IA'}
            </div>
          </div>

          <div className="vc-status">
            {appState === 'idle' && 'Toca el micrófono para hablar...'}
            {appState === 'listening' && 'Escuchando...'}
            {appState === 'thinking' && 'Analizando y buscando la mejor sugerencia...'}
            {appState === 'speaking' && 'Hablando...'}
          </div>

          {/* Subtítulos */}
          <div className="subtitles-box">
            {appState === 'speaking' || aiText ? (
              <p className="ai-text"><strong>IA:</strong> {aiText}</p>
            ) : null}
            
            {(appState === 'listening' || appState === 'thinking' || transcript) ? (
              <p className="user-text"><strong>Tú:</strong> {transcript || '...'}</p>
            ) : null}
          </div>

        </div>

        <div className="vc-footer">
          <button 
            className={`vc-record-btn state-${appState}`} 
            onClick={toggleRecording}
            disabled={appState === 'thinking' || appState === 'speaking'}
          >
            {appState === 'listening' ? <Square size={28} /> : <Mic size={28} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VoiceDiary;
