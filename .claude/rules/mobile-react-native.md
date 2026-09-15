# Reglas para el Frontend – React + Vite (TinnitOff)

## Contexto

El frontend de TinnitOff es una **Progressive Web App (PWA) / App móvil híbrida** construida con
**React 19 + Vite 7 + Capacitor 8**. Se ejecuta tanto en navegador web como en dispositivos
Android/iOS a través de Capacitor.

> **Nota**: El proyecto usa **React** (no React Native). La carpeta `src/` contiene toda la lógica frontend.
> La carpeta `android/` es el proyecto nativo generado por Capacitor.

---

## 1. Estructura de Carpetas

```
src/
├── App.jsx              # Componente raíz, rutas principales
├── App.css              # Estilos globales de la app
├── index.css            # Reset CSS y variables de diseño
├── main.jsx             # Entry point de React
├── firebase.js          # Configuración de Firebase
├── assets/              # Imágenes, íconos, fuentes estáticas
├── components/          # Componentes UI reutilizables
├── config/              # Configuración de la app (URLs, constantes)
├── contexts/            # Context API (AuthContext, ThemeContext, etc.)
├── data/                # Datos estáticos (sonidos, ejercicios, contenido educativo)
├── features/            # Módulos de funcionalidad completa
├── lib/                 # Librerías y utilidades de terceros configuradas
├── services/            # Servicios de API, Firebase, Azure AI
├── tests/               # Tests con Vitest + Testing Library
├── ui/                  # Componentes de UI base (Button, Modal, Input, etc.)
└── utils/               # Funciones utilitarias puras
```

---

## 2. Convenciones de Componentes React

### Estructura de un Componente
```jsx
// ✅ CORRECTO
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import styles from './NombreComponente.module.css'; // o clases CSS globales

const NombreComponente = ({ propA, propB, onAction }) => {
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    // efecto
  }, [propA]);

  const handleAction = () => {
    onAction(estado);
  };

  return (
    <div className="nombre-componente">
      {/* JSX */}
    </div>
  );
};

NombreComponente.propTypes = {
  propA: PropTypes.string.isRequired,
  propB: PropTypes.number,
  onAction: PropTypes.func.isRequired,
};

NombreComponente.defaultProps = {
  propB: 0,
};

export default NombreComponente;
```

### Reglas de Componentes
- **Siempre** definir `PropTypes` para todos los props
- Un componente = un archivo = una responsabilidad
- Componentes en `components/` → reutilizables entre features
- Componentes en `features/` → específicos de un módulo
- Componentes en `ui/` → primitivos de diseño (Button, Card, Modal)
- Preferir componentes funcionales con Hooks (sin class components)
- Máximo ~200 líneas por componente; extraer sub-componentes si crece

---

## 3. Gestión de Estado

### Cuándo usar qué
| Caso | Solución |
|---|---|
| Estado local del componente | `useState` |
| Efectos secundarios | `useEffect` |
| Estado derivado complejo | `useReducer` |
| Estado global (auth, tema, idioma) | `Context API` + `useContext` |
| Cache de datos remotos | Servicios + estado local o Context |
| Estado de formularios | Estado local controlado |

### Contexts Existentes
- `AuthContext` – Usuario autenticado, token JWT
- `ThemeContext` – Modo oscuro/claro
- `LanguageContext` – Idioma (español/inglés)

### Reglas de Context
- Crear un hook personalizado para cada Context: `useAuth()`, `useTheme()`, `useLang()`
- **Nunca** acceder directamente a `useContext(MiContext)` fuera de su hook
- Separar contextos: uno por dominio de responsabilidad

---

## 4. Servicios y API

### Comunicación con el Backend
Los servicios en `src/services/` manejan toda la comunicación externa:

```js
// src/services/tinnitusLogService.js
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const tinnitusLogService = {
  async createLog(logData, token) {
    const response = await fetch(`${API_BASE}/api/v1/tinnitus-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(logData),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};
```

### Firebase
- Autenticación: usar `firebase/auth` del SDK de Firebase
- Firestore: usar solo para datos en tiempo real o cuando el backend no aplica
- **Preferir el backend Spring Boot** para datos de salud persistentes
- Configuración en `src/firebase.js` (ya configurado)

### Variables de Entorno
- Todas las variables públicas deben empezar con `VITE_`
- **Nunca** poner claves secretas en variables `VITE_*` (son visibles en el bundle)
- Acceder con: `import.meta.env.VITE_NOMBRE_VARIABLE`

---

## 5. Estilo y CSS

### Sistema de Diseño
El diseño de TinnitOff usa CSS personalizado con variables en `src/index.css`:

```css
/* Variables de color del tema */
:root {
  --color-primary: /* color principal */;
  --color-bg: /* fondo */;
  --color-text: /* texto */;
  /* etc. */
}
```

### Reglas de CSS
- Usar las variables CSS definidas en `index.css` para colores, espaciado y tipografía
- Para animaciones complejas, usar **Framer Motion** (ya instalado)
- Para animaciones simples, usar CSS transitions/animations
- Evitar estilos inline salvo para valores dinámicos calculados en JS
- Nombres de clases CSS en **kebab-case**: `.daily-tracking-card`, `.sound-player`
- El modo oscuro se gestiona con variables CSS que cambian según el tema

### Diseño Responsive
- Mobile-first: diseñar primero para pantalla pequeña (~375px)
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`
- La app también corre en dispositivos móviles via Capacitor – probar en tamaños reales

---

## 6. Audio y Web Audio API

El módulo de terapia de sonido usa la **Web Audio API**:
- Crear el `AudioContext` solo después de una interacción del usuario (política del navegador)
- Usar `React Three Fiber` / `Three.js` para el audio espacial 3D
- Suspender el `AudioContext` cuando la app va a segundo plano (Capacitor App lifecycle)
- Limpiar los nodos de audio en el `useEffect` cleanup

---

## 7. Capacitor (App Móvil)

### Uso de Plugins Nativos
Los plugins nativos disponibles:
- `@capacitor/app` – Ciclo de vida de la app
- `@capacitor/haptics` – Vibraciones táctiles
- `@capacitor/local-notifications` – Notificaciones push locales
- `@capacitor/splash-screen` – Pantalla de carga
- `@capacitor/status-bar` – Barra de estado

```js
// Siempre verificar disponibilidad antes de usar
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const vibrate = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // No disponible en web, ignorar silenciosamente
  }
};
```

### Build para Android
```bash
npm run build          # Primero hacer build web
npx cap sync android   # Sincronizar con proyecto Android
npx cap open android   # Abrir en Android Studio
```

---

## 8. Módulos Funcionales

### DashboardHome
- Componente principal del dashboard
- Ubicación: `src/components/DashboardHome.jsx`
- Muestra resumen de síntomas, racha actual y accesos rápidos

### GuidedDailySession
- Componente de sesión de seguimiento diario guiado
- Ubicación: `src/components/GuidedDailySession.jsx`
- Flujo de pasos: síntomas → triggers → estado de ánimo → reflexión

### Frecuency Matching (Audiometría)
- Usa Web Audio API para generar tonos puros
- Permite al usuario identificar la frecuencia de su tinnitus
- Manejo cuidadoso del volumen para no dañar la audición

---

## 9. Testing

### Configuración
- Framework: **Vitest** + **@testing-library/react**
- Ejecutar: `npm run test` (modo watch) o `npm run test:run` (una vez)
- Archivos de test en `src/tests/` o colocados junto al componente como `*.test.jsx`

### Qué Testear
- Lógica de negocio en hooks y utilidades (prioridad alta)
- Comportamiento de componentes críticos (DashboardHome, GuidedDailySession)
- Servicios de API (con mocks de fetch)

### Ejemplo
```jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DashboardHome from '../components/DashboardHome';

describe('DashboardHome', () => {
  it('muestra el saludo al usuario', () => {
    render(<DashboardHome user={{ name: 'Ana' }} />);
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
  });
});
```

---

## 10. Performance

- Usar `React.lazy` + `Suspense` para code splitting de rutas/módulos grandes
- Los modelos de face-api.js deben cargarse de forma lazy (son pesados)
- Optimizar imágenes: usar WebP cuando sea posible
- El bundle de Three.js es grande; cargarlo solo en las vistas que lo necesiten
- Memoizar con `useMemo` y `useCallback` solo cuando el profiler lo justifique

---

## 11. Accesibilidad

- Todos los elementos interactivos deben tener `aria-label` descriptivos
- Las señales de audio siempre deben tener alternativa visual (para usuarios con problemas de audición adicionales)
- Mantener ratio de contraste mínimo 4.5:1 (WCAG AA)
- Los modales deben atrapar el foco y cerrarse con Escape
- Imágenes deben tener `alt` descriptivo

---

## 12. Internacionalización (i18n)

La app soporta **Español e Inglés**:
- Los textos de UI deben ir en el sistema de traducciones, no hardcodeados
- El idioma activo se gestiona con `LanguageContext`
- Fechas y números: usar `Intl.DateTimeFormat` y `Intl.NumberFormat` con el locale del usuario
