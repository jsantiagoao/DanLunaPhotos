/**
 * Construye un string `srcset` de variantes webp por ancho a partir de una
 * imagen raster base.
 *
 * Funcion pura (sin Angular ni DOM) → testeable en aislamiento, cumple Single
 * Responsibility. El atomo AppImage la usa para el atributo `srcset` del
 * <source webp>, dejando que el navegador elija el tamano segun el viewport.
 *
 * Convencion de nombres (la comparte scripts/generate-webp.py):
 *   assets/x/foto.jpg  +  [400,800]  →  "assets/x/foto-400.webp 400w, assets/x/foto-800.webp 800w"
 *
 * Devuelve "" si la ruta no es raster o no hay anchos: el atomo entonces omite
 * el srcset y cae al comportamiento de un solo webp.
 */
const RASTER = /\.(jpe?g|png)$/i;

export function toWebpSrcset(src: string, widths: number[]): string {
  if (!src || !widths || widths.length === 0) return '';
  const [path] = src.split(/([?#].*)$/);
  if (!RASTER.test(path)) return '';

  const base = path.replace(RASTER, '');
  return [...widths]
    .sort((a, b) => a - b)
    .map((w) => `${base}-${w}.webp ${w}w`)
    .join(', ');
}
