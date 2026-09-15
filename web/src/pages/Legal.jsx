import React from 'react';
import { ShieldAlert, Lock, FileText } from 'lucide-react';
import Reveal from '../components/Reveal';

const CONTENT = {
  aviso: {
    icon: ShieldAlert,
    title: 'Aviso médico',
    lead: 'Tinnitoff es una herramienta de apoyo para convivir con el acúfeno. No es un dispositivo médico ni sustituye la valoración de un profesional de la salud.',
    updated: 'Última actualización: 2025',
    sections: [
      { h: 'No es un diagnóstico', p: 'La aplicación no diagnostica, trata ni cura el acúfeno ni ninguna otra condición. La terapia de hábituación y el seguimiento THI son complementarios al tratamiento que indique tu especialista.' },
      { h: 'Consulta a un profesional', p: 'Busca atención médica si el zumbido aparece de forma súbita, es unilateral, se acompaña de pérdida de audición, mareo, dolor o síntomas neurológicos. En caso de trauma o emergencia, acude de inmediato a un servicio de urgencias.' },
      { h: 'Uso de la terapia sonora', p: 'Los sonidos de enmascaramiento y la relajación son recomendaciones generales. Mantén siempre un volumen seguro y no los uses para enmascarar ruidos fuertes del entorno de forma prolongada.' },
      { h: 'Responsabilidad', p: 'El uso de Tinnitoff es bajo tu propia responsabilidad. No garantizamos resultados específicos: la percepción del acúfeno varía en cada persona y con el tiempo.' },
    ],
  },
  privacidad: {
    icon: Lock,
    title: 'Política de privacidad',
    lead: 'Te explicamos de forma clara qué datos recopilamos, para qué los usamos y cómo los protegemos.',
    updated: 'Última actualización: 2025',
    sections: [
      { h: 'Datos que recopilamos', p: 'Perfil básico (correo y nombre), registros diarios (sueño, estrés y nivel de zumbido), resultados del test THI, audiometrías, datos de dispositivo y, si lo usas, tu diario de voz.' },
      { h: 'Cómo los usamos', p: 'Para personalizar tu terapia sonora, mostrar tu evolución clínica, generar reportes y mejorar el servicio. El asistente de IA usa el contexto para orientarte, sin vender tu información.' },
      { h: 'Almacenamiento y seguridad', p: 'Tus datos se sincronizan con nuestro backend bajo credenciales y se transmiten cifrados. Aplicamos buenas prácticas de seguridad, aunque ningún sistema es infalible.' },
      { h: 'Con quién se comparten', p: 'No vendemos tus datos. La información solo se comparte con tu audiología o especialista si tú lo autorizas explícitamente desde la app.' },
      { h: 'Tus derechos', p: 'Puedes solicitar acceso, corrección o eliminación de tus datos escribiendo a hola@tinnitoff.com. Respondemos en los plazos legales aplicables.' },
      { h: 'Menores', p: 'La app está pensada para adolescentes y adultos. En menores, debe usarse con supervisión de un adulto y bajo indicación profesional.' },
    ],
  },
  terminos: {
    icon: FileText,
    title: 'Términos y condiciones',
    lead: 'Estas condiciones regulan el uso de Tinnitoff. Al utilizar la aplicación, aceptas lo aquí descrito.',
    updated: 'Última actualización: 2025',
    sections: [
      { h: 'Aceptación', p: 'Al registrarte o usar Tinnitoff confirmas que has leído y aceptas estos términos y la política de privacidad.' },
      { h: 'Uso permitido', p: 'El servicio es para uso personal y no comercial. No está permitido reverse engineering, ni el uso indebido de los contenidos o del asistente de IA.' },
      { h: 'Cuentas', p: 'Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad en tu cuenta.' },
      { h: 'Suscripciones', p: 'Las funciones de pago se activan según el plan contratado. Los precios mostrados en la web son demostrativos hasta la disponibilidad comercial.' },
      { h: 'Limitación de responsabilidad', p: 'Tinnitoff se ofrece "tal cual". En la medida permitida por la ley, no nos hacemos responsables de daños derivados del uso o la imposibilidad de uso.' },
      { h: 'Modificaciones', p: 'Podemos actualizar estos términos; la versión vigente se publicará siempre en esta misma sección.' },
      { h: 'Ley aplicable', p: 'Estos términos se rigen por la legislación aplicable en el domicilio del responsable del servicio.' },
    ],
  },
};

export default function LegalPage({ kind }) {
  const data = CONTENT[kind] || CONTENT.aviso;
  const Icon = data.icon;
  return (
    <section className="section">
      <div className="container narrow legal">
        <Reveal>
          <div className="legal-head">
            <span className="legal-icon"><Icon size={22} /></span>
            <h1>{data.title}</h1>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="section-lead">{data.lead}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="legal-updated">{data.updated}</p>
        </Reveal>
        {data.sections.map((s, i) => (
          <Reveal key={s.h} delay={Math.min(i * 0.06, 0.4)}>
            <div className="legal-section">
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
