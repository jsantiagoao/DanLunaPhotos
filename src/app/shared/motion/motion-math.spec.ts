import {
  clamp, pointerRatio, magneticOffset, tiltAngles, easeOutCubic,
  countUpValue, wrapIndex, typedText, activeSlide, MAX_TILT_DEG,
} from './motion-math';

const box = { left: 100, top: 100, width: 200, height: 100 };

describe('motion-math', () => {
  describe('pointerRatio', () => {
    it('es 0,0 en el centro y ±1 en los bordes', () => {
      expect(pointerRatio(200, 150, box)).toEqual({ x: 0, y: 0 });
      expect(pointerRatio(100, 100, box)).toEqual({ x: -1, y: -1 });
      expect(pointerRatio(300, 200, box)).toEqual({ x: 1, y: 1 });
    });

    it('acota el puntero que sale del elemento y tolera tamaño cero', () => {
      expect(pointerRatio(9999, -50, box)).toEqual({ x: 1, y: -1 });
      expect(pointerRatio(5, 5, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 0, y: 0 });
    });
  });

  describe('magneticOffset', () => {
    it('atrae el botón hacia el puntero sin pasar del máximo', () => {
      const o = magneticOffset({ x: 1, y: -1 }, 12);
      expect(o).toEqual({ x: 12, y: -12 });
    });

    it('no mueve el botón con el puntero al centro', () => {
      expect(magneticOffset({ x: 0, y: 0 }, 12)).toEqual({ x: 0, y: 0 });
    });
  });

  describe('tiltAngles', () => {
    it('inclina hacia el puntero sin superar el máximo', () => {
      const t = tiltAngles({ x: 1, y: -1 }, 99);
      expect(Math.abs(t.rotateX)).toBeLessThanOrEqual(MAX_TILT_DEG);
      expect(Math.abs(t.rotateY)).toBeLessThanOrEqual(MAX_TILT_DEG);
      expect(t.rotateY).toBeGreaterThan(0);
      expect(t.rotateX).toBeGreaterThan(0);
    });
  });

  describe('easeOutCubic / countUpValue', () => {
    it('la curva va de 0 a 1', () => {
      expect(easeOutCubic(0)).toBe(0);
      expect(easeOutCubic(1)).toBe(1);
      expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
    });

    it('cuenta hasta el valor final con los decimales pedidos', () => {
      expect(countUpValue(5, 1, 1)).toBe('5.0');
      expect(countUpValue(4, 0, 0)).toBe('0');
      expect(countUpValue(4, 1, 0)).toBe('4');
    });

    it('acota el progreso fuera de rango', () => {
      expect(countUpValue(10, 2, 0)).toBe('10');
      expect(countUpValue(10, -1, 0)).toBe('0');
    });
  });

  describe('wrapIndex', () => {
    it('da la vuelta en ambos sentidos', () => {
      expect(wrapIndex(4, 4)).toBe(0);
      expect(wrapIndex(-1, 4)).toBe(3);
      expect(wrapIndex(2, 0)).toBe(0);
    });
  });

  describe('typedText', () => {
    it('escribe a la velocidad pedida y se detiene al final', () => {
      expect(typedText('Hola mundo', 0, 20)).toBe('');
      expect(typedText('Hola mundo', 200, 20)).toBe('Hola');
      expect(typedText('Hola mundo', 99999, 20)).toBe('Hola mundo');
    });
  });

  it('clamp acota', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
  });
});

describe('activeSlide (puntos del carrusel)', () => {
  it('toma la tarjeta más visible según el desplazamiento', () => {
    expect(activeSlide(0, 300, 4)).toBe(0);
    expect(activeSlide(160, 300, 4)).toBe(1);
    expect(activeSlide(899, 300, 4)).toBe(3);
  });

  it('nunca sale del rango ni divide entre cero', () => {
    expect(activeSlide(99999, 300, 4)).toBe(3);
    expect(activeSlide(50, 0, 4)).toBe(0);
  });
});
