/**
 * Matemática pura de scroll (sin DOM), probada aparte: estado del header y parallax.
 */

/** A partir de aquí el header se compacta (sombra, fondo translúcido, logo menor). */
const COMPACT_AFTER = 40;
/** Antes de esta altura (el hero) el header nunca se oculta. */
const HIDE_AFTER = 400;
/** Movimientos menores se ignoran: evita parpadeos por el rebote del scroll en móvil. */
const JITTER = 8;

export interface HeaderState {
  scrolled: boolean;
  hidden: boolean;
}

/**
 * Header que se compacta al bajar, se oculta al seguir bajando y reaparece al subir.
 * Con el menú móvil abierto nunca se oculta.
 */
export function headerState(prevY: number, y: number, menuOpen: boolean, wasHidden = false): HeaderState {
  const scrolled = y > COMPACT_AFTER;
  if (menuOpen || y < HIDE_AFTER) return { scrolled, hidden: false };
  const delta = y - prevY;
  if (Math.abs(delta) < JITTER) return { scrolled, hidden: wasHidden };
  return { scrolled, hidden: delta > 0 };
}

/** Desplazamiento vertical (px) de parallax: 0 con el elemento centrado en la ventana. */
export function parallaxOffset(top: number, height: number, viewport: number, strength: number): number {
  return -((top + height / 2) - viewport / 2) * strength;
}
