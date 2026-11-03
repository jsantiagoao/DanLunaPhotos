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

export type CoverTextPlacement = 'low' | 'high';

/**
 * Dónde va el texto de la portada: lejos del punto focal, que es donde suele estar
 * la cara. El sujeto casi siempre está al centro o arriba, así que por defecto va abajo.
 */
export function coverTextPlacement(focalY: number | undefined): CoverTextPlacement {
  return (focalY ?? 50) > 62 ? 'high' : 'low';
}

/** Reserva el alto real de la foto antes de que cargue, para que la página no salte. */
export function photoAspectRatio(photo: { width?: number; height?: number }, gridLayout?: string): string | null {
  if (gridLayout === 'grid' || gridLayout === 'horizontal') return null;
  return photo.width && photo.height ? `${photo.width} / ${photo.height}` : null;
}

const SWIPE_MIN_PX = 50;

/** Deslizar a la izquierda avanza. Un gesto más vertical que horizontal es scroll, no cambio de foto. */
export function swipeDirection(deltaX: number, deltaY: number): 'next' | 'prev' | null {
  if (Math.abs(deltaX) < SWIPE_MIN_PX || Math.abs(deltaX) <= Math.abs(deltaY)) return null;
  return deltaX < 0 ? 'next' : 'prev';
}

interface ShareDevice {
  share?: (data: { title: string; url: string }) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
}

/**
 * Comparte el enlace con lo que tenga el dispositivo y devuelve qué decirle a la clienta.
 * Null si no hay nada que decir: cerrar el menú de compartir no es un error.
 */
export async function shareLink(device: ShareDevice, title: string, url: string): Promise<string | null> {
  if (device.share) {
    try {
      await device.share({ title, url });
      return null;
    } catch (e) {
      if ((e as { name?: string })?.name === 'AbortError') return null;
    }
  }
  try {
    await device.clipboard!.writeText(url);
    return 'Enlace copiado';
  } catch {
    return `No se pudo copiar. Este es tu enlace: ${url}`;
  }
}

/** Con una foto a todo el ancho, la miniatura de 800 px se vería borrosa. */
export function gridImageUrl(photo: { thumbUrl: string; webUrl?: string }, gridLayout?: string): string {
  return gridLayout === 'single' ? photo.webUrl || photo.thumbUrl : photo.thumbUrl;
}
