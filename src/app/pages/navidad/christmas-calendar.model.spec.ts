import { buildChristmasMonth, monthLabel } from './christmas-calendar.model';
import type { BusyInterval } from './christmas-slots';

/**
 * La cuadricula del calendario navideño como dato.
 *
 * Se separa del componente por la misma razon por la que se separo en el panel: las
 * reglas de "que dia se puede tocar" son donde viven los errores, y en una plantilla
 * no se pueden probar. Ademas evita la trampa de siempre: `new Date('YYYY-MM-DD')`
 * es UTC y corre el dia.
 */
const HOY = new Date(2026, 10, 15); // 15 de noviembre de 2026

function ocupado(date: string, start: number, end: number): BusyInterval {
  return { date, start, end };
}

describe('buildChristmasMonth', () => {
  it('el mes empieza con los huecos de la semana anterior', () => {
    // Diciembre de 2026 empieza en martes; con semana de lunes, un hueco.
    const { cells } = buildChristmasMonth(12, 2026, [], HOY);
    expect(cells[0].day).toBeNull();
    expect(cells[1].day).toBe(1);
  });

  it('trae todos los dias del mes', () => {
    const { cells } = buildChristmasMonth(12, 2026, [], HOY);
    expect(cells.filter((c) => c.day !== null).length).toBe(31);
  });

  it('cada dia sabe su fecha en texto', () => {
    const { cells } = buildChristmasMonth(12, 2026, [], HOY);
    expect(cells.find((c) => c.day === 6)!.dateKey).toBe('2026-12-06');
  });

  it('un dia ya pasado no se puede elegir', () => {
    const { cells } = buildChristmasMonth(11, 2026, [], HOY);
    expect(cells.find((c) => c.day === 14)!.selectable).toBe(false);
  });

  it('hoy todavia se puede elegir', () => {
    const { cells } = buildChristmasMonth(11, 2026, [], HOY);
    expect(cells.find((c) => c.day === 15)!.selectable).toBe(true);
  });

  it('un lunes se marca cerrado, no lleno', () => {
    // 2026-12-07 es lunes: el estudio no abre. Decirle "sin lugares" a la clienta
    // seria mentirle — no es que se hayan agotado.
    const dia = buildChristmasMonth(12, 2026, [], HOY).cells.find((c) => c.day === 7)!;
    expect(dia.closed).toBe(true);
    expect(dia.full).toBe(false);
    expect(dia.selectable).toBe(false);
  });

  it('un sabado abierto no esta cerrado', () => {
    const dia = buildChristmasMonth(12, 2026, [], HOY).cells.find((c) => c.day === 5)!;
    expect(dia.closed).toBe(false);
    expect(dia.selectable).toBe(true);
  });

  it('un dia sin huecos libres se marca lleno', () => {
    const lleno = [ocupado('2026-12-06', 0, 1440)];
    const dia = buildChristmasMonth(12, 2026, lleno, HOY).cells.find((c) => c.day === 6)!;
    expect(dia.full).toBe(true);
    expect(dia.closed).toBe(false);
    expect(dia.selectable).toBe(false);
  });

  it('un dia con un solo hueco sigue disponible', () => {
    const casi = [ocupado('2026-12-06', 0, 1000)];
    const dia = buildChristmasMonth(12, 2026, casi, HOY).cells.find((c) => c.day === 6)!;
    expect(dia.selectable).toBe(true);
  });

  it('la ocupacion de otro dia no lo afecta', () => {
    const otro = [ocupado('2026-12-07', 0, 1440)];
    expect(buildChristmasMonth(12, 2026, otro, HOY).cells.find((c) => c.day === 6)!.selectable).toBe(true);
  });

  it('dice si se puede retroceder de mes', () => {
    expect(buildChristmasMonth(11, 2026, [], HOY).canGoBack).toBe(false);
    expect(buildChristmasMonth(12, 2026, [], HOY).canGoBack).toBe(true);
  });
});

describe('monthLabel', () => {
  it('se lee en español', () => {
    expect(monthLabel(12, 2026).toLowerCase()).toContain('diciembre');
  });

  it('incluye el año', () => {
    expect(monthLabel(12, 2026)).toContain('2026');
  });
});
