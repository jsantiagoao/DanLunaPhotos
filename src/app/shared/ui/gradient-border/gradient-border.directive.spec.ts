import { GradientBorderDirective } from './gradient-border.directive';

/**
 * Efecto de contorno: un borde de gradiente que sigue al cursor. La única lógica con
 * riesgo es traducir la posición del puntero a coordenadas relativas al elemento (0..1),
 * que es lo que aquí se prueba de forma pura (sin DOM ni render).
 */
describe('GradientBorderDirective', () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 } as DOMRect;

  it('el cursor en la esquina superior izquierda da (0, 0)', () => {
    expect(GradientBorderDirective.relativePosition(100, 50, rect)).toEqual({ x: 0, y: 0 });
  });

  it('el cursor en el centro da (0.5, 0.5)', () => {
    expect(GradientBorderDirective.relativePosition(200, 100, rect)).toEqual({ x: 0.5, y: 0.5 });
  });

  it('el cursor en la esquina inferior derecha da (1, 1)', () => {
    expect(GradientBorderDirective.relativePosition(300, 150, rect)).toEqual({ x: 1, y: 1 });
  });

  it('acota fuera del elemento al rango [0, 1]', () => {
    // Cursor a la izquierda y arriba del elemento -> se recorta a 0.
    expect(GradientBorderDirective.relativePosition(0, 0, rect)).toEqual({ x: 0, y: 0 });
    // Cursor muy a la derecha y abajo -> se recorta a 1.
    expect(GradientBorderDirective.relativePosition(999, 999, rect)).toEqual({ x: 1, y: 1 });
  });
});
