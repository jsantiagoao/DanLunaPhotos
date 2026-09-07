import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

/**
 * Solo la home (ruta '') es eager: es el primer paint de la landing.
 * El resto de rutas hacen lazy loading (loadComponent) para no engordar el
 * bundle inicial — cada pagina carga su chunk al visitarse. Mejora LCP/TTI,
 * clave en el trafico movil.
 */
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'fotografia-bautizo-queretaro', loadComponent: () => import('./pages/bautizos/bautizos.component').then(m => m.BautizosComponent) },
  { path: 'fotografia-bodas-queretaro', loadComponent: () => import('./pages/bodas/bodas.component').then(m => m.BodasComponent) },
  { path: 'cotizacion-bodas', loadComponent: () => import('./pages/cotizacion-bodas/cotizacion-bodas.component').then(m => m.CotizacionBodasComponent) },
  { path: 'agendar', loadComponent: () => import('./pages/agendar/agendar.component').then(m => m.AgendarComponent) },
  // Campaña navideña: reserva de mini sesiones (ADR-001).
  { path: 'sesiones-navidad', loadComponent: () => import('./pages/navidad/navidad.component').then(m => m.NavidadComponent) },
  { path: 'navidad', redirectTo: 'sesiones-navidad' },
  { path: 'fotografa-en-queretaro', loadComponent: () => import('./pages/fotografa-en-queretaro/fotografa-en-queretaro.component').then(m => m.FotografaEnQueretaroComponent) },
  { path: 'blog', loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent) },
  { path: 'blog/:slug', loadComponent: () => import('./pages/blog-post/blog-post.component').then(m => m.BlogPostComponent) },
  { path: 'galeria/:slug', loadComponent: () => import('./pages/gallery-login/gallery-login.component').then(m => m.GalleryLoginComponent) },
  { path: 'galeria/:slug/ver', loadComponent: () => import('./pages/gallery-view/gallery-view.component').then(m => m.GalleryViewComponent) },
  // Oculta del menú pero accesible por URL directa (no eliminada)
  { path: 'dia-de-las-madres', loadComponent: () => import('./components/organisms/mothers-day/mothers-day.component').then(m => m.MothersDayComponent) },
  { path: '**', redirectTo: '' }
];
