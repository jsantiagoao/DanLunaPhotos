import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Estrategia de renderizado por ruta.
 *
 * - Prerender (SSG): paginas de contenido estable. Se generan como HTML estatico
 *   en build time con sus og-tags horneados → el crawler de WhatsApp/Facebook ve
 *   titulo e imagen correctos al compartir el link. Es la mejor practica para
 *   marketing/landing (Angular: "Rendering strategies").
 * - Client (CSR): el visor de galeria depende de un token en sessionStorage
 *   (contenido por-usuario); no se puede prerenderizar sin ese dato, asi que
 *   se sirve como SPA cliente.
 */
export const serverRoutes: ServerRoute[] = [
  // Visor de galeria de clientes: por-usuario (token), no se prerenderiza.
  { path: 'galeria/:slug', renderMode: RenderMode.Client },
  { path: 'galeria/:slug/ver', renderMode: RenderMode.Client },
  // Blog con parametro dinamico: cliente (el contenido llega por API).
  { path: 'blog/:slug', renderMode: RenderMode.Client },
  { path: 'blog', renderMode: RenderMode.Client },
  // Landing de campaña dinámica (ADR-007): el slug y su config llegan por API en runtime
  // (no existen en build), así que se sirve como SPA cliente, igual que el blog.
  { path: 'campana/:slug', renderMode: RenderMode.Client },
  // Resto de rutas (home, campanas, servicios): prerender estatico con og-tags.
  { path: '**', renderMode: RenderMode.Prerender },
];
