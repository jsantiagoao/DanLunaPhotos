import { GalleryPhoto } from './gallery.models';

/**
 * Logica pura del visor: filtrado y navegacion entre fotos.
 *
 * Sin Angular ni HTTP → testeable en aislamiento (Single Responsibility).
 * Extraida de gallery-view para adelgazar el componente y poder verificar el
 * comportamiento del filtro y del lightbox sin montar la vista.
 */

/** Fotos visibles segun el set activo y el toggle de favoritas. */
export function filterPhotos(
  photos: GalleryPhoto[],
  activeSet: string,
  favoritesOnly: boolean,
): GalleryPhoto[] {
  let list = photos;
  if (activeSet) list = list.filter((p) => p.set === activeSet);
  if (favoritesOnly) list = list.filter((p) => p.isFavorite);
  return list;
}

/**
 * Vecina de la foto actual (delta +1 siguiente, -1 anterior). Devuelve null en
 * los extremos: el lightbox no da la vuelta. `null` tambien si el id no existe.
 */
export function neighbourPhoto(
  photos: GalleryPhoto[],
  currentId: string | undefined,
  delta: number,
): GalleryPhoto | null {
  const idx = photos.findIndex((p) => p._id === currentId);
  if (idx === -1) return null;
  const target = idx + delta;
  return target >= 0 && target < photos.length ? photos[target] : null;
}
