import React, { useState } from 'react';
import Reveal from '../components/Reveal';

export default function Contacto() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = (e) => {
    e.preventDefault();
    // Demo: aquí se integraría un endpoint de contacto en el backend.
    setSent(true);
  };

  return (
    <section className="section">
      <div className="container narrow">
        <Reveal><h1>Contacto</h1></Reveal>
        <Reveal delay={0.05}>
          <p className="section-lead">
            ¿Dudas, sugerencias o alianzas con clínicas? Escríbenos y te responderemos pronto.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {sent ? (
            <div className="alert-success">
              ¡Gracias! Hemos recibido tu mensaje (demo). Conecta este formulario a un endpoint del backend para recibirlo en producción.
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <label>
                Nombre
                <input name="name" value={form.name} onChange={onChange} required />
              </label>
              <label>
                Correo
                <input type="email" name="email" value={form.email} onChange={onChange} required />
              </label>
              <label>
                Mensaje
                <textarea name="message" rows="5" value={form.message} onChange={onChange} required />
              </label>
              <button type="submit" className="btn btn-primary">Enviar</button>
            </form>
          )}
        </Reveal>

        <Reveal delay={0.15}>
          <div className="contact-info">
            <p><strong>Correo:</strong> hola@tinnitoff.com</p>
            <p><strong>Soporte clínico:</strong> consulta a tu audiología de referencia.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
