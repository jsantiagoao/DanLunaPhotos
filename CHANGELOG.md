# Changelog

Todos los cambios notables del proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).
Versionado semántico según [SemVer](https://semver.org/lang/es/).

---

## [1.3.1] - 2026-10-20

### Fixed
- Galería del cliente: si la sesión venció (12 h o cambio de contraseña/PIN), descargar lleva
  de vuelta al acceso en lugar de mostrar un error genérico; otros errores muestran el
  mensaje del servidor.

## [1.3.0] - 2026-10-10

### Added
- Efectos en la landing sin cambiar el diseño: submenús que se despliegan con fundido y
  opciones escalonadas, subrayado dorado en el menú, panel móvil y submenús móviles con
  altura animada.
- Header que se compacta al bajar (fondo translúcido, sombra, logo menor), se oculta al
  seguir bajando y reaparece al subir.
- Entrada del hero en secuencia (etiqueta, líneas del título, subtítulo y botón).
- Retrato de "Sobre mí" con cortina al entrar en pantalla y parallax dentro del marco.
- Botones de reserva y "Enviar mensaje" con brillo periódico y efecto magnético.
- Footer con enlaces a bodas, bautizo, Navidad, "Fotógrafa en Querétaro" y blog.
- Botón "Reservar sesión" dentro del menú móvil; el menú se cierra tocando fuera o con Escape.
- Enlace "Ver sesiones de…" a las páginas de Bodas y Bautizos desde Sesiones Destacadas.

### Changed
- H1 del hero con "Fotógrafa profesional en Querétaro" (SEO local) sin cambio visual.
- Opciones del menú sin página propia abren WhatsApp con el servicio ya escrito.
- Mensaje general en el botón flotante de WhatsApp.
- Hero con imagen responsiva (en móvil 77 KB en lugar de 298 KB).
- "Fotógrafo" → "Fotógrafa" en "Sobre mí".
- Sitemap con `/sesiones-navidad` y fechas actualizadas.

### Fixed
- Desbordamiento horizontal en móvil (página de 451 px en pantalla de 375) que dejaba
  los botones flotantes fuera de la pantalla.
- 10 opciones del menú apuntaban a secciones inexistentes y regresaban al inicio.
- JSON-LD del negocio duplicado tras la hidratación.
- Teléfono, correo e Instagram de contacto ahora son enlaces; formulario con etiquetas
  accesibles y autocompletado.
- Las secciones prerenderizadas no animaban su entrada al hacer scroll.
- El header ya no tapa el título de la sección al navegar desde el menú.

## [1.2.0] - 2026-09-03

### Changed
- Rediseño de la página de sesiones navideñas (`/sesiones-navidad`): fondo blanco con
  orbes dorados flotantes, estrellas y arbolitos titilando, y nevada de polvo dorado
  que recorre toda la página.
- Layout de reserva en dos columnas (resumen fijo + calendario/formulario); al continuar
  solo cambia la columna derecha de calendario a formulario, manteniendo el resumen.
- Calendario reacomodado (días circulares con glow, horarios como pills con gradiente),
  precio con shimmer dorado, botones con destello y transiciones fadeUp entre pasos.
- Formulario reorganizado en dos columnas para aprovechar el espacio, selects con flecha
  personalizada y total redundante eliminado del formulario.

### Fixed
- Responsive del calendario en móvil: la columna del domingo ya no se corta; los 7 días
  caben completos en pantallas pequeñas.
- Formulario adaptado a móvil (campos a una columna, chip de resumen que envuelve, inputs
  a 16px para evitar el zoom automático en iOS).

## [1.1.0] - 2026-09-03

### Added
- Campaña navideña "NOËL TALE": la landing consume la configuración (fechas, precios,
  agenda, aforo, contenido) desde el backend, con valores por defecto de respaldo.

### Changed
- El calendario y los horarios de la sesión navideña se calculan a partir de la
  configuración de campaña editable, en lugar de constantes fijas en el frontend.

## [1.0.0] - 2026-06-16

### Added
- Landing page principal con hero, galería, servicios y formulario de contacto
- Landing page de bodas con slider responsive (imágenes desktop/mobile)
- Cotizador interactivo de bodas con validaciones (email, teléfono con máscara)
- Landing page de bautizos con galería de 112 imágenes optimizadas y slider
- Página "Fotógrafa en Querétaro"
- Flash Bot (chatbot IA) con Bedrock Agent, Knowledge Base y Guardrails
- Formulario de contacto → Lambda → SES
- Botón flotante de WhatsApp
- Logo SVG de wedding photos en cotizador
- Imágenes verticales para slider mobile de bodas
- SEO: meta tags, JSON-LD, títulos dinámicos

### Infrastructure
- S3 + CloudFront con HTTPS (ACM wildcard `*.danlunaphoto.com`)
- Route53 dominio `danlunaphoto.com`
- API Gateway con endpoints `/chat`, `/contacto`, `/cotizacion`
- 6 Lambdas: chat, contacto, cotizacion, notificaciones, slackbot, calendar-sync
- SES con 3 templates y DKIM/SPF configurado
- EventBridge: sync calendario (15min) + notificaciones diarias (7am)

---

## [0.1.0] - 2026-05-01

### Added
- Scaffold inicial del proyecto Angular 19
- Configuración de S3 + CloudFront
- Primer deploy funcional
