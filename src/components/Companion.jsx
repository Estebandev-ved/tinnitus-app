import { useId } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

// Lumi: luminous orb companion. Only transform/opacity are animated.
export const COMPANION_STATES = ['calm', 'listening', 'breathing', 'celebrating', 'resting'];

const LABEL_KEYS = {
  calm: 'companion_calm',
  listening: 'companion_listening',
  breathing: 'companion_breathing',
  celebrating: 'companion_celebrating',
  resting: 'companion_resting',
};

const INK = '#0F172A';
const MINT = '#6EC6A0';
const AMBER = '#FBBF24';
const CREAM = '#F1F5F9';
const stroke = { fill: 'none', stroke: INK, strokeWidth: 3, strokeLinecap: 'round' };
const center = { transformBox: 'fill-box', transformOrigin: 'center' };
const slow = { duration: 6, repeat: Infinity, ease: 'easeInOut' };

const Face = ({ state }) => {
  switch (state) {
    case 'listening':
      return (
        <>
          <circle cx="74" cy="116" r="6.5" fill={INK} />
          <circle cx="106" cy="116" r="6.5" fill={INK} />
          <circle cx="76" cy="114" r="2" fill={CREAM} />
          <circle cx="108" cy="114" r="2" fill={CREAM} />
          <ellipse cx="90" cy="132" rx="4" ry="3.5" fill={INK} />
        </>
      );
    case 'breathing':
      return (
        <>
          <path d="M68 116 Q74 123 80 116" {...stroke} />
          <path d="M100 116 Q106 123 112 116" {...stroke} />
          <ellipse cx="90" cy="131" rx="3.5" ry="2.5" fill={INK} />
        </>
      );
    case 'celebrating':
      return (
        <>
          <path d="M68 119 Q74 109 80 119" {...stroke} />
          <path d="M100 119 Q106 109 112 119" {...stroke} />
          <path d="M81 127 Q90 142 99 127Z" fill={INK} />
        </>
      );
    case 'resting':
      return (
        <g opacity=".8">
          <path d="M68 116 Q74 122 80 116" {...stroke} />
          <path d="M100 116 Q106 122 112 116" {...stroke} />
          <path d="M85 130 Q90 133 95 130" {...stroke} strokeWidth={2.5} />
        </g>
      );
    default:
      return (
        <>
          <circle cx="74" cy="116" r="4.5" fill={INK} />
          <circle cx="106" cy="116" r="4.5" fill={INK} />
          <path d="M83 129 Q90 135 97 129" {...stroke} />
        </>
      );
  }
};
Face.propTypes = { state: PropTypes.oneOf(COMPANION_STATES).isRequired };

const Extras = ({ state }) => {
  if (state === 'listening') {
    return (
      <>
        <path d="M152 94 Q162 112 152 130" {...stroke} stroke={MINT} opacity=".9" />
        <path d="M164 90 Q174 112 164 134" {...stroke} stroke={MINT} opacity=".55" />
      </>
    );
  }
  if (state === 'breathing') {
    return (
      <>
        <circle cx="90" cy="112" r="64" fill="none" stroke="#4A90D9" strokeWidth="2" opacity=".45" />
        <circle cx="90" cy="112" r="78" fill="none" stroke="#A78BFA" strokeWidth="2" opacity=".25" />
      </>
    );
  }
  if (state === 'celebrating') {
    return (
      <>
        <path d="M38 63 Q38 72 47 72 Q38 72 38 81 Q38 72 29 72 Q38 72 38 63Z" fill={AMBER} />
        <path d="M140 79 Q140 86 147 86 Q140 86 140 93 Q140 86 133 86 Q140 86 140 79Z" fill="#34D399" />
        <path d="M130 45 Q130 50 135 50 Q130 50 130 55 Q130 50 125 50 Q130 50 130 45Z" fill="#A78BFA" />
        <path d="M48 149 Q48 154 53 154 Q48 154 48 159 Q48 154 43 154 Q48 154 48 149Z" fill={AMBER} />
      </>
    );
  }
  if (state === 'resting') {
    return (
      <>
        <text x="132" y="68" fontFamily="Outfit,Inter,sans-serif" fontSize="20" fontWeight="600" fill="#94A3B8">z</text>
        <text x="146" y="50" fontFamily="Outfit,Inter,sans-serif" fontSize="14" fontWeight="600" fill="#94A3B8" opacity=".7">z</text>
      </>
    );
  }
  return null;
};
Extras.propTypes = { state: PropTypes.oneOf(COMPANION_STATES).isRequired };

const bodyMotion = (state, reduced) => {
  if (reduced) {
    // Static pose per state, no loops.
    const pose = { listening: { rotate: -6 }, breathing: { scale: 1.04 }, resting: { y: 4 } };
    return { animate: pose[state] ?? { y: 0 }, transition: { duration: 0 } };
  }
  switch (state) {
    case 'calm':
      return { animate: { y: [0, -4, 0] }, transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } };
    case 'listening':
      return { animate: { rotate: -6 }, transition: { duration: 0.3, ease: 'easeOut' } };
    case 'breathing':
      return { animate: { scale: [1, 1.04, 1] }, transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' } };
    case 'celebrating':
      return { animate: { y: [0, -6, 0] }, transition: { duration: 0.7, ease: 'easeOut' } };
    default:
      return { animate: { y: 4 }, transition: { duration: 0.4, ease: 'easeOut' } };
  }
};

const Companion = ({ state = 'calm', size = 160, className }) => {
  const reduced = useReducedMotion();
  const language = useLanguage();
  const gradId = `lumi-${useId().replace(/:/g, '')}`;
  const t = language?.t ?? ((k) => k);
  const label = t(LABEL_KEYS[state]);
  const { animate, transition } = bodyMotion(state, reduced);
  const resting = state === 'resting';
  const haloActive = !reduced && (state === 'calm' || state === 'breathing');
  const haloPeak = state === 'breathing' ? 1.08 : 1.05;

  return (
    <svg
      viewBox="0 0 180 180"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      data-state={state}
      data-reduced-motion={reduced ? 'true' : 'false'}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={gradId} cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor="#34D399" />
          <stop offset="1" stopColor="#4A90D9" />
        </radialGradient>
      </defs>
      <motion.g
        style={center}
        initial={false}
        animate={{ opacity: resting ? 0.72 : 1 }}
        transition={{ duration: reduced ? 0 : 0.3 }}
      >
        <motion.g
          style={center}
          animate={haloActive ? { scale: [1, haloPeak, 1], opacity: [0.9, 1, 0.9] } : { scale: 1, opacity: resting ? 0.6 : 1 }}
          transition={haloActive ? slow : { duration: reduced ? 0 : 0.3 }}
        >
          <circle cx="90" cy="112" r="70" fill={MINT} opacity=".16" />
          <circle cx="90" cy="112" r="58" fill={MINT} opacity=".18" />
        </motion.g>
        <motion.g style={center} animate={animate} transition={transition}>
          <circle cx="90" cy="112" r="48" fill={`url(#${gradId})`} />
          <path d="M90 64 Q86 46 96 36" {...stroke} stroke={MINT} />
          <circle cx="96" cy="34" r="5" fill={AMBER} />
          <ellipse cx="72" cy="90" rx="9" ry="5" fill={CREAM} opacity=".3" transform="rotate(-30 72 90)" />
          <motion.g
            key={state}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <Face state={state} />
          </motion.g>
        </motion.g>
        <motion.g
          key={`extras-${state}`}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Extras state={state} />
        </motion.g>
      </motion.g>
    </svg>
  );
};

Companion.propTypes = {
  state: PropTypes.oneOf(COMPANION_STATES),
  size: PropTypes.number,
  className: PropTypes.string,
};

export default Companion;
