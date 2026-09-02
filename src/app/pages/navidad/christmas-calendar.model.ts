import { availableSlots, dateKeyOf, isDayClosed, type BusyInterval } from './christmas-slots';

/**
 * La cuadricula del calendario navideño, como dato.
 *
 * Separada del componente a proposito: "que dia se puede tocar" es donde viven los
 * errores de un calendario, y dentro de una plantilla no se puede probar. Ademas
 * concentra la trampa conocida: `new Date('YYYY-MM-DD')` se interpreta como UTC y
 * corre el dia uno hacia atras, asi que aqui las fechas se arman con numeros.
 */
export interface DayCell {
  /** `null` en los huecos previos al dia 1: la cuadricula empieza en lunes. */
  day: number | null;
  dateKey: string;
  past: boolean;
  /** El estudio no abre ese dia de la semana. Distinto de lleno. */
  closed: boolean;
  /** Abre, pero ya no quedan huecos. */
  full: boolean;
  selectable: boolean;
}

export interface ChristmasMonth {
  month: number;
  year: number;
  label: string;
  cells: DayCell[];
  /** No se retrocede antes del mes en curso: no se reserva en el pasado. */
  canGoBack: boolean;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function monthLabel(month: number, year: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}

/** Lunes = 0. `getDay()` cuenta desde domingo, y la semana aqui empieza en lunes. */
function firstWeekdayOffset(month: number, year: number): number {
  const weekday = new Date(year, month - 1, 1).getDay();
  return weekday === 0 ? 6 : weekday - 1;
}

function isPast(day: number, month: number, year: number, today: Date): boolean {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return new Date(year, month - 1, day) < start;
}

export function buildChristmasMonth(
  month: number,
  year: number,
  intervals: readonly BusyInterval[],
  today: Date = new Date(),
): ChristmasMonth {
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: DayCell[] = [];

  for (let i = 0; i < firstWeekdayOffset(month, year); i++) {
    cells.push({ day: null, dateKey: '', past: false, closed: false, full: false, selectable: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = dateKeyOf(day, month, year);
    const past = isPast(day, month, year, today);
    const closed = isDayClosed(dateKey);
    // Lleno solo se sabe mirando los huecos: caben varias sesiones al dia, asi que
    // "tiene sesiones" no significa "ya no cabe nadie". Y cerrado no es lleno: a la
    // clienta no se le dice "sin lugares" un dia en que el estudio no abre.
    const full = !past && !closed && availableSlots(dateKey, intervals).length === 0;
    cells.push({ day, dateKey, past, closed, full, selectable: !past && !closed && !full });
  }

  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  return {
    month,
    year,
    label: monthLabel(month, year),
    cells,
    canGoBack: year > currentYear || (year === currentYear && month > currentMonth),
  };
}
