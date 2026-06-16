# Changelog

Todos los cambios notables del proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).
Versionado semántico según [SemVer](https://semver.org/lang/es/).

---

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
