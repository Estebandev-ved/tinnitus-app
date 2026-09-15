import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem('tt-cookies')) setOpen(true);
    } catch (_) { setOpen(true); }
  }, []);

  const accept = () => {
    try { localStorage.setItem('tt-cookies', 'accepted'); } catch (_) {}
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cookie-banner"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Cookie size={20} className="cookie-ico" />
          <p>Usamos cookies para mejorar tu experiencia y entender el uso de la web. Al continuar, aceptas nuestra política.</p>
          <div className="cookie-actions">
            <button className="btn btn-primary btn-small" onClick={accept}>Aceptar</button>
            <button className="cookie-close" onClick={() => setOpen(false)} aria-label="Cerrar"><X size={18} /></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
