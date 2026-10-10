/**
 * Preferencias del visitante que deciden si hay movimiento rico.
 *
 * Los efectos de puntero (magnético, inclinación, polvo de luz) solo con mouse y sin
 * `prefers-reduced-motion`. En táctil, con movimiento reducido o en el servidor (SSR)
 * la página queda completa y estática.
 */
type MediaWindow = Pick<Window, 'matchMedia'> | undefined | null;

const matches = (win: MediaWindow, query: string): boolean =>
  !!win && typeof win.matchMedia === 'function' && win.matchMedia(query).matches;

export function prefersReducedMotion(win: MediaWindow): boolean {
  return matches(win, '(prefers-reduced-motion: reduce)');
}

export function allowsPointerEffects(win: MediaWindow): boolean {
  return matches(win, '(hover: hover) and (pointer: fine)') && !prefersReducedMotion(win);
}
