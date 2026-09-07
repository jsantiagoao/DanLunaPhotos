/**
 * Logica pura de navegacion circular del carrusel (sin Angular ni DOM).
 *
 * Single Responsibility: solo calcula el siguiente/anterior indice con wrap.
 * Extraida para testear en aislamiento y reutilizar en cualquier carrusel,
 * eliminando la duplicacion que habia en bautizos/bodas (DRY).
 */
export function nextIndex(current: number, total: number): number {
  if (total <= 1) return 0;
  return (current + 1) % total;
}

export function prevIndex(current: number, total: number): number {
  if (total <= 1) return 0;
  return (current - 1 + total) % total;
}
