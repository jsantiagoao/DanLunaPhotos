/**
 * Reparte las fotos en columnas de izquierda a derecha, cada una en la más corta.
 *
 * `column-count` de CSS llena cada columna de arriba abajo y la fila de arriba deja de
 * seguir el orden de la galería. Misma función en masonry-columns.ts de Studio: lo que
 * Dan Luna ve al diseñar tiene que ser lo que ve la clienta. Si cambias una, cambia la otra.
 */
export function masonryColumns<T extends { width?: number; height?: number }>(photos: readonly T[], count: number): T[][] {
  const columns: T[][] = Array.from({ length: Math.max(1, count) }, () => []);
  const heights = columns.map(() => 0);
  for (const photo of photos) {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push(photo);
    heights[shortest] += photo.width && photo.height ? photo.height / photo.width : 1;
  }
  return columns;
}
