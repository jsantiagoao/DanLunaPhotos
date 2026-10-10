import { allowsPointerEffects, prefersReducedMotion } from './motion-env';

const REDUCE = '(prefers-reduced-motion: reduce)';
const FINE = '(hover: hover) and (pointer: fine)';
const win = (active: string[]) => ({ matchMedia: (q: string) => ({ matches: active.includes(q) }) as MediaQueryList });

describe('motion-env', () => {
  it('detecta movimiento reducido', () => {
    expect(prefersReducedMotion(win([REDUCE]))).toBe(true);
    expect(prefersReducedMotion(win([]))).toBe(false);
  });

  it('efectos de puntero solo con mouse y sin movimiento reducido', () => {
    expect(allowsPointerEffects(win([FINE]))).toBe(true);
    expect(allowsPointerEffects(win([]))).toBe(false);
    expect(allowsPointerEffects(win([FINE, REDUCE]))).toBe(false);
  });

  it('en el servidor no hay efectos', () => {
    expect(allowsPointerEffects(undefined)).toBe(false);
    expect(prefersReducedMotion(null)).toBe(false);
  });
});
