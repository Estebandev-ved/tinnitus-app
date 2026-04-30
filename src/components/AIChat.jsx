import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ChevronLeft, ShieldCheck, Settings, Save, Play, Pause, Timer, XCircle } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { AzureService } from '../services/azureService';
import { AudioEngine } from '../utils/audioEngine';
import './AIChat.css';
import aiChatIllustration from '../assets/illustrations/ai_chat.png';

const SMART_RESPONSES = {
    greetings: [
        "¡Hola! 😊 ¿Cómo te encuentras hoy? Cuéntame, ¿cómo ha estado tu día?",
        "¡Hey! Qué gusto verte por aquí. ¿Cómo vas? ¿Qué tal tu día?",
        "¡Hola! Me alegra que estés aquí. ¿Cómo te sientes hoy? Cuéntame lo que quieras.",
        "¡Buenas! 👋 Estoy aquí para lo que necesites. ¿Cómo estás?",
        "¡Hola! ¿Qué tal todo? Cuéntame cómo te ha ido."
    ],
    casual: [
        "Me alegra saber eso. 😊 ¿Hay algo en lo que pueda ayudarte hoy, o simplemente quieres conversar?",
        "Qué bien. Estoy aquí para lo que necesites — ya sea hablar, desahogarte, o si tienes alguna duda sobre tu tinnitus.",
        "Genial. ¿Cómo te has sentido últimamente con tu zumbido? No te preocupes, sin prisa.",
        "¡Me alegro! Si en algún momento necesitas algo, solo dime. Estoy aquí para ti."
    ],
    sleep: [
        "Entiendo, la falta de sueño puede ser muy dura. ¿Hace cuánto que te cuesta dormir? El protocolo sugiere evitar pantallas 1 hora antes de dormir, eso podría ayudarte.",
        "Dormir poco puede hacer que el zumbido se sienta más intenso. Si quieres, puedo sugerirte una terapia de sonido suave para antes de acostarte. ¿Te gustaría probar?",
        "El sueño es clave para sentirse mejor. ¿Quieres que te recomiende algo que pueda ayudarte a relajarte antes de dormir?"
    ],
    stress: [
        "El estrés es complicado, y suele hacer que el zumbido se perciba más fuerte. ¿Quieres contarme más sobre lo que te tiene estresado/a?",
        "Cuando estamos estresados el tinnitus se nota más. Si quieres, puedo sugerirte algo para relajarte — o simplemente puedes hablarme de lo que te pasa.",
        "El estrés y el tinnitus van de la mano. ¿Te gustaría probar alguna técnica para bajar la tensión?"
    ],
    sounds: [
        "¡Claro! La terapia de sonido es muy efectiva. Para empezar, te sugiero 15 minutos de ruido blanco. (SOUND: white | 15)",
        "Los sonidos de enmascaramiento ayudan mucho. Prueba el sonido de lluvia, muchos pacientes lo prefieren. (SOUND: rain | 20)",
        "El ruido rosa tiene frecuencias más suaves — ideal para sesiones largas y para dormir. (SOUND: pink | 30)"
    ],
    breathing: [
        "¡Buena idea! La respiración diafragmática puede ayudar mucho. Ve a la sección 'Respirar' — la técnica 4-7-8 es muy efectiva.",
        "Respirar lento (6 respiraciones/min) activa el nervio vago, lo que ayuda a reducir la percepción del zumbido. Pruébalo 5 minutos.",
        "La respiración consciente es una herramienta muy rápida. Usa la guía de respiración de la app, te va a encantar."
    ],
    medications: [
        "Algunos medicamentos pueden afectar el tinnitus. Si has empezado algo nuevo, consulta con tu doctor para estar seguro/a.",
        "Es importante no automedicarse. Lo más efectivo según la evidencia es la combinación de terapia sonora y seguimiento profesional.",
        "Si tomas medicamentos, anótalo en tu Perfil Médico. Así podemos rastrear si hay alguna correlación con tu zumbido."
    ],
    hearing: [
        "El tinnitus y la audición suelen estar relacionados. Si notas cambios, te recomiendo consultar con un otorrinolaringólogo.",
        "Los audífonos modernos con generador de sonido pueden ayudar tanto con la audición como con el enmascaramiento del tinnitus.",
        "Proteger tus oídos de ruidos fuertes (>85 dB) es importante. ¿Usas protección en ambientes ruidosos?"
    ],
    anxiety: [
        "La ansiedad por el tinnitus es muy normal y tratable. El ciclo de ansiedad→atención→más percepción se puede romper. ¿Quieres que te cuente cómo?",
        "Cuando sientas ansiedad por el zumbido, recuerda: no es peligroso. Tu cerebro puede aprender a ignorarlo con el tiempo. ¿Cómo te sientes ahora?",
        "La habituación toma tiempo (3-12 meses promedio). Cada día que registras y usas la app, estás avanzando. No estás solo/a en esto."
    ],
    diet: [
        "Algunos pacientes sienten que la cafeína, el alcohol o la sal empeoran su tinnitus. ¿Has notado algo así?",
        "La hidratación es importante — la deshidratación puede afectar la presión en el oído interno. ¿Tomas suficiente agua?",
        "No hay una dieta mágica contra el tinnitus, pero una alimentación antiinflamatoria (omega-3, verduras) puede ayudar."
    ],
    general: [
        "Cuéntame más, estoy aquí para escucharte. ¿Hay algo específico que te preocupa hoy?",
        "Cada persona experimenta el tinnitus de forma diferente. ¿Cómo lo describes tú? Me interesa saber.",
        "Recuerda que los días buenos y malos son normales con el tinnitus. Lo importante es la tendencia a largo plazo. ¿Cómo te has sentido últimamente?",
        "Tu constancia registrando es clave. ¿Hay algo en particular que quieras preguntarme o hablar sobre ello?"
    ],
    danger: [
        "⚠️ Si sientes dolor agudo, pérdida súbita de audición, o mareos intensos, acude a urgencias inmediatamente. Estos síntomas requieren atención médica urgente."
    ]
};

const generateSmartResponse = (input) => {
    const lower = input.toLowerCase().trim();

    // Topic matching with variety (picks random from category)
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // 1. GREETINGS FIRST — Natural conversation before anything else
    const greetingWords = ['hola', 'hey', 'buenas', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches', 'qué tal', 'que tal', 'saludos', 'hi', 'hello', 'ey', 'holi'];
    if (greetingWords.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + ',') || lower.startsWith(g + '!')))
        return pick(SMART_RESPONSES.greetings);

    // 2. Casual / positive messages — keep the conversation going
    const casualWords = ['bien', 'genial', 'todo bien', 'normal', 'ahí vamos', 'ahi vamos', 'más o menos', 'mas o menos', 'regular', 'ok', 'gracias', 'vale', 'perfecto', 'claro', 'sí', 'si', 'no mucho', 'nada'];
    if (casualWords.some(c => lower === c || lower === c + '!' || lower === c + '.'))
        return pick(SMART_RESPONSES.casual);

    // 3. Emergency detection
    if (lower.includes('dolor') || lower.includes('urgencia') || lower.includes('sangr') || lower.includes('sordo'))
        return SMART_RESPONSES.danger[0];

    // 4. Specific topic matching — only when user brings up the topic
    if (lower.includes('dormir') || lower.includes('sueño') || lower.includes('noche') || lower.includes('insomni'))
        return pick(SMART_RESPONSES.sleep);

    if (lower.includes('estrés') || lower.includes('estres') || lower.includes('nervios') || lower.includes('tensión') || lower.includes('tension'))
        return pick(SMART_RESPONSES.stress);

    if (lower.includes('sonido') || lower.includes('ruido') || lower.includes('música') || lower.includes('escuchar') || lower.includes('enmascarar') || lower.includes('terapia'))
        return pick(SMART_RESPONSES.sounds);

    if (lower.includes('respirar') || lower.includes('respiración') || lower.includes('respiracion') || lower.includes('calmar'))
        return pick(SMART_RESPONSES.breathing);

    if (lower.includes('medicamento') || lower.includes('pastilla') || lower.includes('fármaco') || lower.includes('farmaco') || lower.includes('droga'))
        return pick(SMART_RESPONSES.medications);

    if (lower.includes('oído') || lower.includes('oido') || lower.includes('audición') || lower.includes('audicion') || lower.includes('sordera'))
        return pick(SMART_RESPONSES.hearing);

    if (lower.includes('ansiedad') || lower.includes('miedo') || lower.includes('preocup') || lower.includes('pánico') || lower.includes('panico'))
        return pick(SMART_RESPONSES.anxiety);

    if (lower.includes('comida') || lower.includes('dieta') || lower.includes('café') || lower.includes('cafe') || lower.includes('alcohol'))
        return pick(SMART_RESPONSES.diet);

    return pick(SMART_RESPONSES.general);
};

const AIChat = ({ onClose, tinnitusFrequency }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [contextData, setContextData] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // Azure Config State
    const [azureConfig, setAzureConfig] = useState({
        apiKey: '',
        endpoint: import.meta.env.VITE_AZURE_ENDPOINT || '',
        deployment: import.meta.env.VITE_AZURE_DEPLOYMENT || ''
    });

    // Therapy Session State
    const [activeSession, setActiveSession] = useState(null); // { soundId, duration, timeLeft, isRunning }

    const messagesEndRef = useRef(null);
    const { currentUser } = useAuth();

    // 1. Fetch Context + Chat History on Load
    useEffect(() => {
        const loadContext = async () => {
            if (currentUser) {
                try {
                    const [logs, streakData, medProfile, savedHistory, recentNotes] = await Promise.all([
                        FirestoreService.getWeeklyLogs(currentUser.uid),
                        FirestoreService.getStreak(currentUser.uid),
                        FirestoreService.getMedicalProfile(currentUser.uid),
                        FirestoreService.getChatHistory(currentUser.uid),
                        FirestoreService.getProgressNotes(currentUser.uid, 5) // Fetch last 5 notes
                    ]);

                    let ctx = { streakCount: streakData?.count || 0, medicalProfile: medProfile, recentNotes: recentNotes };

                    if (logs.length > 0) {
                        const avgStress = logs.reduce((acc, curr) => acc + curr.stressLevel, 0) / logs.length;
                        const avgTinnitus = logs.reduce((acc, curr) => acc + curr.tinnitusLevel, 0) / logs.length;
                        const avgSleep = logs.reduce((acc, curr) => acc + curr.sleepHours, 0) / logs.length;
                        ctx = { ...ctx, avgStress, avgTinnitus, avgSleep, lastLog: logs[0], totalLogs: logs.length };
                    }

                    // Add notes to context
                    ctx.recentNotes = recentNotes || [];

                    setContextData(ctx);

                    // Load previous chat history if exists
                    if (savedHistory && savedHistory.length > 0) {
                        const restored = savedHistory.map((msg, i) => ({
                            id: Date.now() - savedHistory.length + i,
                            sender: msg.sender,
                            text: msg.text,
                            timestamp: msg.timestamp
                        }));
                        // Add a "welcome back" message
                        restored.push({
                            id: Date.now(),
                            sender: 'bot',
                            text: '¡Hola de nuevo! 👋 Recuerdo nuestra conversación anterior. ¿En qué puedo ayudarte hoy?'
                        });
                        setMessages(restored);
                        return; // Skip default greeting since we restored history
                    }

                    // Personalized greeting (only if no history)
                    const greetParts = ['Hola, soy tu asistente clínico.'];
                    if (ctx.streakCount > 0) {
                        greetParts.push(`Llevas ${ctx.streakCount} día${ctx.streakCount === 1 ? '' : 's'} de racha. ¡Sigue así!`);
                    }
                    if (ctx.avgTinnitus !== undefined) {
                        greetParts.push(`Tu tinnitus promedio esta semana: ${Math.round(ctx.avgTinnitus)}/100.`);
                    }
                    if (medProfile?.ear) {
                        const earMap = { izquierdo: 'oído izquierdo', derecho: 'oído derecho', ambos: 'ambos oídos' };
                        greetParts.push(`Noto que tu tinnitus afecta ${earMap[medProfile.ear] || 'tu oído'}.`);
                    }
                    greetParts.push('¿En qué puedo ayudarte hoy?');
                    setMessages([{ id: 1, sender: 'bot', text: greetParts.join(' ') }]);

                } catch (e) {
                    console.error("Error loading chat context", e);
                    setMessages([{ id: 1, sender: 'bot', text: 'Hola, soy tu asistente clínico. ¿Cómo te sientes hoy?' }]);
                }
            } else {
                setMessages([{ id: 1, sender: 'bot', text: 'Hola, soy tu asistente clínico. Inicia sesión para obtener consejos personalizados.' }]);
            }
        };
        loadContext();
    }, [currentUser]);

    // 2. Load API Key from LocalStorage (endpoint & deployment are hardcoded)
    useEffect(() => {
        // Clear any stale config with wrong deployment
        const savedConfig = localStorage.getItem('tinnitus_azure_config');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            const corrected = {
                apiKey: parsed.apiKey || '',
                endpoint: import.meta.env.VITE_AZURE_ENDPOINT || parsed.endpoint || '',
                deployment: import.meta.env.VITE_AZURE_DEPLOYMENT || parsed.deployment || ''
            };
            localStorage.setItem('tinnitus_azure_config', JSON.stringify(corrected));
            setAzureConfig(corrected);
        }
    }, []);

    // 3. Timer Logic
    useEffect(() => {
        let interval;
        if (activeSession && activeSession.isRunning && activeSession.timeLeft > 0) {
            interval = setInterval(() => {
                setActiveSession(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
            }, 1000);
        } else if (activeSession?.timeLeft === 0) {
            AudioEngine.stop();
            setActiveSession(prev => ({ ...prev, isRunning: false }));
            setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "¡Sesión completada! 🎉 ¿Sentiste algún alivio en la intensidad del zumbido?" }]);
        }
        return () => clearInterval(interval);
    }, [activeSession]);

    // 4. Cleanup Audio on Unmount
    useEffect(() => {
        return () => AudioEngine.stop();
    }, []);

    const saveConfig = () => {
        // Always save with correct endpoint/deployment, user only changes apiKey
        const configToSave = {
            apiKey: azureConfig.apiKey,
            endpoint: 'https://esteb-mdiel2ip-swedencentral.cognitiveservices.azure.com/',
            deployment: 'gpt-5.2-chat'
        };
        localStorage.setItem('tinnitus_azure_config', JSON.stringify(configToSave));
        setAzureConfig(configToSave);
        setShowSettings(false);
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'bot',
            text: '¡Configuración actualizada! Ahora estoy conectado a tu cerebro de Azure AI. 🧠✨'
        }]);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const startSession = (soundId, minutes) => {
        AudioEngine.play(soundId);
        setActiveSession({
            soundId,
            duration: minutes * 60,
            timeLeft: minutes * 60,
            isRunning: true
        });
    };

    const stopSession = () => {
        AudioEngine.stop();
        setActiveSession(null);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Helper: save chat history to Firestore
    const persistMessages = async (updatedMessages) => {
        if (currentUser) {
            await FirestoreService.saveChatHistory(currentUser.uid, updatedMessages);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: inputText, timestamp: new Date().toISOString() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInputText('');
        setIsTyping(true);

        let botResponse;

        if (azureConfig.apiKey && azureConfig.endpoint && azureConfig.deployment) {
            try {
                // Pass full conversation history for memory
                const fullContext = { ...contextData, tinnitusFrequency };
                const aiResponse = await AzureService.sendMessage(userMsg.text, fullContext, azureConfig, messages);
                botResponse = { id: Date.now() + 1, sender: 'bot', text: aiResponse, timestamp: new Date().toISOString() };
            } catch (error) {
                console.error("Azure Error:", error);
                const fallback = generateSmartResponse(userMsg.text);
                botResponse = { id: Date.now() + 1, sender: 'bot', text: `📡 _Modo offline_ — ${fallback}`, timestamp: new Date().toISOString() };
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const responseText = generateSmartResponse(userMsg.text);
            botResponse = { id: Date.now() + 1, sender: 'bot', text: responseText, timestamp: new Date().toISOString() };
        }

        const finalMessages = [...updatedMessages, botResponse];
        setMessages(finalMessages);
        setIsTyping(false);

        // Save to Firestore for cross-session memory
        persistMessages(finalMessages);
    };

    // Render Message Helper with Therapy Card
    const renderMessageContent = (msg) => {
        // Regex to find (SOUND: id | mins)
        const soundMatch = msg.text.match(/\(SOUND:\s*(\w+)\s*\|\s*(\d+)\)/);

        if (soundMatch && msg.sender === 'bot') {
            const soundId = soundMatch[1];
            const minutes = parseInt(soundMatch[2]);
            const cleanText = msg.text.replace(soundMatch[0], "").trim();
            const soundName = {
                'rain': 'Lluvia Suave', 'white': 'Ruido Blanco', 'pink': 'Ruido Rosa',
                'ocean': 'Olas del Mar', 'fan': 'Ventilador', 'cafe': 'Café'
            }[soundId] || 'Sonido Relajante';

            return (
                <div>
                    <p style={{ margin: 0 }}>{cleanText}</p>
                    <div className="therapy-card animate-fade" style={{ marginTop: '12px', background: '#F2F2F7', padding: '12px', borderRadius: '12px', border: '1px solid #E5E5EA' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ background: '#007AFF', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                                <Timer size={18} color="white" />
                            </div>
                            <div>
                                <strong style={{ color: '#1C1C1E', display: 'block', fontSize: '14px' }}>Receta: {soundName}</strong>
                                <span style={{ fontSize: '12px', color: '#8E8E93' }}>Duración: {minutes} minutos</span>
                            </div>
                        </div>

                        {activeSession?.soundId === soundId && activeSession?.isRunning ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#34C759', color: 'white', padding: '10px 14px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(52, 199, 89, 0.3)' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', fontFamily: 'monospace' }}>
                                    {formatTime(activeSession.timeLeft)}
                                </span>
                                <button onClick={stopSession} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                                    <span style={{ marginRight: '6px', fontSize: '13px', fontWeight: 600 }}>Detener</span>
                                    <XCircle size={20} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => startSession(soundId, minutes)}
                                style={{
                                    width: '100%', background: '#007AFF', color: 'white', border: 'none',
                                    padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 600,
                                    boxShadow: '0 2px 5px rgba(0, 122, 255, 0.3)'
                                }}
                            >
                                <Play size={16} fill="white" /> Iniciar Sesión de Terapia
                            </button>
                        )}
                    </div>
                </div>
            );
        }
        return <div className="bubble-content">{msg.text}</div>;
    };

    return (
        <div className="chat-container animate-fade">
            <header className="chat-header">
                <button className="back-btn" onClick={onClose}>
                    <ChevronLeft />
                </button>
                <div className="bot-info">
                    <img src={aiChatIllustration} alt="" className="chat-avatar-illustration" />
                    <h3>Asistente Clínico</h3>
                    <div className="badge">
                        <ShieldCheck size={12} />
                        <span>{azureConfig.apiKey ? 'Modo: Azure AI 🧠' : 'Modo: Básico'}</span>
                    </div>
                </div>
                <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
                    <Settings size={20} />
                </button>
            </header>

            {showSettings && (
                <div className="settings-panel animate-fade">
                    <h4>⚙️ Configuración Azure AI</h4>
                    <p>Conecta tu modelo GPT-4o / GPT-5.2</p>

                    <label>Endpoint (URL)</label>
                    <input
                        type="text"
                        placeholder="https://tu-recurso.openai.azure.com/"
                        value={azureConfig.endpoint}
                        onChange={e => setAzureConfig({ ...azureConfig, endpoint: e.target.value })}
                    />

                    <label>API Key</label>
                    <input
                        type="password"
                        placeholder="Pegar llave aquí..."
                        value={azureConfig.apiKey}
                        onChange={e => setAzureConfig({ ...azureConfig, apiKey: e.target.value })}
                    />

                    <label>Nombre del Despliegue (Deployment)</label>
                    <input
                        type="text"
                        placeholder="ej: gpt-tinnitoff"
                        value={azureConfig.deployment}
                        onChange={e => setAzureConfig({ ...azureConfig, deployment: e.target.value })}
                    />

                    <button className="btn btn-primary full-width" onClick={saveConfig} style={{ marginTop: '10px' }}>
                        Guardar y Conectar <Save size={16} />
                    </button>
                </div>
            )}

            <div className="chat-messages">
                {messages.map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                        {msg.sender === 'bot' && <div className="bot-avatar"><Bot size={16} /></div>}
                        {msg.sender === 'bot' ? (
                            <div className="bubble-wrapper" style={{ maxWidth: '85%' }}>
                                <div className="bubble-content" style={{
                                    paddingRight: msg.text.includes('(SOUND:') ? '20px' : undefined,
                                    background: 'white',
                                    color: 'var(--text-main)',
                                    borderBottomLeftRadius: '4px'
                                }}>
                                    {renderMessageContent(msg)}
                                </div>
                            </div>
                        ) : (
                            <div className="bubble-content">{msg.text}</div>
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div className="message-bubble bot typing">
                        <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="chat-input-area">
                <input
                    type="text"
                    placeholder={azureConfig.apiKey ? "Pregunta a GPT... (Modo Avanzado)" : "Pide un consejo..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="send-btn" onClick={handleSend}>
                    <Send size={20} />
                </button>
            </footer>
        </div>
    );
};

export default AIChat;
