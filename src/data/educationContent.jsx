
import { BookOpen, Moon, Shield, Brain } from 'lucide-react';

export const EDUCATION_CONTENT = [
    {
        id: 'cbt-1',
        category: 'Básicos',
        title: '¿Qué es el Tinnitus?',
        icon: <Brain />,
        readTime: '2 min',
        content: `
            <h3>No estás solo</h3>
            <p>El tinnitus es la percepción de sonido cuando no hay ruido externo presente. No es una enfermedad, sino un síntoma de que tu sistema auditivo está trabajando extra.</p>
            
            <h3>El ciclo vicioso</h3>
            <p>Tu cerebro detecta el sonido -> Te da ansiedad ("¿Esto es malo?") -> Tu cerebro le pone MÁS atención -> El sonido parece más fuerte.</p>
            
            <p><strong>El objetivo:</strong> Romper este ciclo. No "curar" el sonido, sino enseñarle a tu cerebro a ignorarlo (habituación).</p>
        `
    },
    {
        id: 'sleep-1',
        category: 'Sueño',
        title: 'Higiene del Sueño',
        icon: <Moon />,
        readTime: '3 min',
        content: `
            <h3>Dormir con Zumbido</h3>
            <p>El silencio absoluto es el enemigo del tinnitus. Cuando quitas el ruido ambiental, tu cerebro sube el "volumen" interno.</p>
            
            <h3>Estrategias Clave:</h3>
            <ul>
                <li><strong>Enmascaramiento:</strong> Usa sonidos de lluvia o ruido blanco a un volumen justo por debajo de tu tinnitus.</li>
                <li><strong>Rutina:</strong> Acuéstate y levántate a la misma hora.</li>
                <li><strong>Evita Pantallas:</strong> La luz azul suprime la melatonina.</li>
            </ul>
        `
    },
    {
        id: 'anxiety-1',
        category: 'Ansiedad',
        title: 'Respiración Profunda',
        icon: <Shield />,
        readTime: '1 min',
        content: `
            <h3>Técnica 4-7-8</h3>
            <p>Cuando sientas que el zumbido te abruma, tu sistema nervioso está en modo "luchar o huir".</p>
            
            <ol>
                <li>Inhala por la nariz en <strong>4 segundos</strong>.</li>
                <li>Sostén el aire <strong>7 segundos</strong>.</li>
                <li>Exhala por la boca en <strong>8 segundos</strong> (haciendo un sonido suave).</li>
            </ol>
            
            <p>Repite esto 4 veces. Calmará tu ritmo cardíaco y reducirá la percepción del sonido.</p>
        `
    }
];
