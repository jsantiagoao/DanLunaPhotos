# Dan Luna Photo — Sitio Web Profesional

> Sitio web de fotografía profesional en Querétaro, México.
> Producción: [danlunaphoto.com](https://danlunaphoto.com)

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Angular 19 (standalone components, signals) |
| Estilos | SCSS con design tokens |
| Hosting | AWS S3 + CloudFront |
| SSL | ACM (`danlunaphoto.com` + `*.danlunaphoto.com`) |
| DNS | Route53 |
| Chatbot | AWS Bedrock Agent (Claude Haiku) + Knowledge Base |
| Formularios | AWS Lambda + API Gateway + SES |
| CI/CD | Deploy manual (S3 sync + CloudFront invalidation) |

---

## Instalación

```bash
# Clonar
git clone git@github-personal:jsantiagoao/DanLunaPhotos.git
cd DanLunaPhotos

# Instalar dependencias
npm install --legacy-peer-deps

# Desarrollo local
ng serve
# → http://localhost:4200
```

---

## Build y Deploy

```bash
# Build producción
ng build --configuration production

# Deploy a S3
aws s3 sync dist/dan-luna-photo/browser/ s3://danlunaphoto-site/ --delete --profile danluna

# Invalidar caché
aws cloudfront create-invalidation --distribution-id EJO49OMBXOJUI --paths "/*" --profile danluna
```

---

## Estructura del sitio

| Ruta | Página |
|---|---|
| `/` | Home — Hero, galería, servicios, contacto |
| `/fotografia-bodas-queretaro` | Landing de bodas |
| `/cotizacion-bodas` | Cotizador interactivo de bodas |
| `/fotografia-bautizo-queretaro` | Landing de bautizos |
| `/fotografa-en-queretaro` | Sobre la fotógrafa |

---

## Design Tokens

| Token | Valor | Uso |
|---|---|---|
| $dark | `#2D2420` | Fondos oscuros |
| $gold | `#AD8A6A` | Acento, CTAs |
| $cream | `#F9F5F2` | Fondo principal |
| $beige | `#EAE7E1` | Fondos alternos |
| Serif | Fraunces | Títulos |
| Sans | DM Sans | Cuerpo |

---

## Contacto

- **Proyecto**: Dan Luna Photo
- **Dev**: Santiago Aguillón (@jsantiagoao)
