/** Reglas de lo que ve la clienta al recibir su galería. Sin Angular ni HTTP. */

interface TitledGallery {
  title?: string;
  design?: { displayName?: string };
}

/** El nombre que configuró el estudio; si no hay, el título de la galería. */
export function galleryDisplayTitle(gallery: TitledGallery): string {
  return gallery.design?.displayName?.trim() || gallery.title || '';
}

/** Mensaje cuando la galería no se puede abrir. Null si es un error pasajero: se deja intentar. */
export function galleryAccessMessage(status: number): string | null {
  if (status === 410) return 'Esta galería ya venció. Escríbele a tu fotógrafa si necesitas verla de nuevo.';
  if (status === 404) return 'Esta galería no está disponible. Revisa el enlace o escríbele a tu fotógrafa.';
  return null;
}

/** La galería es una entrega privada: ahí no van los botones flotantes del sitio. */
export function isClientGalleryUrl(url: string): boolean {
  return /^\/galeria(\/|$|\?)/.test(url);
}

/** Con una foto a todo el ancho, la miniatura de 800 px se vería borrosa. */
export function gridImageUrl(photo: { thumbUrl: string; webUrl?: string }, gridLayout?: string): string {
  return gridLayout === 'single' ? photo.webUrl || photo.thumbUrl : photo.thumbUrl;
}
