# Dan Luna Photo — Prototipo UX / SPA

> Documento de estructura para el rediseño del sitio web de Dan Luna Photo.
> Basado en el análisis del sitio actual: `danlunaphoto.duodigitalservice.com`

---

## Contexto del proyecto

El sitio actual es visualmente atractivo pero carece de contenido estratégico para convertir
visitantes en clientes. Este prototipo cubre las brechas identificadas:

| Brecha actual | Solución en el prototipo |
|---|---|
| Sin sección de servicios | Sección `#servicios` con paquetes y precios base |
| Sin información de contacto clara | Sección `#contacto` con formulario + WhatsApp + redes |
| Sin biografía del fotógrafo | Sección `#sobre-mi` con narrativa y confianza |
| Sin testimonios | Sección `#testimonios` con clientes reales |
| Sin SEO ni blog | Sección `#blog` opcional para posicionamiento |

---

## Estructura de secciones — SPA (scroll único)

```
┌─────────────────────────────────────────┐
│  01  NAVBAR (fija, transparente → sólida)
├─────────────────────────────────────────┤
│  02  HERO — Portada a pantalla completa
├─────────────────────────────────────────┤
│  03  GALERÍA / PORTFOLIO
├─────────────────────────────────────────┤
│  04  SOBRE MÍ
├─────────────────────────────────────────┤
│  05  SERVICIOS Y PAQUETES
├─────────────────────────────────────────┤
│  06  TESTIMONIOS
├─────────────────────────────────────────┤
│  07  CONTACTO
├─────────────────────────────────────────┤
│  08  FOOTER
└─────────────────────────────────────────┘
```

---

## Detalle de cada sección

### 01 — Navbar

**Comportamiento:** fija en la parte superior, fondo transparente sobre el Hero; fondo sólido oscuro al hacer scroll.

| Elemento | Detalle |
|---|---|
| Logo | "Dan Luna Photo" — tipografía serif elegante |
| Links | Portfolio · Sobre mí · Servicios · Contacto |
| CTA | Botón "Reservar sesión" — acción principal |
| Íconos | Instagram · WhatsApp |

---

### 02 — Hero

**Objetivo:** impacto visual inmediato y CTA claro.

| Elemento | Detalle |
|---|---|
| Fondo | Foto destacada a pantalla completa (100vh) con overlay oscuro |
| Eyebrow | Texto pequeño en dorado: "FOTOGRAFÍA PROFESIONAL" |
| Título | Frase potente en tipografía serif grande (ej. *"Cada momento, una obra."*) |
| Subtítulo | Breve descripción: servicios y estilo del fotógrafo |
| CTAs | Primario: "Ver portfolio" · Secundario: "Reservar sesión" |
| Indicador | Flecha o línea animada hacia abajo (scroll hint) |

---

### 03 — Galería / Portfolio

**Objetivo:** mostrar el trabajo; separado por categorías.

| Elemento | Detalle |
|---|---|
| Encabezado | Título de sección + link "Ver todo el trabajo" |
| Categorías | Retratos · Bodas · Sesiones personales · Fotografía artística |
| Layout | Grid de tarjetas con imagen de portada, nombre de categoría y cantidad de sesiones |
| Interacción | Hover con zoom suave + capa oscura con texto |
| Lightbox | Al hacer clic en una foto → visor en pantalla completa |

**Wireframe tarjeta de categoría:**
```
┌──────────────────────┐
│                      │
│    [ imagen ]        │
│                      │
│  01                  │
│  Retratos            │
│  48 sesiones         │
└──────────────────────┘
```

---

### 04 — Sobre mí

**Objetivo:** generar confianza y conexión emocional con el fotógrafo.

| Elemento | Detalle |
|---|---|
| Layout | Split: foto del fotógrafo (izquierda) + texto (derecha) |
| Contenido | Nombre, años de experiencia, filosofía y estilo |
| Números | Stats destacados: años trabajando · sesiones realizadas · ciudades |
| CTA | "Conocé mi historia completa" o link a página extendida |

**Wireframe layout:**
```
┌─────────────┬─────────────────────────────┐
│             │  SOBRE MÍ                   │
│  [ foto ]   │  Dan Luna                   │
│             │  Fotógrafo profesional...   │
│             │                             │
│             │  [12 años] [+300 sesiones]  │
│             │                             │
│             │  [ Conocé mi historia ]     │
└─────────────┴─────────────────────────────┘
```

---

### 05 — Servicios y paquetes

**Objetivo:** informar claramente qué se ofrece y a qué precio base, eliminando fricción.

| Elemento | Detalle |
|---|---|
| Layout | 3 tarjetas de paquetes en fila (o stack en mobile) |
| Tarjeta | Nombre del paquete · Lista de incluidos · Precio base · CTA |
| Paquetes sugeridos | Básico · Estándar · Premium |
| Nota | Aclaración: "Precios desde — consultar disponibilidad" |
| CTA | Botón "Reservar" en cada tarjeta |

**Wireframe tarjeta de servicio:**
```
┌──────────────────────┐
│  Básico              │
│  ─────────────────   │
│  ✓ 1 hora de sesión  │
│  ✓ 20 fotos editadas │
│  ✓ Entrega digital   │
│                      │
│  desde $XX.000       │
│                      │
│  [ Reservar ]        │
└──────────────────────┘
```

---

### 06 — Testimonios

**Objetivo:** prueba social que refuerza la decisión de contratar.

| Elemento | Detalle |
|---|---|
| Layout | Carrusel o grid de 3 tarjetas visibles |
| Tarjeta | Foto del cliente (opcional) · Nombre · Tipo de sesión · Texto del testimonio · Estrellas |
| Fuente | Google Reviews · Instagram DMs · Formulario post-sesión |

**Wireframe tarjeta testimonio:**
```
┌────────────────────────────────┐
│  ★★★★★                        │
│                                │
│  "Dan captó exactamente lo     │
│   que quería, fue increíble."  │
│                                │
│  — María G. · Sesión Retratos  │
└────────────────────────────────┘
```

---

### 07 — Contacto

**Objetivo:** facilitar al máximo el primer contacto y la reserva.

| Elemento | Detalle |
|---|---|
| Layout | Split: formulario (izquierda) + info de contacto (derecha) |
| Formulario | Nombre · Email · Tipo de sesión (select) · Mensaje · Botón enviar |
| Info directa | WhatsApp · Email · Instagram · Ciudad de operación |
| Horario | "Respondo en menos de 24hs" |
| Backend | EmailJS o Formspree (sin backend propio) |

**Wireframe layout:**
```
┌──────────────────────┬────────────────────┐
│  Nombre              │  Hablemos          │
│  Email               │                    │
│  Tipo de sesión ▼    │  WhatsApp          │
│  Mensaje             │  Email             │
│                      │  Instagram         │
│  [ Enviar mensaje ]  │  @danlunaphoto     │
└──────────────────────┴────────────────────┘
```

---

### 08 — Footer

**Objetivo:** cierre limpio con navegación secundaria y legales.

| Elemento | Detalle |
|---|---|
| Logo | Dan Luna Photo |
| Links rápidos | Portfolio · Sobre mí · Servicios · Contacto |
| Redes sociales | Instagram · WhatsApp · (TikTok opcional) |
| Legal | © 2025 Dan Luna Photo — Todos los derechos reservados |

---

## Flujo de usuario principal

```
Llega al Hero
     │
     ▼
Navega el Portfolio  ──→  Lightbox (ve fotos en detalle)
     │
     ▼
Lee "Sobre mí"  (genera confianza)
     │
     ▼
Revisa Servicios  (evalúa precios)
     │
     ▼
Lee Testimonios  (decide)
     │
     ▼
Formulario de Contacto  ──→  WhatsApp directo
```

---

## Paleta de colores

| Token | Hex | Uso principal |
|---|---|---|
| Primario 1 | `#F9F5F2` | Fondo base de la página, fondos de sección clara |
| Secundario 1 | `#EAE7E1` | Fondos alternativos, tarjetas, bordes suaves, separadores |
| Primario 2 | `#AD8A6A` | Acento principal — CTAs, botones, highlights, hover states |
| Secundario 2 | `#86816C` | Texto secundario, íconos de apoyo, decoraciones sutiles |

### Aplicación por sección

| Sección | Fondo | Texto principal | Acento / CTA |
|---|---|---|---|
| Navbar (sólido) | `#EAE7E1` | `#86816C` | `#AD8A6A` |
| Hero | imagen + overlay cálido | `#F9F5F2` | `#AD8A6A` |
| Galería / Portfolio | `#F9F5F2` | `#86816C` | `#AD8A6A` |
| Sobre mí | `#EAE7E1` | `#86816C` | `#AD8A6A` |
| Servicios | `#F9F5F2` | `#86816C` | `#AD8A6A` |
| Testimonios | `#EAE7E1` | `#86816C` | `#AD8A6A` |
| Contacto | `#F9F5F2` | `#86816C` | `#AD8A6A` |
| Footer | `#EAE7E1` | `#86816C` | `#AD8A6A` |

---

## Notas de diseño UX

- **Estilo visual:** cálido, elegante, minimalista. La paleta usa tonos neutros terrosos que enmarcan la fotografía sin competir con ella. Tipografía serif para títulos.
- **Paleta base:** fondo `#F9F5F2`, alternancia con `#EAE7E1`, acento principal `#AD8A6A`, texto secundario `#86816C`.
- **Mobile-first:** todo el layout debe funcionar en 375px antes de desktop.
- **Rendimiento:** imágenes en WebP, lazy loading, objetivo Lighthouse 90+.
- **Accesibilidad:** contraste AA mínimo — verificar `#86816C` sobre `#F9F5F2` (ratio ~3.8:1 para texto grande); `#AD8A6A` sobre `#F9F5F2` (ratio ~3.1:1 — usar solo en elementos grandes o con peso bold). Alt text en todas las imágenes, formulario con labels.
- **CTAs consistentes:** el botón "Reservar sesión" usa siempre `#AD8A6A` como fondo. Debe estar accesible desde Navbar, Hero y Servicios.

---

## Stack sugerido

| Capa | Tecnología |
|---|---|
| Framework | React 18 + Vite |
| Estilos | Tailwind CSS |
| Animaciones | Framer Motion |
| Formulario | EmailJS |
| Routing (scroll) | React Router v6 + hash links |
| Deploy | Vercel |
