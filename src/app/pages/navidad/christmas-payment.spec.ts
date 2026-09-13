import { formatClabe, isValidClabe, resolvePaymentInfo, type PaymentInfo } from './christmas-payment';

const FALLBACK: PaymentInfo = {
  bank: 'BBVA', accountHolder: 'Daniela Luna', clabe: '012320001234567890',
};

describe('resolvePaymentInfo', () => {
  it('usa los datos de la config cuando existen', () => {
    const r = resolvePaymentInfo({ payment: { bank: 'Banorte', accountHolder: 'DL', clabe: '072000112233445566' } }, FALLBACK);
    expect(r?.bank).toBe('Banorte');
    expect(r?.clabe).toBe('072000112233445566');
  });

  it('cae al respaldo cuando la config no trae pago', () => {
    expect(resolvePaymentInfo({}, FALLBACK)?.bank).toBe('BBVA');
    expect(resolvePaymentInfo(null, FALLBACK)?.clabe).toBe('012320001234567890');
  });

  it('devuelve null cuando no hay datos ni respaldo', () => {
    expect(resolvePaymentInfo({}, null)).toBeNull();
    expect(resolvePaymentInfo(null, null)).toBeNull();
  });

  it('limpia la CLABE dejando solo dígitos', () => {
    const r = resolvePaymentInfo({ payment: { bank: 'X', clabe: '0123 2000 1234 5678 90' } }, null);
    expect(r?.clabe).toBe('012320001234567890');
  });

  it('normaliza instrucción vacía a undefined', () => {
    const r = resolvePaymentInfo({ payment: { bank: 'X', clabe: '1', instructions: '   ' } }, null);
    expect(r?.instructions).toBeUndefined();
  });
});

describe('formatClabe', () => {
  it('agrupa en bloques de 4', () => {
    expect(formatClabe('012320001234567890')).toBe('0123 2000 1234 5678 90');
  });
  it('cadena vacía queda vacía', () => {
    expect(formatClabe('')).toBe('');
  });
});

describe('isValidClabe', () => {
  it('acepta 18 dígitos', () => {
    expect(isValidClabe('012320001234567890')).toBe(true);
  });
  it('rechaza longitudes distintas', () => {
    expect(isValidClabe('12345')).toBe(false);
  });
});
