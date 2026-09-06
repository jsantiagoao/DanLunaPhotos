/**
 * Perfiles de imagen responsive: encapsulan (widths + sizes) por contexto de uso.
 *
 * Un solo lugar donde vive "cuanto ocupa cada tipo de imagen en pantalla" (DRY).
 * Las plantillas solo declaran el perfil (`profile="card"`), no repiten literales
 * de widths/sizes. Agregar un perfil no obliga a tocar el atomo (Open/Closed).
 *
 * `sizes` describe el ancho renderizado por viewport para que el navegador elija
 * la variante webp adecuada del srcset.
 */
export interface ImageProfile {
  widths: number[];
  sizes: string;
}

export type ImageProfileName = 'hero' | 'card' | 'gallery' | 'portrait';

export const IMAGE_PROFILES: Record<ImageProfileName, ImageProfile> = {
  // Slider/hero a todo el ancho del viewport.
  hero: { widths: [800, 1200, 1600], sizes: '100vw' },
  // Cards del carrusel home: ~1/3 en desktop, casi completo en movil.
  card: { widths: [400, 800, 1200], sizes: '(max-width: 768px) 90vw, 33vw' },
  // Grid de galeria: 1 columna en movil, ~1/3 en desktop.
  gallery: { widths: [400, 800], sizes: '(max-width: 768px) 100vw, 33vw' },
  // Retrato de la fotografa: columna acotada.
  portrait: { widths: [400, 800], sizes: '(max-width: 768px) 90vw, 40vw' },
};

const EMPTY: ImageProfile = { widths: [], sizes: '' };

export function imageProfile(name: ImageProfileName): ImageProfile {
  return IMAGE_PROFILES[name] ?? EMPTY;
}
