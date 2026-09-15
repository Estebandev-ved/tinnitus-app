# Reglas de Diseño Gráfico para Aplicaciones Móviles – TinnitOff

## Filosofía de Diseño

El diseño de TinnitOff debe transmitir **calma, confianza y claridad**.
Es una app de salud auditiva — cada decisión visual debe reducir la ansiedad del usuario,
no aumentarla. Diseño limpio, intencional y humano por encima de todo.

> "El mejor diseño no se nota — simplemente funciona."

---

## 1. Sistema de Color

### Paleta Principal

La paleta debe evocar **serenidad, salud y tecnología accesible**.

```
Primario     #4A90D9   → Azul calmo (confianza, salud)
Secundario   #6EC6A0   → Verde menta suave (bienestar, alivio)
Acento       #A78BFA   → Lavanda (relajación, calma mental)
Peligro      #F87171   → Rojo suave (no agresivo, solo alertas)
Advertencia  #FBBF24   → Ámbar cálido
Éxito        #34D399   → Verde esmeralda

Neutros:
  Fondo oscuro    #0F172A   (dark mode principal)
  Superficie      #1E293B   (tarjetas, modales)
  Borde sutil     #334155
  Texto principal #F1F5F9
  Texto secundario #94A3B8
  Texto deshabilitado #475569
```

### Reglas de Uso de Color

- **Nunca** usar colores puros (rojo puro `#FF0000`, azul puro `#0000FF`) — se ven baratos
- El color de acento se usa para CTAs primarios y elementos interactivos únicamente
- El color de peligro solo para errores reales, nunca decorativo
- Mantener contraste mínimo de **4.5:1** para texto normal (WCAG AA)
- En gráficas de datos de salud: usar gradientes del secundario al primario
- Los gradientes deben tener dirección coherente: preferir `135deg` o `180deg`

### Gradientes Estándar

```
Gradiente Hero:     linear-gradient(135deg, #4A90D9 0%, #A78BFA 100%)
Gradiente Card:     linear-gradient(180deg, #1E293B 0%, #0F172A 100%)
Gradiente Éxito:    linear-gradient(135deg, #6EC6A0 0%, #34D399 100%)
Gradiente Calor:    linear-gradient(135deg, #FBBF24 0%, #F87171 100%)
```

---

## 2. Tipografía

### Familia de Fuentes

```
Principal:    "Inter"    → UI general, textos de interfaz
Display:      "Outfit"   → Títulos grandes, onboarding, heroes
Monoespaciada: "JetBrains Mono" → Valores numéricos, datos de salud
```

### Escala Tipográfica (React Native / Mobile)

```
Display XL   → 40sp  / weight 800 / letra-spacing -1.5
Display L    → 32sp  / weight 700 / letra-spacing -1.0
Heading 1    → 28sp  / weight 700 / letra-spacing -0.5
Heading 2    → 22sp  / weight 600 / letra-spacing -0.3
Heading 3    → 18sp  / weight 600 / letra-spacing 0
Subtitle     → 16sp  / weight 500 / letra-spacing 0.1
Body L       → 16sp  / weight 400 / letra-spacing 0.15
Body M       → 14sp  / weight 400 / letra-spacing 0.15
Body S       → 12sp  / weight 400 / letra-spacing 0.2
Label        → 11sp  / weight 500 / letra-spacing 0.5  (UPPERCASE)
Caption      → 10sp  / weight 400 / letra-spacing 0.3
```

### Reglas Tipográficas

- **Nunca** mezclar más de 2 familias de fuentes en una sola pantalla
- Los valores de salud (nivel de tinnitus, dB, Hz) van en **JetBrains Mono**
- Máximo 3 tamaños distintos por pantalla para mantener jerarquía clara
- Interlineado mínimo: `1.4x` el tamaño de la fuente
- Textos largos (más de 3 líneas) siempre en Body M o mayor
- **Nunca** centrar bloques de texto largos — solo títulos y etiquetas cortas

---

## 3. Espaciado y Layout

### Sistema de Grid (8pt Grid)

Todo el espaciado debe ser múltiplo de **8** (o excepcionalmente de 4):

```
4pt   → micro-espaciado (entre ícono y texto)
8pt   → espaciado XS (padding interno de chips, badges)
12pt  → espaciado S
16pt  → espaciado M (padding estándar de tarjetas)
24pt  → espaciado L (separación entre secciones)
32pt  → espaciado XL
48pt  → espaciado 2XL (hero sections, headers grandes)
64pt  → espaciado 3XL
```

### Márgenes de Pantalla

```
Margen lateral estándar:  20pt a cada lado
Margen en modo lista:     16pt
Safe area top:            Respetar siempre el notch/dynamic island
Safe area bottom:         Respetar siempre el home indicator (34pt en iPhone sin botón)
```

### Contenedores y Tarjetas

- Radio de borde estándar de tarjetas: **16pt**
- Radio de borde de botones: **12pt**
- Radio de borde de chips/badges: **999pt** (píldora completa)
- Radio de borde de campos de texto: **10pt**
- **Nunca** usar radio de borde 0 (esquinas rectas) — se ve anti-mobile
- Sombras en tarjetas: `0px 4px 24px rgba(0,0,0,0.25)` (dark mode)

---

## 4. Componentes de UI

### Botones

```
Primario (CTA):
  - Fondo: color acento o gradiente primario
  - Texto: blanco, weight 600, 16sp
  - Padding: 16pt vertical, 24pt horizontal
  - Altura mínima: 52pt (zona táctil cómoda)
  - Ancho: full-width en pantallas de detalle, auto en listas

Secundario (ghost):
  - Fondo: transparente
  - Borde: 1.5pt del color acento
  - Texto: color acento, weight 600

Terciario (texto):
  - Sin borde ni fondo
  - Texto: color secundario, weight 500, con underline opcional

Destructivo:
  - Fondo: #F87171 con 15% opacidad
  - Borde: #F87171
  - Texto: #F87171
```

### Estados de Botón

- **Normal**: 100% opacidad
- **Pressed**: 90% opacidad + escala 0.97 (feedback háptico recomendado)
- **Disabled**: 40% opacidad, sin cursor
- **Loading**: spinner centrado, mismo color que el texto

### Campos de Texto (Inputs)

```
Fondo:          #1E293B
Borde normal:   1pt #334155
Borde focus:    1.5pt color acento
Borde error:    1.5pt #F87171
Texto:          #F1F5F9, 16sp
Placeholder:    #475569
Label arriba:   12sp, #94A3B8, weight 500
Mensaje error:  12sp, #F87171, con ícono de alerta
Padding interno: 16pt horizontal, 14pt vertical
```

### Tarjetas (Cards)

```
Fondo:          #1E293B
Borde:          1pt #334155 (opcional, sutil)
Sombra:         0px 4px 24px rgba(0,0,0,0.25)
Radio:          16pt
Padding:        20pt
```

### Íconos

- Usar únicamente **Lucide Icons** o **Phosphor Icons** — consistentes y modernos
- Tamaño estándar en navegación: 24pt
- Tamaño estándar en botones/acciones: 20pt
- Tamaño en contexto informativo/decorativo: 16pt
- **Nunca** mezclar estilos de íconos (outline con filled en la misma pantalla)
- Los íconos siempre acompañados de etiqueta de texto en zonas de navegación

---

## 5. Navegación

### Bottom Tab Bar

- Altura: 80pt (incluyendo safe area) + 34pt safe area en iPhone sin botón físico
- Máximo **5 tabs** — si hay más, usar menú o drawer
- Elemento activo: color acento + label visible
- Elemento inactivo: color #475569, label visible siempre (no solo el ícono)
- Fondo: `rgba(15, 23, 42, 0.92)` con blur de 20pt (glassmorphism)

### Headers / App Bars

- Altura estándar: 56pt (+ safe area top)
- Título centrado en iOS, izquierda en Android — respetar convención de plataforma
- Máximo 1 acción primaria a la derecha
- Si hay más de 2 acciones: usar menú de 3 puntos (`...`)
- Nunca mostrar más de 2 líneas de texto en el header

### Gestos y Navegación

- Deslizar desde el borde izquierdo para "atrás" (iOS nativo)
- Pull-to-refresh con indicador de carga personalizado (no el spinner genérico)
- Scroll infinito con skeleton loader, nunca con spinner de página completa

---

## 6. Feedback Visual y Animaciones

### Principios de Animación

- Las animaciones deben durar entre **150ms** (micro) y **400ms** (transición de pantalla)
- Curvas de easing:
  - Entrada de elementos: `ease-out` (rápido al inicio, suave al final)
  - Salida de elementos: `ease-in`
  - Transiciones de pantalla: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard)
- **Nunca** animar más de 3 propiedades simultáneamente — genera ruido visual
- Respetar `Reduce Motion` del sistema operativo

### Transiciones de Pantalla

```
Push (navegar hacia adelante): slide desde derecha, 300ms ease-out
Pop (navegar atrás):           slide hacia derecha, 250ms ease-in
Modal:                         slide desde abajo, 350ms ease-out
Alert/Snackbar:                fade + slide 12pt, 200ms ease-out
```

### Estados de Carga

- **Skeleton loaders**: siempre en lugar de spinners para contenido de lista/tarjeta
- Color del skeleton: `#334155` con shimmer animado de `#475569`
- Spinners de carga: solo para acciones puntuales (envío de formulario, botón CTA)
- Tiempo máximo sin feedback visual: **800ms** — pasado ese tiempo, mostrar indicador

### Micro-interacciones

- Botones: escala 0.97 al presionar con spring animation (stiffness 300, damping 20)
- Toggles/Switches: animación de slide suave, 200ms
- Checkboxes: animación de dibujo del check, 150ms
- Elementos de lista al eliminar: swipe con fade, 250ms
- Gráficas de datos: animación de entrada secuencial (stagger de 50ms por punto)

---

## 7. Datos de Salud y Gráficas

### Diseño de Gráficas (específico para TinnitOff)

Las gráficas son un componente central de la app. Deben ser **legibles, hermosas y no ansiogénicas**:

```
Colores de línea:
  Nivel de tinnitus:  #A78BFA (lavanda)
  Nivel de estrés:    #F87171 (rojo suave)
  Horas de sueño:     #6EC6A0 (verde menta)
  Exposición a ruido: #FBBF24 (ámbar)

Fondo de gráfica:     #0F172A
Líneas de grid:       #1E293B (muy sutiles)
Ejes:                 #334155
Etiquetas de eje:     #94A3B8, 10sp, JetBrains Mono
```

- Gráficas de línea: trazo de 2pt con punto de dato de 6pt en selección
- Área bajo la curva: gradiente del color de línea al 15% de opacidad
- Tooltips al presionar un punto: tarjeta flotante con datos detallados
- Siempre incluir **zona de referencia normal** como band gris sutil
- **Nunca** mostrar más de 3 series de datos simultáneamente sin toggle para ocultarlas

### Indicadores de Nivel (Tinnitus Level)

```
0-2   → Verde menta   #6EC6A0  ("Bajo")
3-4   → Ámbar         #FBBF24  ("Moderado")
5-7   → Naranja       #FB923C  ("Alto")
8-10  → Rojo suave    #F87171  ("Severo")
```

- Usar siempre el color + texto descriptivo, nunca solo el número
- Mostrar el número en JetBrains Mono, bold, grande
- Acompañar con ícono o ilustración contextual

---

## 8. Accesibilidad (A11y)

- **Contraste mínimo WCAG AA**: 4.5:1 para texto normal, 3:1 para texto grande (+18sp)
- Todas las imágenes e íconos decorativos: `accessibilityRole="none"` o `aria-hidden`
- Todos los botones e inputs: etiqueta de accesibilidad descriptiva
- Zona táctil mínima de cualquier elemento interactivo: **44x44pt** (Apple HIG)
- No depender únicamente del color para comunicar estado — agregar ícono o texto
- Soporte para fuente grande del sistema (Dynamic Type en iOS, Font Scale en Android)
- Orden de foco lógico y predecible en toda la app

---

## 9. Dark Mode (Obligatorio)

TinnitOff es **dark mode por defecto** (usuarios con problemas auditivos frecuentemente tienen sensibilidad a la luz):

- Todos los componentes deben funcionar en dark mode
- **Nunca** usar negro puro `#000000` de fondo — usar `#0F172A`
- **Nunca** usar blanco puro `#FFFFFF` para texto — usar `#F1F5F9`
- Las sombras en dark mode se reemplazan por bordes sutiles o elevación de color de fondo
- Si se implementa light mode: fondo `#F8FAFC`, superficie `#FFFFFF`, textos `#0F172A`

---

## 10. Onboarding y Pantallas Vacías

### Onboarding

- Máximo **4 pantallas** de onboarding — más es abandono garantizado
- Cada pantalla: 1 ilustración, 1 título, 1 párrafo de máximo 2 líneas
- Botón "Omitir" siempre visible desde la primera pantalla
- Indicadores de progreso: puntos pequeños centrados en la parte inferior
- La última pantalla: CTA claro de "Comenzar" con el color acento

### Pantallas Vacías (Empty States)

```
Estructura obligatoria:
  1. Ilustración centrada (180pt de alto máximo)
  2. Título (Heading 2)
  3. Descripción breve (Body M, color secundario, máximo 2 líneas)
  4. Botón CTA primario (si aplica acción)
```

- Las ilustraciones de empty state deben ser amigables y no generar ansiedad
- Usar ilustraciones de estilo flat/outlined, no fotografías
- Colores de ilustración: usar la paleta principal, no colores ajenos al sistema

---

## 11. Imágenes e Ilustraciones

- Formato preferido para íconos e ilustraciones: **SVG**
- Formato para fotos y assets complejos: **WebP** (compresión superior)
- Imágenes de perfil: siempre con máscara circular, borde de 2pt en color acento
- **Nunca** mostrar imágenes sin estado de loading (skeleton o blur placeholder)
- Aspect ratios estándar para banners/heroes: `16:9` o `3:1`
- Las ilustraciones de la app deben mantener un estilo visual **coherente** — no mezclar estilos

---

## 12. Notificaciones y Feedback al Usuario

### Toasts / Snackbars

```
Posición:   parte inferior de la pantalla, 16pt sobre el tab bar
Ancho:      pantalla completa con 16pt de margen lateral
Padding:    16pt horizontal, 14pt vertical
Radio:      12pt
Duración:   éxito → 2.5s | error → 4s | info → 3s

Colores:
  Éxito:       fondo #064E3B, borde #34D399
  Error:       fondo #450A0A, borde #F87171
  Advertencia: fondo #451A03, borde #FBBF24
  Info:        fondo #0C1A4A, borde #4A90D9
```

### Alertas y Modales de Confirmación

- Los modales destructivos (eliminar, cerrar sesión) siempre con texto explicativo
- Botón de cancelar siempre a la **izquierda**, confirmar a la **derecha**
- El botón destructivo siempre en rojo suave (`#F87171`), nunca en gris
- No usar más de 2 botones en un modal — si necesitas más opciones, usa un bottom sheet

---

## 13. Checklist de Diseño por Pantalla

Antes de implementar o entregar cualquier pantalla, verificar:

- [ ] ¿La jerarquía visual guía el ojo del usuario al elemento más importante primero?
- [ ] ¿Todos los textos pasan el contraste mínimo WCAG AA?
- [ ] ¿Las zonas táctiles tienen mínimo 44x44pt?
- [ ] ¿La pantalla funciona sin imágenes (en caso de error de carga)?
- [ ] ¿Se definieron los estados: normal, hover/pressed, loading, error, vacío?
- [ ] ¿La animación respeta `Reduce Motion`?
- [ ] ¿La tipografía respeta la escala definida? (sin tamaños arbitrarios)
- [ ] ¿Los colores pertenecen únicamente a la paleta definida?
- [ ] ¿La pantalla funciona en modo dark?
- [ ] ¿Los datos de salud usan los colores de indicador correcto según el nivel?
