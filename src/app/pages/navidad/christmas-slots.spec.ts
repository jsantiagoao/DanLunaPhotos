import {
  BREAK_MINUTES, SESSION_MINUTES, SLOT_MINUTES,
  availableSlots, isDayClosed, isDayFull, slotEnd, slotsForDate, type BusyInterval,
} from './christmas-slots';

/**
 * La agenda navideña: sesiones de 40 minutos con 10 de cambio, asi que los horarios
 * se abren cada 50 — la de 16:00 termina 16:40 y la siguiente empieza 16:50.
 *
 * No es igual todos los dias: lunes y martes cerrado, miercoles y jueves solo tarde,
 * el viernes una sesion mas y el fin de semana mañana y tarde.
 *
 * Son las mismas reglas que `shared/navidad.py`. El servidor vuelve a validarlas: esto
 * existe para no ofrecer lo que va a rechazar.
 */
const MIERCOLES = '2026-12-02';
const VIERNES = '2026-12-04';
const SABADO = '2026-12-05';
const DOMINGO = '2026-12-06';
const LUNES = '2026-12-07';

function ocupado(start: number, end: number, date = SABADO): BusyInterval {
  return { date, start, end };
}

describe('duracion', () => {
  it('la sesion dura 40 minutos', () => {
    expect(SESSION_MINUTES).toBe(40);
  });

  it('entre sesiones hay 10 minutos de cambio', () => {
    expect(BREAK_MINUTES).toBe(10);
  });

  it('por eso los horarios se abren cada 50', () => {
    expect(SLOT_MINUTES).toBe(50);
  });
});

describe('slotsForDate', () => {
  it('el miercoles hay cuatro sesiones por la tarde', () => {
    expect(slotsForDate(MIERCOLES)).toEqual(['16:00', '16:50', '17:40', '18:30']);
  });

  it('el viernes hay una mas', () => {
    expect(slotsForDate(VIERNES)).toEqual(['16:00', '16:50', '17:40', '18:30', '19:20']);
  });

  it('el sabado hay ocho, en mañana y tarde', () => {
    expect(slotsForDate(SABADO)).toEqual([
      '09:00', '09:50', '10:40', '11:30', '14:30', '15:20', '16:10', '17:00',
    ]);
  });

  it('el domingo tiene la misma agenda que el sabado', () => {
    expect(slotsForDate(DOMINGO)).toEqual(slotsForDate(SABADO));
  });

  it('el lunes no hay sesiones', () => {
    expect(slotsForDate(LUNES)).toEqual([]);
  });

  it('sin fecha no hay horarios', () => {
    expect(slotsForDate('')).toEqual([]);
  });
});

describe('slotEnd', () => {
  it('la sesion termina 40 minutos despues', () => {
    expect(slotEnd('16:00')).toBe('16:40');
  });

  it('la ultima de la mañana termina a las 12:10', () => {
    expect(slotEnd('11:30')).toBe('12:10');
  });

  it('la ultima de la tarde termina a las 17:40', () => {
    expect(slotEnd('17:00')).toBe('17:40');
  });
});

describe('isDayClosed', () => {
  it('el lunes esta cerrado', () => {
    expect(isDayClosed(LUNES)).toBe(true);
  });

  it('el sabado no', () => {
    expect(isDayClosed(SABADO)).toBe(false);
  });
});

describe('availableSlots', () => {
  it('sin ocupacion estan todos los del dia', () => {
    expect(availableSlots(MIERCOLES, [])).toEqual(slotsForDate(MIERCOLES));
  });

  it('una navideña ocupa su hueco y deja libre el siguiente', () => {
    // 09:50 ocupa 590-640; las 10:40 siguen libres.
    const libres = availableSlots(SABADO, [ocupado(590, 640)]);
    expect(libres).not.toContain('09:50');
    expect(libres).toContain('10:40');
  });

  it('una sesion regular de una hora con traslado se come varios huecos', () => {
    // 09:00 a 11:00 tapa 09:00, 09:50 y 10:40.
    const libres = availableSlots(SABADO, [ocupado(540, 660)]);
    expect(libres).toEqual(['11:30', '14:30', '15:20', '16:10', '17:00']);
  });

  it('la ocupacion de otro dia no estorba', () => {
    expect(availableSlots(SABADO, [ocupado(540, 660, DOMINGO)])).toEqual(slotsForDate(SABADO));
  });

  it('un dia bloqueado completo no deja nada', () => {
    expect(availableSlots(SABADO, [ocupado(0, 1440)])).toEqual([]);
  });

  it('un dia cerrado tampoco', () => {
    expect(availableSlots(LUNES, [])).toEqual([]);
  });
});

describe('isDayFull', () => {
  it('un dia sin huecos libres esta lleno', () => {
    expect(isDayFull(SABADO, [ocupado(0, 1440)])).toBe(true);
  });

  it('un dia con al menos un hueco no lo esta', () => {
    expect(isDayFull(SABADO, [ocupado(590, 640)])).toBe(false);
  });
});

describe('ventana de fechas', () => {
  // Mismas reglas que shared/navidad.py: la temporada va del 31-oct al 14-dic (regular)
  // o al 6-dic (preventa, solo findes). `today` decide el regimen.
  const HOY_PREVENTA = new Date(2026, 8, 20);   // 20 sep, dentro de 18-25
  const HOY_REGULAR = new Date(2026, 9, 15);    // 15 oct, despues del 25

  it('antes del 31 de octubre no hay sesiones', () => {
    expect(slotsForDate('2026-10-24', HOY_REGULAR)).toEqual([]);
  });

  it('el 31 de octubre abre', () => {
    expect(slotsForDate('2026-10-31', HOY_REGULAR).length).toBeGreaterThan(0);
  });

  it('en preventa solo abren sabados y domingos', () => {
    expect(slotsForDate('2026-12-02', HOY_PREVENTA)).toEqual([]);        // miercoles: cerrado
    expect(slotsForDate('2026-11-07', HOY_PREVENTA).length).toBeGreaterThan(0);  // sabado
  });

  it('la preventa no pasa del 6 de diciembre', () => {
    expect(slotsForDate('2026-12-12', HOY_PREVENTA)).toEqual([]);        // sabado fuera de ventana
    expect(slotsForDate('2026-12-06', HOY_PREVENTA).length).toBeGreaterThan(0);  // domingo, ultimo dia
  });

  it('en regular abre entre semana y llega hasta el 14 de diciembre', () => {
    expect(slotsForDate('2026-12-02', HOY_REGULAR).length).toBeGreaterThan(0);   // miercoles
    expect(slotsForDate('2026-12-12', HOY_REGULAR).length).toBeGreaterThan(0);   // sabado
    expect(slotsForDate('2026-12-19', HOY_REGULAR)).toEqual([]);        // fuera de ventana
  });

  it('lunes y martes cerrados tambien en regular', () => {
    expect(slotsForDate('2026-12-07', HOY_REGULAR)).toEqual([]);        // lunes
  });
});
