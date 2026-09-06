/**
 * Deriva la ruta del hermano .webp a partir de una imagen raster.
 *
 * Funcion pura (sin dependencias de Angular ni DOM) → testeable en aislamiento,
 * cumple Single Responsibility. El atomo AppImage la usa para el <source webp>.
 *
 * Regla: reemplaza la ultima extension .jpg/.jpeg/.png por .webp. Si la ruta no
 * es una imagen raster reconocida, la devuelve intacta (no inventa un webp que
 * no existe).
 */
const RASTER = /\.(jpe?g|png)$/i;

export function toWebp(src: string): string {
  if (!src) return src;
  // Preserva querystring o hash si los hubiera (ej. cache-busting).
  const [path, ...rest] = src.split(/([?#].*)$/);
  if (!RASTER.test(path)) return src;
  const webp = path.replace(RASTER, '.webp');
  return rest.length ? webp + rest.join('') : webp;
}
