// Crisis / emergency helplines by country.
//
// Verification policy (CMP-02): every entry carries `source` (exact official URL),
// `verifiedOn` (YYYY-MM-DD) and `status`:
//   'verified'    -> number, hours/cost and scope read on the official page.
//   'partial'     -> official page exists but could not be fully read (site blocks
//                    automated fetch) or one detail (scope/hours) is not stated
//                    officially; the caveat is in `review`.
//   'unconfirmed' -> not confirmed against an official source (only emergency
//                    numbers of US/GB); well-known, but a person must re-check.
// REVIEW (human): a person must re-validate every entry before each store release.
// Never add a number without an official source. `review` is internal (not shown).
const EMERGENCY = { es: 'Emergencias', en: 'Emergencies' };
const VERIFIED_ON = '2026-10-12';

export const CRISIS_COUNTRIES = {
  ES: {
    name: { es: 'España', en: 'Spain' },
    emergency: {
      number: '112',
      label: EMERGENCY,
      source: 'https://www.sanidad.gob.es/linea024/home.htm',
      status: 'verified',
      verifiedOn: VERIFIED_ON,
    },
    lines: [
      {
        number: '024',
        label: { es: 'Línea de atención a la conducta suicida', en: 'Suicide prevention line (Spanish)' },
        note: { es: 'Gratuita, 24 horas, en toda España.', en: 'Free, 24 hours, nationwide.' },
        source: 'https://www.sanidad.gob.es/linea024/home.htm',
        status: 'verified',
        verifiedOn: VERIFIED_ON,
      },
    ],
  },
  US: {
    name: { es: 'Estados Unidos', en: 'United States' },
    emergency: {
      number: '911',
      label: EMERGENCY,
      source: null,
      status: 'unconfirmed',
      verifiedOn: VERIFIED_ON,
      review: 'Official page not retrievable (fcc.gov 403, usa.gov 404). Re-check.',
    },
    lines: [
      {
        number: '988',
        label: { es: 'Línea 988 de Prevención del Suicidio y Crisis', en: '988 Suicide & Crisis Lifeline' },
        note: {
          es: 'Llamada, texto o chat, 24 horas. En español: llama y oprime 2, o envía "Ayuda" por texto.',
          en: 'Call, text or chat, 24/7, free. Spanish: press 2, or text "Ayuda".',
        },
        source:
          'https://988lifeline.org/faq/calling-the-988-lifeline/faq-is-the-988-lifeline-available-in-other-languages-for-non-english-speakers/',
        status: 'verified',
        verifiedOn: VERIFIED_ON,
      },
    ],
  },
  GB: {
    name: { es: 'Reino Unido', en: 'United Kingdom' },
    emergency: {
      number: '999',
      label: EMERGENCY,
      source: null,
      status: 'unconfirmed',
      verifiedOn: VERIFIED_ON,
      review: 'gov.uk guidance URL returned 404. Re-check.',
    },
    lines: [
      {
        number: '116123',
        display: '116 123',
        label: { es: 'Samaritans', en: 'Samaritans' },
        note: { es: 'Gratuita desde cualquier teléfono, 24 horas.', en: 'Free from any phone, 24 hours.' },
        source: 'https://www.samaritans.org/how-we-can-help/contact-samaritan/',
        status: 'verified',
        verifiedOn: VERIFIED_ON,
        review: 'Page does not state the support language (likely English); Welsh line 0808 164 0123 exists.',
      },
    ],
  },
  MX: {
    name: { es: 'México', en: 'Mexico' },
    emergency: {
      number: '911',
      label: EMERGENCY,
      source: 'https://www.gob.mx/911',
      status: 'verified',
      verifiedOn: VERIFIED_ON,
    },
    lines: [
      {
        number: '8009112000',
        display: '800 911 2000',
        label: { es: 'Línea de la Vida (CONASAMA)', en: 'Línea de la Vida (CONASAMA, Spanish)' },
        note: {
          es: 'Gratuita, 24 horas, los 365 días, desde celular o fijo.',
          en: 'Free, 24 hours, every day, Spanish-speaking.',
        },
        source: 'https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000',
        status: 'verified',
        verifiedOn: VERIFIED_ON,
      },
    ],
  },
  AR: {
    name: { es: 'Argentina', en: 'Argentina' },
    emergency: {
      number: '911',
      label: EMERGENCY,
      source: 'https://www.argentina.gob.ar/tema/emergencias',
      status: 'verified',
      verifiedOn: VERIFIED_ON,
    },
    lines: [
      {
        number: '08009990091',
        display: '0800 999 0091',
        label: { es: 'Línea de salud mental (Ministerio de Salud)', en: 'Mental health line (Ministry of Health)' },
        note: {
          es: 'Gratuita, confidencial, 24 horas, en todo el país.',
          en: 'Free, confidential, 24 hours, nationwide (Spanish).',
        },
        source: 'https://www.argentina.gob.ar/dispositivo-0800',
        status: 'verified',
        verifiedOn: VERIFIED_ON,
      },
      {
        number: '135',
        label: { es: 'Línea 135 de prevención del suicidio (CAS)', en: '135 suicide prevention line (Spanish)' },
        note: {
          es: 'Gratuita desde Buenos Aires y GBA; desde el resto del país usa el 0800 345 1435.',
          en: 'Free from Buenos Aires and Greater Buenos Aires only; elsewhere use 0800 345 1435.',
        },
        source: 'https://www.argentina.gob.ar/tema/emergencias',
        status: 'partial',
        verifiedOn: VERIFIED_ON,
        review:
          'Official page lists 135 but not its geographic scope. Scope (free from CABA/GBA) comes from the ' +
          'operator, Centro de Asistencia al Suicida (asistenciaalsuicida.org.ar), not a government page.',
      },
      {
        number: '08003451435',
        display: '0800 345 1435',
        label: { es: 'Centro de Asistencia al Suicida (resto del país)', en: 'Suicide assistance center (nationwide)' },
        note: { es: 'Gratuita desde todo el país.', en: 'Toll-free from anywhere in Argentina.' },
        source: 'https://www.asistenciaalsuicida.org.ar',
        status: 'partial',
        verifiedOn: VERIFIED_ON,
        review: "Read on the operator's own site (not a government page); hours not confirmed.",
      },
    ],
  },
  CL: {
    name: { es: 'Chile', en: 'Chile' },
    emergency: {
      number: '131',
      label: { es: 'Ambulancia (SAMU)', en: 'Ambulance (SAMU)' },
      source: 'https://www.minsal.cl/samu-instala-base-en-alto-hospicio-y-llama-a-utilizar-responsablemente-el-131/',
      status: 'partial',
      verifiedOn: VERIFIED_ON,
      review: 'minsal.cl blocks automated fetch (403); read via search extracts of Minsal pages. Re-check by hand.',
    },
    lines: [
      {
        number: '*4141',
        label: { es: 'Línea de prevención del suicidio (MINSAL)', en: 'Suicide prevention line (Spanish)' },
        note: { es: 'Gratuita, 24 horas, solo desde celular.', en: 'Free, 24 hours, from mobile phones only.' },
        source: 'https://www.minsal.cl/ministerio-de-salud-anuncio-fono-4141-de-prevencion-del-suicidio/',
        status: 'partial',
        verifiedOn: VERIFIED_ON,
        review: 'minsal.cl blocks automated fetch (403); details seen via search extracts of Minsal/gob.cl. Re-check by hand.',
      },
    ],
  },
  CO: {
    name: { es: 'Colombia', en: 'Colombia' },
    emergency: {
      number: '123',
      label: EMERGENCY,
      source: 'https://www.policia.gov.co',
      status: 'partial',
      verifiedOn: VERIFIED_ON,
      review: 'Listed as "Líneas de Emergencia" by Policía Nacional; "national" scope is inferred.',
    },
    lines: [
      {
        number: '106',
        label: { es: 'Línea 106 de salud mental (Minsalud)', en: '106 mental health line (Ministry of Health)' },
        note: {
          es: 'Gratuita, confidencial, 24 horas, desde fijo o celular.',
          en: 'Free, confidential, 24/7, from landline or mobile (Spanish).',
        },
        source: 'https://minsalud.gov.co/salud/publica/salud-mental/Paginas/linea-106.aspx',
        status: 'verified',
        verifiedOn: VERIFIED_ON,
        review: 'Page does not explicitly say "nacional" (it contrasts with local lines).',
      },
    ],
  },
  PE: {
    name: { es: 'Perú', en: 'Peru' },
    emergency: {
      number: '106',
      label: { es: 'Emergencias médicas (SAMU)', en: 'Medical emergencies (SAMU)' },
      source: 'https://www.gob.pe/547',
      status: 'partial',
      verifiedOn: VERIFIED_ON,
      review: 'gob.pe blocks automated fetch (418); seen via search extract; page is old. No single national number yet.',
    },
    lines: [
      {
        number: '113',
        label: { es: 'Línea 113, opción 5: salud mental (Minsa)', en: 'Line 113, option 5: mental health (Ministry of Health)' },
        note: {
          es: 'Gratuita, 24 horas. Marca 113 y elige la opción 5.',
          en: 'Free, 24 hours. Dial 113 and choose option 5 (Spanish).',
        },
        source: 'https://www.gob.pe/institucion/minsa/noticias/1332478-minsa-recuerda-que-la-linea-113-brinda-orientacion-y-apoyo-psicologico-gratuito-las-24-horas',
        status: 'partial',
        verifiedOn: VERIFIED_ON,
        review: 'gob.pe blocks automated fetch (418); seen via search extracts of gob.pe/Minsa news. Confirm menu option by calling.',
      },
    ],
  },
  UY: {
    name: { es: 'Uruguay', en: 'Uruguay' },
    emergency: {
      number: '911',
      label: EMERGENCY,
      source: 'https://www.gub.uy/tramites/sanciones-llamadas-maliciosas-servicio-emergencia',
      status: 'verified',
      verifiedOn: VERIFIED_ON,
    },
    lines: [
      {
        number: '08000767',
        display: '0800 0767',
        label: { es: 'Línea de prevención del suicidio (ASSE)', en: 'Suicide prevention line (ASSE, Spanish)' },
        note: {
          es: 'Gratuita, 24 horas, para usuarios públicos y privados. Desde celular: *0767.',
          en: 'Free, 24 hours, landline. From mobile: *0767.',
        },
        source: 'https://www.gub.uy/ministerio-salud-publica/comunicacion/noticias/msp-presento-datos-iniciativas-relacionadas-prevencion-suicidios',
        status: 'verified',
        verifiedOn: VERIFIED_ON,
      },
      {
        number: '*0767',
        label: { es: 'Línea de prevención del suicidio (celular)', en: 'Suicide prevention line (mobile)' },
        note: { es: 'Gratuita, 24 horas, desde celular.', en: 'Free, 24 hours, from mobile phones.' },
        source: 'https://www.gub.uy/ministerio-salud-publica/comunicacion/noticias/msp-presento-datos-iniciativas-relacionadas-prevencion-suicidios',
        status: 'verified',
        verifiedOn: VERIFIED_ON,
      },
    ],
  },
};

// Shown for every country: a directory of helplines worldwide (ThroughLine).
export const CRISIS_DIRECTORY = {
  label: { es: 'Directorio internacional de líneas de ayuda', en: 'International helpline directory' },
  url: 'https://findahelpline.com',
  source: 'https://findahelpline.com',
  status: 'verified',
  verifiedOn: VERIFIED_ON,
};

export const DEFAULT_COUNTRY = { es: 'ES', en: 'US' };

export const detectCountry = (locale, language) => {
  const match = /[-_]([A-Za-z]{2})\b/.exec(locale || '');
  const code = match ? match[1].toUpperCase() : null;
  if (code && CRISIS_COUNTRIES[code]) return code;
  return DEFAULT_COUNTRY[language] || 'US';
};
