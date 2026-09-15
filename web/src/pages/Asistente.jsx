import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { FirestoreService } from '../services/firestoreService';
import { AzureService } from '../services/azureService';
import Reveal from '../components/Reveal';
import { Send, Bot, User as UserIcon, Settings, Volume2, VolumeX, KeyRound, ShieldCheck, Loader2, Sparkles } from 'lucide-react';

const SMART_RESPONSES = {
  greetings: [
    '¡Hola! ¿Cómo te encuentras hoy? Cuéntame, ¿cómo ha estado tu día?',
    '¡Hey! Qué gusto verte por aquí. ¿Cómo vas? ¿Qué tal tu día?',
    '¡Hola! Me alegra que estés aquí. ¿Cómo te sientes hoy? Cuéntame lo que quieras.',
  ],
  casual: [
    'Me alegra saber eso. ¿Hay algo en lo que pueda ayudarte hoy, o simplemente quieres conversar?',
    'Qué bien. Estoy aquí para lo que necesites — hablar, desahogarte, o dudas sobre tu tinnitus.',
    'Genial. ¿Cómo te has sentido últimamente con tu zumbido? Sin prisa.',
  ],
  sleep: [
    'La falta de sueño puede ser muy dura. ¿Hace cuánto que te cuesta dormir? Evitar pantallas 1 hora antes suele ayudar.',
    'Dormir poco hace que el zumbido se perciba más intenso. ¿Quieres que te sugiera una terapia de sonido suave para antes de dormir?',
  ],
  stress: [
    'El estrés suele hacer que el zumbido se perciba más fuerte. ¿Quieres contarme qué te tiene estresado?',
    'Cuando estamos estresados el tinnitus se nota más. Puedo sugerirte algo para relajarte si quieres.',
  ],
  sounds: [
    'La terapia de sonido es muy efectiva. Para empezar, te sugiero 15 minutos de ruido blanco. (SOUND: white | 15)',
    'Los sonidos de enmascaramiento ayudan mucho. Prueba el sonido de lluvia. (SOUND: rain | 20)',
  ],
  breathing: [
    'La respiración diafragmática ayuda mucho. Ve a la sección "Respirar" de la app — la técnica 4-7-8 es muy efectiva. (ACTION: breathing)',
  ],
  anxiety: [
    'La ansiedad por el tinnitus es muy normal y tratable. El ciclo ansiedad→atención→más percepción se puede romper. ¿Quieres que te cuente cómo?',
    'Cuando sientas ansiedad, recuerda: no es peligroso. Tu cerebro puede aprender a ignorarlo con el tiempo.',
  ],
  general: [
    'Cuéntame más, estoy aquí para escucharte. ¿Hay algo específico que te preocupa hoy?',
    'Recuerda que los días buenos y malos son normales. Lo importante es la tendencia a largo plazo.',
  ],
  danger: [
    'Si sientes dolor agudo, pérdida súbita de audición o mareos intensos, acude a urgencias de inmediato.',
  ],
};

function generateSmartResponse(input) {
  const lower = input.toLowerCase().trim();
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (lower.includes('medir') || lower.includes('matcher') || lower.includes('tono') || lower.includes('frecuencia') || lower.includes('hz') || lower.includes('calibrar')) {
    return 'Para medir tu tinnitus y ajustar la terapia, puedes usar la herramienta de medición en la app. (ACTION: matcher)';
  }
  if (lower.includes('respirar') || lower.includes('respiración') || lower.includes('calmar') || lower.includes('relajar') || lower.includes('estrés') || lower.includes('tensión')) {
    return 'Para reducir el estrés, activar el sistema parasimpático y bajar la tensión, te recomiendo una sesión de respiración diafragmática. (ACTION: breathing)';
  }
  if (lower.includes('registrar') || lower.includes('diario') || lower.includes('síntomas') || lower.includes('sintomas') || lower.includes('hoy') || lower.includes('guardar')) {
    return 'Llevar un registro diario te ayuda a entender qué factores mejoran o empeoran tu acúfeno. (ACTION: tracker)';
  }
  if (lower.includes('crisis') || lower.includes('sos') || lower.includes('insoportable') || lower.includes('pánico') || lower.includes('panico')) {
    return 'Entiendo que el zumbido esté muy molesto ahora. Respira despacio y activa la terapia acústica de rescate en la app. (ACTION: rescue)';
  }
  const greetingWords = ['hola', 'hey', 'buenas', 'qué tal', 'que tal', 'saludos', 'hi', 'hello', 'holi'];
  if (greetingWords.some((g) => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + ',') || lower.startsWith(g + '!'))) return pick(SMART_RESPONSES.greetings);
  const casualWords = ['bien', 'genial', 'todo bien', 'normal', 'ahí vamos', 'mas o menos', 'regular', 'ok', 'gracias', 'vale', 'perfecto', 'claro', 'sí', 'si', 'no mucho', 'nada'];
  if (casualWords.some((c) => lower === c || lower === c + '!' || lower === c + '.')) return pick(SMART_RESPONSES.casual);
  if (lower.includes('dolor') || lower.includes('urgencia') || lower.includes('sangr') || lower.includes('sordo')) return SMART_RESPONSES.danger[0];
  if (lower.includes('dormir') || lower.includes('sueño') || lower.includes('noche') || lower.includes('insomni')) return pick(SMART_RESPONSES.sleep);
  if (lower.includes('sonido') || lower.includes('ruido') || lower.includes('música') || lower.includes('escuchar') || lower.includes('enmascarar') || lower.includes('terapia')) return pick(SMART_RESPONSES.sounds);
  if (lower.includes('ansiedad') || lower.includes('miedo') || lower.includes('preocup') || lower.includes('pánico') || lower.includes('panico')) return pick(SMART_RESPONSES.anxiety);
  return pick(SMART_RESPONSES.general);
}

const QUICK_CHIPS = [
  { label: 'Medir tinnitus', query: 'Quiero medir mi tinnitus' },
  { label: 'Relajarme', query: 'Quiero relajarme con un ejercicio de respiración' },
  { label: 'Registrar síntomas', query: 'Quiero registrar cómo me siento hoy' },
  { label: 'Crisis de zumbido', query: 'Tengo una crisis de zumbido muy fuerte' },
];

export default function Asistente() {
  const { currentUser } = useUserAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [config, setConfig] = useState({
    apiKey: '',
    endpoint: import.meta.env.VITE_AZURE_ENDPOINT || '',
    deployment: import.meta.env.VITE_AZURE_DEPLOYMENT || '',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [contextData, setContextData] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const endRef = useRef(null);

  const botMsg = (text) => ({ id: Date.now() + Math.random(), sender: 'bot', text, timestamp: new Date().toISOString() });

  useEffect(() => {
    const saved = localStorage.getItem('tinnitus_azure_config');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setConfig({ apiKey: p.apiKey || '', endpoint: import.meta.env.VITE_AZURE_ENDPOINT || '', deployment: import.meta.env.VITE_AZURE_DEPLOYMENT || '' });
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => { loadContext(); /* eslint-disable-next-line */ }, [currentUser]);

  async function loadContext() {
    if (!currentUser) {
      setMessages([botMsg('Hola, soy tu asistente clínico. Inicia sesión para obtener consejos personalizados.')]);
      return;
    }
    try {
      const [logs, streakData, medProfile, savedHistory, recentNotes] = await Promise.all([
        FirestoreService.getWeeklyLogs(currentUser.uid),
        FirestoreService.getStreak(currentUser.uid),
        FirestoreService.getMedicalProfile(currentUser.uid),
        FirestoreService.getChatHistory(currentUser.uid),
        FirestoreService.getProgressNotes(currentUser.uid, 5),
      ]);
      let ctx = { streakCount: streakData?.count || 0, medicalProfile: medProfile, recentNotes };
      if (logs.length) {
        const avg = (k) => logs.reduce((a, c) => a + (c[k] || 0), 0) / logs.length;
        ctx = { ...ctx, avgStress: avg('stressLevel'), avgTinnitus: avg('tinnitusLevel'), avgSleep: avg('sleepHours'), totalLogs: logs.length };
      }
      setContextData(ctx);

      if (savedHistory.length) {
        setMessages([
          ...savedHistory.map((m, i) => ({ id: Date.now() - savedHistory.length + i, sender: m.sender, text: m.text, timestamp: m.timestamp })),
          botMsg('¡Hola de nuevo! Recuerdo nuestra conversación anterior. ¿En qué puedo ayudarte hoy?'),
        ]);
        return;
      }
      const parts = ['Hola, soy tu asistente clínico.'];
      if (ctx.streakCount) parts.push(`Llevas ${ctx.streakCount} día${ctx.streakCount === 1 ? '' : 's'} de racha. ¡Sigue así!`);
      if (ctx.avgTinnitus !== undefined) parts.push(`Tu zumbido promedio esta semana: ${Math.round(ctx.avgTinnitus)}/100.`);
      parts.push('¿En qué puedo ayudarte hoy?');
      setMessages([botMsg(parts.join(' '))]);
    } catch {
      setMessages([botMsg('Hola, soy tu asistente clínico. ¿Cómo te sientes hoy?')]);
    }
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    const clean = text.replace(/\(SOUND:\s*\w+\s*\|\s*\d+\)/gi, '').replace(/\(ACTION:\s*\w+\)/gi, '').trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'es-ES';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function saveConfig() {
    const toSave = { apiKey: config.apiKey, endpoint: import.meta.env.VITE_AZURE_ENDPOINT || '', deployment: import.meta.env.VITE_AZURE_DEPLOYMENT || '' };
    localStorage.setItem('tinnitus_azure_config', JSON.stringify(toSave));
    setConfig(toSave);
    setShowSettings(false);
    setMessages((m) => [...m, botMsg('¡Configuración actualizada! Ahora estoy conectado a Azure AI.')]);
  }

  async function send(custom) {
    const text = typeof custom === 'string' ? custom : input;
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text, timestamp: new Date().toISOString() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsTyping(true);

    let reply;
    if (config.apiKey && config.endpoint && config.deployment) {
      try {
        reply = await AzureService.sendMessage(text, contextData, config, updated);
      } catch {
        reply = `_Modo offline_ — ${generateSmartResponse(text)}`;
      }
    } else {
      await new Promise((r) => setTimeout(r, 700));
      reply = generateSmartResponse(text);
    }

    const botReply = botMsg(reply);
    const finalMsgs = [...updated, botReply];
    setMessages(finalMsgs);
    setIsTyping(false);
    if (autoSpeak) speak(reply);
    if (currentUser) FirestoreService.saveChatHistory(currentUser.uid, finalMsgs);
  }

  return (
    <section className="section">
      <div className="container narrow">
        <Reveal>
          <div className="assistant-head">
            <span className="assistant-avatar"><Bot size={22} /></span>
            <div>
              <h1>Asistente clínico</h1>
              <p className="assistant-sub">
                <ShieldCheck size={13} /> {config.apiKey ? 'Conectado a Azure AI' : 'Modo básico (conocimiento general)'}
              </p>
            </div>
            <button className="assistant-settings" onClick={() => setShowSettings((s) => !s)} aria-label="Configuración">
              <Settings size={20} />
            </button>
          </div>
        </Reveal>

        {showSettings && (
          <Reveal>
            <div className="assistant-settings-panel">
              <h4><KeyRound size={15} /> Conectar Azure OpenAI</h4>
              <p className="muted">Pega tu API key. El endpoint y despliegue ya vienen configurados.</p>
              <label className="field">
                <span className="field-label">API Key</span>
                <input type="password" value={config.apiKey} onChange={(e) => setConfig({ ...config, apiKey: e.target.value })} placeholder="Pegar llave aquí…" />
              </label>
              <button className="btn btn-primary btn-sm" onClick={saveConfig}>Guardar y conectar</button>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.05}>
          <div className="assistant-box">
            <div className="assistant-messages">
              {messages.map((m) => (
                <div key={m.id} className={`msg ${m.sender}`}>
                  {m.sender === 'bot' && <span className="msg-avatar"><Bot size={15} /></span>}
                  <div className="msg-bubble">
                    {m.text.replace(/\(SOUND:\s*\w+\s*\|\s*\d+\)/gi, '').replace(/\(ACTION:\s*\w+\)/gi, '')}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="msg bot typing">
                  <span className="msg-avatar"><Bot size={15} /></span>
                  <div className="msg-bubble"><span className="dot" /><span className="dot" /><span className="dot" /></div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="assistant-chips">
              {QUICK_CHIPS.map((c) => (
                <button key={c.label} className="quick-chip" onClick={() => send(c.query)}>
                  <Sparkles size={13} /> {c.label}
                </button>
              ))}
            </div>

            <div className="assistant-input">
              <button
                className={`icon-btn ${autoSpeak ? 'on' : ''}`}
                onClick={() => { if (autoSpeak && 'speechSynthesis' in window) window.speechSynthesis.cancel(); setAutoSpeak((a) => !a); }}
                aria-label="Leer respuestas en voz alta"
              >
                {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Escribe tu mensaje…"
              />
              <button className="icon-btn send" onClick={() => send()} aria-label="Enviar">
                <Send size={18} />
              </button>
            </div>
          </div>
        </Reveal>

        {!currentUser && (
          <p className="assistant-note">
            <a onClick={() => navigate('/ingresar')}>Inicia sesión</a> para que el asistente recuerde tu historial y use tus datos de progreso.
          </p>
        )}
      </div>
    </section>
  );
}
