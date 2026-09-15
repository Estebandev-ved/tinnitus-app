import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ChevronLeft, ShieldCheck, Settings, Save, Play, Pause, Timer, XCircle, Mic, Volume2, VolumeX, Wind, ClipboardList, AlertTriangle, Brain, WifiOff } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { AzureService } from '../services/azureService';
import { AudioEngine } from '../utils/audioEngine';
import './AIChat.css';

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

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // 1. Specific routing actions based on keywords
    if (lower.includes('medir') || lower.includes('matcher') || lower.includes('tono') || lower.includes('frecuencia') || lower.includes('hz') || lower.includes('audiometria') || lower.includes('calibrar')) {
        return "¡Excelente idea! Para medir tu tinnitus y ajustar la terapia sonora a tu zumbido exacto, podemos iniciar la herramienta de medición. (ACTION: matcher)";
    }

    if (lower.includes('respirar') || lower.includes('respiración') || lower.includes('respiracion') || lower.includes('calmar') || lower.includes('relajar') || lower.includes('estrés') || lower.includes('estres') || lower.includes('tensión') || lower.includes('tension')) {
        return "Para reducir el estrés, activar el sistema nervioso parasimpático y bajar la tensión auditiva, te recomiendo hacer una sesión de respiración diafragmática. (ACTION: breathing)";
    }

    if (lower.includes('registrar') || lower.includes('diario') || lower.includes('tracker') || lower.includes('síntomas') || lower.includes('sintomas') || lower.includes('hoy') || lower.includes('guardar')) {
        if (lower.includes('voz') || lower.includes('grabar') || lower.includes('audio') || lower.includes('hablar')) {
            return "Graba una nota de voz en tu diario clínico para hacer seguimiento de cómo te sientes hoy. (ACTION: voice_diary)";
        }
        return "Llevar un registro diario te ayuda a entender qué factores mejoran o empeoran tu acúfeno. Registremos tus síntomas de hoy. (ACTION: tracker)";
    }

    if (lower.includes('voz') || lower.includes('grabar') || lower.includes('audio') || lower.includes('hablar')) {
        return "Puedes grabar tus reflexiones y el nivel de tu tinnitus en audio usando tu diario de voz. (ACTION: voice_diary)";
    }

    if (lower.includes('crisis') || lower.includes('sos') || lower.includes('insoportable') || lower.includes('fuerte') || lower.includes('pánico') || lower.includes('panico') || lower.includes('molestia')) {
        return "Entiendo que el zumbido esté muy molesto y alto justo ahora. Mantén la calma, respira despacio y activemos la terapia acústica de rescate SOS de inmediato. (ACTION: rescue)";
    }

    // 2. GREETINGS FIRST — Natural conversation before anything else
    const greetingWords = ['hola', 'hey', 'buenas', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches', 'qué tal', 'que tal', 'saludos', 'hi', 'hello', 'ey', 'holi'];
    if (greetingWords.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + ',') || lower.startsWith(g + '!')))
        return pick(SMART_RESPONSES.greetings);

    // 3. Casual / positive messages — keep the conversation going
    const casualWords = ['bien', 'genial', 'todo bien', 'normal', 'ahí vamos', 'ahi vamos', 'más o menos', 'mas o menos', 'regular', 'ok', 'gracias', 'vale', 'perfecto', 'claro', 'sí', 'si', 'no mucho', 'nada'];
    if (casualWords.some(c => lower === c || lower === c + '!' || lower === c + '.'))
        return pick(SMART_RESPONSES.casual);

    // 4. Emergency detection
    if (lower.includes('dolor') || lower.includes('urgencia') || lower.includes('sangr') || lower.includes('sordo'))
        return SMART_RESPONSES.danger[0];

    // 5. Specific topic matching — only when user brings up the topic
    if (lower.includes('dormir') || lower.includes('sueño') || lower.includes('noche') || lower.includes('insomni'))
        return pick(SMART_RESPONSES.sleep);

    if (lower.includes('sonido') || lower.includes('ruido') || lower.includes('música') || lower.includes('escuchar') || lower.includes('enmascarar') || lower.includes('terapia'))
        return pick(SMART_RESPONSES.sounds);

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

const AIChat = ({ onClose, tinnitusFrequency, isDashboard = false, onNavigate }) => {
    const QUICK_CHIPS = [
        { label: "Medir Tinnitus", icon: Volume2, query: "Quiero medir mi tinnitus" },
        { label: "Relajarme / Respirar", icon: Wind, query: "Quiero relajarme con un ejercicio de respiración" },
        { label: "Registrar mis síntomas", icon: ClipboardList, query: "Quiero registrar cómo me siento hoy" },
        { label: "Crisis: Zumbido alto", icon: AlertTriangle, query: "Tengo una crisis de zumbido muy fuerte justo ahora" }
    ];

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [contextData, setContextData] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // Speech-to-Text and Text-to-Speech States
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);

    const recognitionRef = useRef(null);

    // Initialize speech recognition (STT)
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.lang = 'es-ES';
            rec.continuous = false;
            rec.interimResults = false;

            rec.onstart = () => setIsListening(true);
            rec.onend = () => setIsListening(false);
            rec.onerror = (e) => {
                console.error("Speech recognition error", e.error);
                setIsListening(false);
            };
            rec.onresult = (e) => {
                const text = e.results[0][0].transcript;
                if (text) {
                    setInputText(prev => prev + (prev ? ' ' : '') + text);
                }
            };
            recognitionRef.current = rec;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("El reconocimiento de voz no está soportado en este navegador.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
            recognitionRef.current.start();
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                return;
            }
            window.speechSynthesis.cancel();

            // Clean action tags for natural voice reading
            const cleanText = text
                .replace(/\(SOUND:\s*\w+\s*\|\s*\d+\)/gi, '')
                .replace(/\(ACTION:\s*\w+\)/gi, '')
                .trim();

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'es-ES';
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        }
    };

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
                        const welcomeBackText = '¡Hola de nuevo! 👋 Recuerdo nuestra conversación anterior. ¿En qué puedo ayudarte hoy?';
                        restored.push({
                            id: Date.now(),
                            sender: 'bot',
                            text: welcomeBackText
                        });
                        setMessages(restored);
                        if (autoSpeakEnabled) {
                            speakText(welcomeBackText);
                        }
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
                    const initialGreeting = greetParts.join(' ');
                    setMessages([{ id: 1, sender: 'bot', text: initialGreeting }]);
                    if (autoSpeakEnabled) {
                        speakText(initialGreeting);
                    }

                } catch (e) {
                    console.error("Error loading chat context", e);
                    const fallbackGreet = 'Hola, soy tu asistente clínico. ¿Cómo te sientes hoy?';
                    setMessages([{ id: 1, sender: 'bot', text: fallbackGreet }]);
                    if (autoSpeakEnabled) {
                        speakText(fallbackGreet);
                    }
                }
            } else {
                const anonGreet = 'Hola, soy tu asistente clínico. Inicia sesión para obtener consejos personalizados.';
                setMessages([{ id: 1, sender: 'bot', text: anonGreet }]);
                if (autoSpeakEnabled) {
                    speakText(anonGreet);
                }
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

    const handleSend = async (customText) => {
        const textToSend = typeof customText === 'string' ? customText : inputText;
        if (!textToSend.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: textToSend, timestamp: new Date().toISOString() };
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
                botResponse = { id: Date.now() + 1, sender: 'bot', text: `_Modo offline_ — ${fallback}`, timestamp: new Date().toISOString() };
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const responseText = generateSmartResponse(userMsg.text);
            botResponse = { id: Date.now() + 1, sender: 'bot', text: responseText, timestamp: new Date().toISOString() };
        }

        const finalMessages = [...updatedMessages, botResponse];
        setMessages(finalMessages);
        setIsTyping(false);

        // Read bot response out loud
        if (autoSpeakEnabled && botResponse) {
            speakText(botResponse.text);
        }

        // Save to Firestore for cross-session memory
        persistMessages(finalMessages);
    };

    // Render Message Helper with Therapy Card
    const renderMessageContent = (msg) => {
        // Regex to find (SOUND: id | mins)
        const soundMatch = msg.text.match(/\(SOUND:\s*(\w+)\s*\|\s*(\d+)\)/i);
        // Regex to find (ACTION: id)
        const actionMatch = msg.text.match(/\(ACTION:\s*(\w+)\)/i);

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
        } else if (actionMatch && msg.sender === 'bot') {
            const actionId = actionMatch[1];
            const cleanText = msg.text.replace(actionMatch[0], "").trim();

            let actionName = 'Abrir Herramienta';
            let actionDesc = 'Acceder a la sección seleccionada';
            let actionClass = 'senior-card-matcher';

            if (actionId === 'matcher') {
                actionName = 'Iniciar Medición de Tinnitus';
                actionDesc = 'Calibra la frecuencia exacta de tu zumbido.';
                actionClass = 'senior-card-matcher';
            } else if (actionId === 'breathing') {
                actionName = 'Ejercicio de Respiración';
                actionDesc = 'Sesión guiada para relajar la mente y reducir la tensión.';
                actionClass = 'senior-card-relax';
            } else if (actionId === 'tracker') {
                actionName = 'Registrar mis Síntomas';
                actionDesc = 'Anota tu nivel de zumbido, estrés y sueño de hoy.';
                actionClass = 'senior-card-tracker';
            } else if (actionId === 'rescue') {
                actionName = 'Activar Modo SOS de Emergencia';
                actionDesc = 'Enmascarador acústico rápido para calmar molestias fuertes.';
                actionClass = 'senior-card-sos';
            } else if (actionId === 'voice_diary') {
                actionName = 'Grabar en mi Diario de Voz';
                actionDesc = 'Graba una nota contándome cómo te sientes hoy.';
                actionClass = 'senior-card-therapy';
            }

            return (
                <div>
                    <p style={{ margin: 0 }}>{cleanText}</p>
                    <div className={`senior-action-card ${actionClass}`} style={{ marginTop: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            onClick={() => {
                                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                                setIsSpeaking(false);
                                if (onNavigate) {
                                    onNavigate(actionId);
                                } else {
                                    alert(`Navegar a: ${actionId}`);
                                }
                            }}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '15px',
                                fontWeight: 700,
                                padding: '12px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                background: actionId === 'rescue' ? 'linear-gradient(135deg, #FF3B30 0%, #FF2D55 100%)' : undefined,
                                border: actionId === 'rescue' ? 'none' : undefined,
                                boxShadow: actionId === 'rescue' ? '0 4px 12px rgba(255,59,48,0.3)' : undefined
                            }}
                        >
                            {actionName}
                        </button>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', textAlign: 'center' }}>
                            {actionDesc}
                        </span>
                    </div>
                </div>
            );
        }
        return <div className="bubble-content">{msg.text}</div>;
    };

    return (
        <div className={`chat-container animate-fade ${isDashboard ? 'dashboard-mode' : ''}`}>
            <header className="chat-header">
                {!isDashboard && (
                    <button className="back-btn" onClick={onClose}>
                        <ChevronLeft />
                    </button>
                )}
                <div className="bot-info">
                    <div className="chat-avatar-anim" aria-hidden="true">
                        <Bot size={19} strokeWidth={1.9} />
                        <span className="avatar-status-dot" />
                    </div>
                    <h3>Asistente Clínico</h3>
                    <div className="badge">
                        <ShieldCheck size={12} />
                        <span>{azureConfig.apiKey ? 'Modo: Azure AI' : 'Modo: Básico'}</span>
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    <button 
                        className="speech-toggle-btn" 
                        onClick={() => {
                            if (autoSpeakEnabled) {
                                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                                setIsSpeaking(false);
                            }
                            setAutoSpeakEnabled(!autoSpeakEnabled);
                        }}
                        style={{
                            background: 'none', border: 'none', color: autoSpeakEnabled ? 'var(--primary)' : 'var(--text-muted)',
                            marginRight: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title={autoSpeakEnabled ? "Lectura automática activada" : "Lectura automática desactivada"}
                    >
                        {autoSpeakEnabled ? <Volume2 size={22} className="icon-glow" style={{ filter: 'drop-shadow(0 0 4px var(--primary))' }} /> : <VolumeX size={22} />}
                    </button>
                    <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {showSettings && (
                <div className="settings-panel animate-fade">
                    <h4><Settings size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} /> Configuración Azure AI</h4>
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
                                    paddingRight: msg.text.includes('(SOUND:') || msg.text.includes('(ACTION:') ? '20px' : undefined,
                                    background: 'white',
                                    color: 'var(--text-main)',
                                    borderBottomLeftRadius: '4px'
                                }}>
                                    {renderMessageContent(msg)}
                                </div>
                                <button 
                                    onClick={() => speakText(msg.text)} 
                                    style={{
                                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                                        padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                        marginTop: '4px'
                                    }}
                                >
                                    <Volume2 size={12} />
                                    <span>Escuchar</span>
                                </button>
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

            <div className="chat-quick-chips">
                {QUICK_CHIPS.map((chip, idx) => {
                    const ChipIcon = chip.icon;
                    return (
                        <button
                            key={idx}
                            className="quick-chip press-effect"
                            onClick={() => handleSend(chip.query)}
                            style={{ padding: '12px 18px', fontSize: '14px', borderRadius: '20px' }}
                        >
                            <ChipIcon size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                            {chip.label}
                        </button>
                    );
                })}
            </div>

            <footer className="chat-input-area">
                <button 
                    className={`mic-btn ${isListening ? 'listening' : ''}`}
                    onClick={toggleListening}
                    style={{
                        background: isListening ? 'linear-gradient(135deg, #FF3B30 0%, #FF2D55 100%)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isListening ? 'white' : 'var(--text-main)',
                        marginRight: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isListening ? '0 0 15px rgba(255, 59, 48, 0.4)' : 'none',
                        flexShrink: 0
                    }}
                    title={isListening ? "Detener grabación" : "Hablar con la IA"}
                >
                    <Mic size={22} className={isListening ? 'icon-glow' : ''} />
                </button>
                <input
                    type="text"
                    placeholder={isListening ? "Escuchando tu voz..." : (azureConfig.apiKey ? "Pregunta a GPT... (Modo Avanzado)" : "Pide un consejo...")}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isListening}
                    style={{ fontSize: '16px', padding: '12px 16px' }}
                />
                <button className="send-btn" onClick={handleSend} style={{ flexShrink: 0 }}>
                    <Send size={20} />
                </button>
            </footer>
        </div>
    );
};

export default AIChat;
