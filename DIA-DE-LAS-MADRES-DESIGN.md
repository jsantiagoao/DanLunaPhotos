# Día de las Madres — Prototipo UX / SPA

> Documento de estructura y diseño para la sesión especial "Día de las Madres"

---

## Paleta de colores

| Token | Hex | Uso principal |
|---|---|---|
| Primario 1 | `#F9F5F2` | Fondo base de la página, fondos de sección clara |
| Secundario 1 | `#EAE7E1` | Fondos alternativos, tarjetas, bordes suaves |
| Primario 2 | `#AD8A6A` | Acento principal — botones, highlights, CTAs |
| Secundario 2 | `#86816C` | Texto principal y secundario |
| Negro | `#000000` | Texto oscuro opcional / caracteres fuertes |
| Gris Claro | `#CCCCCC` | Elementos deshabilitados, calendario |

---

## Estructura general del sitio

Estética: **limpia, minimalista, profesional** con sensación **cálida y emocional**.

| Atributo | Especificación |
|---|---|
| **Fondo principal** | `#F9F5F2` (blanco cálido) |
| **Tonos resaltados** | `#EAE7E1` (beige/dorado claro) |
| **Texto principal** | `#86816C` (gris oscuro elegante) |
| **Tipografía títulos** | Serif elegante (ej. Georgia, Playfair Display) |
| **Tipografía párrafos** | Sans Serif suave (ej. Inter, Open Sans) |
| **Alineación general** | Centrada |
| **Estructura vertical** | Secciones separadas con abundante espacio en blanco |
| **Sensación emocional** | Cálida, familiar, maternal |

---

## Estructura de secciones — SPA (scroll único)

```
┌─────────────────────────────────────────────────────┐
│  01  HEADER / NAVBAR                                │
├─────────────────────────────────────────────────────┤
│  02  SECCIÓN HERO — Galería con carrusel            │
├─────────────────────────────────────────────────────┤
│  03  "¿QUÉ INCLUYE LA SESIÓN?"                      │
├─────────────────────────────────────────────────────┤
│  04  "PASOS PARA RESERVAR" (Accordion)              │
├─────────────────────────────────────────────────────┤
│  05  "FECHAS Y HORARIOS"                            │
├─────────────────────────────────────────────────────┤
│  06  FOOTER                                         │
└─────────────────────────────────────────────────────┘
```

---

## 🧭 01 — Header / Encabezado

**Comportamiento:** barra superior muy delgada, minimalista.

| Elemento | Especificación |
|---|---|
| **Fondo** | `#F9F5F2` (blanco cálido) o ligeramente transparente |
| **Altura** | 60–70px |
| **Bordes** | Ninguno |
| **Sombras** | Ninguna |

**Contenido:**

```
┌─────────────────────────────────────────────────────────┐
│  Día de las Madres          Inicio    ·    Día de las M. │
└─────────────────────────────────────────────────────────┘
```

- **Izquierda:** Texto "Día de las Madres" en tipografía delgada y elegante (`#86816C`)
- **Derecha:** Menú simple con 2 enlaces:
  - "Inicio" (link a #hero)
  - "Día de las Madres" (link a #sobre-sesion o current)
- **Tipografía:** Sans Serif suave, peso normal o light
- **Espaciado interior:** padding 16–20px lado izquierdo/derecho

---

## 🖼️ 02 — Sección Hero — Galería con carrusel

**Ubicación:** justo debajo del header.

**Objetivo:** mostrar el contexto emocional de la sesión con fotografías.

### Contenido principal

**3 fotografías horizontales** (formato cuadrado o 4:5 aprox.):
- Madres con hijos
- Tonos cálidos, luz dorada, ambiente natural

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                [ Carrusel de imágenes ]                 │
│                 Foto 01  / Foto 02 / Foto 03            │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
        ← Flechas de navegación          • • •
```

### Especificaciones del carrusel

| Atributo | Detalle |
|---|---|
| **Altura** | 400–500px (responsive) |
| **Espaciado** | 20–30px entre imágenes |
| **Controles** | Flechas minimalistas (left/right) + dots de navegación |
| **Auto-slide** | Sí, cada 5–7 segundos (optional) |
| **Navegación** | Clickeable, click en dot o flecha avanza/retrocede |
| **Transición** | Fade suave o slide horizontal (400ms) |

### Frase emocional debajo del carrusel

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│     "Un momento único, un recuerdo para siempre"        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Texto:** "Un momento único, un recuerdo para siempre"
- **Alineación:** Centrada
- **Tipografía:** Serif elegante, cursiva, tamaño 18–24px
- **Color:** `#86816C`
- **Margen superior:** 40–50px

---

## 📦 03 — Sección "¿Qué incluye la sesión?"

**Objetivo:** informar claramente qué se entrega en la sesión.

### Estructura

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ¿Qué incluye la sesión?                                │
│                                                         │
│  • Sesión de 20 a 30 minutos                           │
│  • Tres cambios de ropa                                │
│  • Tres fotografías digitales                          │
│  • Tres fotografías impresas en alta resolución        │
│  • Un link de descarga                                 │
│  • Entrega express 24–48 horas                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Especificaciones

| Elemento | Detalle |
|---|---|
| **Título** | "¿Qué incluye la sesión?" |
| **Alineación título** | Izquierda (opcional: centrada) |
| **Tipografía título** | Serif elegante, peso bold, tamaño 28–32px |
| **Color título** | `#86816C` |
| **Contenido** | Lista de elementos con bullet invisible o solo saltos de línea |
| **Tipografía contenido** | Sans Serif suave, peso normal, tamaño 16–18px |
| **Color contenido** | `#86816C` |
| **Encuadre** | Sin caja de fondo (opcional: fondo `#EAE7E1` muy suave) |
| **Margen vertical** | 60–80px arriba y abajo |
| **Ancho máximo** | 600–800px (centrado) |

### Elementos de la lista

```
✓ Sesión de 20 a 30 minutos
✓ Tres cambios de ropa
✓ Tres fotografías digitales
✓ Tres fotografías impresas en alta resolución
✓ Un link de descarga
✓ Entrega express 24–48 horas
```

---

## 📅 04 — Sección "Pasos para reservar tu sesión hoy"

**Objetivo:** guiar paso a paso el proceso de reserva de forma interactiva.

**Diseño:** accordion (acordeón) collapsible de arriba hacia abajo, con el primer paso abierto por defecto.

### Estructura visual

```
┌────────────────────────────────────────────────────────────┐
│  "Pasos para reservar tu sesión hoy"                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [01] ▼ Selección de fecha y hora        [ABIERTO]       │
│  ├─────────────────────────────────────────              │
│  │ Descripción abierta:                                  │
│  │ "Escoge el día que mejor se adapte a tu agenda.       │
│  │  Mostramos tus opciones disponibles."                 │
│  └─────────────────────────────────────────              │
│                                                            │
│  [02] ▶ Agendar la sesión                [COLAPSADO]     │
│                                                            │
│  [03] ▶ Confirmación vía recibo          [COLAPSADO]     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Especificaciones

| Atributo | Detalle |
|---|---|
| **Fondo de caja** | `#EAE7E1` (beige claro) |
| **Bordes** | Línea fina (#86816C con opacidad 30%) entre cada paso |
| **Layout** | Apilado verticalmente (stack) |
| **Numeración paso** | [01], [02], [03] — sans serif bold, color #AD8A6A |
| **Tipografía título paso** | Serif elegante, peso bold, 16–18px, color #86816C |
| **Tipografía descripción** | Sans Serif suave, 14–16px, color #86816C |
| **Padding interno (cerrado)** | 20–24px |
| **Padding interno (abierto)** | 24px (parte superior y laterales), 16–20px (contenido expandido) |
| **Ícono de estado** | ▼ (abierto), ▶ (cerrado) – tamaño 16px, color #AD8A6A |
| **Transición** | Suave (300–400ms), altura animada |
| **Margen externo** | 60–80px arriba y abajo |
| **Ancho máximo** | 800px (centrado) |
| **Comportamiento móvil** | Apilado, con mismo accordion behavior |

### Comportamiento interactivo

1. **Carga inicial:** Paso 01 está expandido/abierto, pasos 02 y 03 colapsados
2. **Clic en paso cerrado:** Se abre suavemente, anterior se cierra
3. **Clic en paso abierto:** Se cierra suavemente
4. **Transición:** Animación de altura (max-height) de 300–400ms

### Contenido de cada paso

**Paso 1 — Selección de fecha y hora**
- Título: "Selección de fecha y hora"
- Descripción: "Escoge el día que mejor se adapte a tu agenda. Mostramos tus opciones disponibles."
- **Estado inicial:** ABIERTO

**Paso 2 — Agendar la sesión**
- Título: "Agendar la sesión"
- Descripción: "Confirma tu elección y proporciona tus datos. Completamos todos los detalles contigo."
- **Estado inicial:** CERRADO

**Paso 3 — Confirmación vía recibo**
- Título: "Confirmación vía recibo"
- Descripción: "Recibirás un email de confirmación con todos los detalles de tu sesión programada."
- **Estado inicial:** CERRADO

---

## 🗓️ 05 — Sección de selección de fechas y horarios

**Objetivo:** permitir la selección de fecha para la sesión.

### Estructura

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Fechas y horarios                                   │
│  Sesión de Día de las Madres                         │
│                                                      │
│  Selecciona una fecha                                │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  marzo 2025                                    │  │
│  ├────────────────────────────────────────────────┤  │
│  │  dom  lun  mar  mié  jue  vie  sab            │  │
│  │                              1    2            │  │
│  │   3    4    5    6    7    8    9            │  │
│  │  10   11   12   13   14   15   16            │  │
│  │  17   18  [19]  20   21   22   23            │  │
│  │  24   25   26   27   28   29   30            │  │
│  │  31                                           │  │
│  │                                              │  │
│  │  Disponible    ◯ Seleccionado    No disponible  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Especificaciones

| Elemento | Detalle |
|---|---|
| **Título principal** | "Fechas y horarios" (Serif elegante, bold, 28–32px) |
| **Subtítulo** | "Sesión de Día de las Madres" (Sans Serif, 16px, color `#AD8A6A`) |
| **Label** | "Selecciona una fecha" (Sans Serif, 14px, color `#86816C`) |
| **Calendario** | Cuadrícula 7×6 (días de semana) |
| **Mes mostrado** | Marzo 2025 (ajustable según disponibilidad) |
| **Día disponible** | Números en negro/`#86816C`, fondo blanco, clickeable |
| **Día no disponible** | Números en gris claro (`#CCCCCC`), sin interacción |
| **Día seleccionado** | Número con círculo de selección (`#AD8A6A` fondo claro) |
| **Leyenda** | Pequeños indicadores de estado (disponible, seleccionado, no disponible) |
| **Fondo de caja** | `#F9F5F2` (fondo principal) o `#EAE7E1` suave |
| **Margen externo** | 60–80px arriba y abajo |
| **Tamaño máximo** | 700px ancho (centrado) |

### Comportamiento interactivo

- Clic en día disponible → selecciona y marca con círculo
- Días no disponibles no responden a clic
- Opcional: al seleccionar, mostrar horarios disponibles debajo (ej. "Disponible entre 10 AM – 2 PM")

---

## 🧩 06 — Footer

**Objetivo:** cierre simple y limpio.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              © 2025 Dan Luna Photo                   │
│         Todos los derechos reservados                │
│                                                      │
│         Instagram  |  WhatsApp  |  Email             │
│                                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Especificaciones

| Elemento | Detalle |
|---|---|
| **Fondo** | `#EAE7E1` (beige suave) o `#F9F5F2` |
| **Texto legal** | "© 2025 Dan Luna Photo — Todos los derechos reservados" |
| **Tipografía** | Sans Serif suave, tamaño 12–14px, color `#86816C` |
| **Enlaces rápidos** | Instagram · WhatsApp · Email (minimalistas) |
| **Tipografía enlaces** | Sans Serif, tamaño 12px, color `#AD8A6A` (hover: subrayado) |
| **Padding** | 40–60px arriba y abajo |
| **Alineación** | Centrada |
| **Margen máximo** | 100% del ancho |

---

## 🧩 Comportamiento esperado para la herramienta (Pencil Design / IA UI Builders)

### Navegación y scroll

- ✅ Página scroll vertical único (SPA)
- ✅ Accordion interactivo para pasos de reserva (expand/collapse suave)
- ✅ Carrusel auto-deslizable (5–7 segundos entre transiciones)
- ✅ Calendario interactivo (selección de fecha, estados visuales)
- ✅ Links de navegación suave (smooth scroll)

### Estilos y efectos

- ✅ Sin colores fuertes ni saturados
- ✅ Botones/enlaces muy minimalistas (`#AD8A6A` en hover)
- ✅ Diseño centrado con márgenes amplios
- ✅ Tipografía elegante: Serif para títulos, Sans Serif para párrafos
- ✅ Abundante espacio en blanco entre secciones

### Responsive

- ✅ Mobile-first: funciona en 375px
- ✅ Tablet: transiciones suaves
- ✅ Desktop: máximo ancho 1200px (contenedor centrado)

### Accesibilidad

- ✅ Contraste AA mínimo: `#86816C` sobre `#F9F5F2` (ratio ~3.8:1)
- ✅ Alt text en todas las imágenes
- ✅ Labels en formularios y calendario
- ✅ Indicadores de estado claros (disponible/no disponible)

### Orientación al usuario

- ✅ Muy orientado a fotografía profesional
- ✅ Énfasis emocional: momentos con mamá, recuerdos, cálido
- ✅ Flujo claro: galería → información → reserva
- ✅ CTAs sutiles pero presentes

---

## Stack sugerido

| Capa | Tecnología |
|---|---|
| Framework | Angular (como en el proyecto actual) o React + Vite |
| Estilos | SCSS / Tailwind CSS |
| Animaciones | Framer Motion o Angular Animations |
| Carrusel | Swiper JS o Keen Slider |
| Calendario | Flatpickr o calendario personalizado |
| Deploy | Vercel o similar |

---

## Notas finales

1. **Paleta consistente:** mantener `#F9F5F2`, `#EAE7E1`, `#AD8A6A`, `#86816C` en todo el sitio.
2. **Fotografías:** todas con tonos cálidos, luz dorada, ambiente natural y maternal.
3. **Sensación emocional:** cada elemento debe reflejar calidez, confianza y profesionalismo.
4. **Simplicidad:** menos es más — evitar elementos decorativos innecesarios.
5. **Foco en CTAs:** "Reservar sesión" debe ser visible y atractivo sin ser invasivo.

