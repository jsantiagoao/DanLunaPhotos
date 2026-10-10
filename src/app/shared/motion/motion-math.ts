/**
 * Matemática pura de los efectos de la landing "Cuarto oscuro".
 *
 * Sin DOM ni Angular: las directivas miden el elemento, llaman aquí y escriben el
 * resultado en estilos. Así cada regla (máximo de inclinación, curva de los contadores,
 * velocidad de escritura) queda probada sin renderizar.
 */
export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Ratio {
  x: number;
  y: number;
}

/** Inclinación máxima de una tarjeta, en grados: sutil, para no marear. */
export const MAX_TILT_DEG = 6;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const noNegZero = (n: number) => (Object.is(n, -0) ? 0 : n);

/** Posición del puntero relativa al centro del elemento, en [-1, 1]. */
export function pointerRatio(clientX: number, clientY: number, b: Box): Ratio {
  if (b.width <= 0 || b.height <= 0) return { x: 0, y: 0 };
  return {
    x: noNegZero(clamp(((clientX - b.left) / b.width) * 2 - 1, -1, 1)),
    y: noNegZero(clamp(((clientY - b.top) / b.height) * 2 - 1, -1, 1)),
  };
}

/** Desplazamiento de un botón magnético: lo acerca al puntero hasta `max` px. */
export function magneticOffset(r: Ratio, max: number): Ratio {
  return { x: noNegZero(r.x * max), y: noNegZero(r.y * max) };
}

/** Inclinación 3D: el borde más cercano al puntero se acerca al visitante. */
export function tiltAngles(r: Ratio, maxDeg = MAX_TILT_DEG): { rotateX: number; rotateY: number } {
  const max = Math.min(Math.abs(maxDeg), MAX_TILT_DEG);
  return { rotateX: noNegZero(-r.y * max), rotateY: noNegZero(r.x * max) };
}

export function easeOutCubic(t: number): number {
  const p = clamp(t, 0, 1);
  return 1 - Math.pow(1 - p, 3);
}

/** Valor de un contador animado en `progress` ∈ [0, 1], con `decimals` fijos. */
export function countUpValue(target: number, progress: number, decimals: number): string {
  return (target * easeOutCubic(progress)).toFixed(decimals);
}

/** Índice circular (palabras rotando, carruseles). */
export function wrapIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

/** Texto que se "escribe solo": cuánto se ve tras `elapsedMs` a `charsPerSecond`. */
export function typedText(text: string, elapsedMs: number, charsPerSecond: number): string {
  const count = Math.floor((Math.max(0, elapsedMs) / 1000) * charsPerSecond);
  return text.slice(0, clamp(count, 0, text.length));
}

/** Tarjeta activa de un carrusel con scroll-snap, a partir del desplazamiento horizontal. */
export function activeSlide(scrollLeft: number, slideWidth: number, count: number): number {
  if (slideWidth <= 0 || count <= 0) return 0;
  return clamp(Math.round(scrollLeft / slideWidth), 0, count - 1);
}
