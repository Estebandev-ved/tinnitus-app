import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, Globe, Mail, MessageCircle, Send, Rss, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="brand">
            <span className="brand-mark" aria-hidden="true"><Waves size={18} /></span>
            <span className="brand-name">Tinnitoff</span>
          </div>
          <p className="footer-tagline">Alivio del acúfeno mediante terapia sonora personalizada y seguimiento clínico.</p>
          <div className="footer-social">
            <a href="#" aria-label="Sitio web"><Globe size={18} /></a>
            <a href="mailto:hola@tinnitoff.com" aria-label="Correo"><Mail size={18} /></a>
            <a href="#" aria-label="Chat"><MessageCircle size={18} /></a>
            <a href="#" aria-label="Newsletter"><Send size={18} /></a>
            <a href="#" aria-label="Blog"><Rss size={18} /></a>
            <a href="#" aria-label="Compartir"><Share2 size={18} /></a>
          </div>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Producto</h4>
            <Link to="/descargas">Descargas</Link>
            <Link to="/faq">Preguntas frecuentes</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link to="/aviso-medico">Aviso médico</Link>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/terminos">Términos</Link>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Tinnitoff. Herramienta de apoyo, no sustituye atención médica profesional.</span>
      </div>
    </footer>
  );
}
