/**
 * La agenda de las mini sesiones navideñas.
 *
 * La sesion dura 40 minutos y entre una y otra hay 10 de cambio, asi que los horarios
 * se abren cada 50: la de 16:00 termina a las 16:40 y la siguiente empieza a las 16:50.
 *
 * La agenda no es igual todos los dias — lunes y martes cerrado, entre semana solo
 * tarde, el fin de semana mañana y tarde — y por eso no sirve el calendario de
 * `/agendar`, que razona por horas iguales todos los dias.
 *
 * Son las mismas reglas que `shared/navidad.py` en el backend. La copia es deliberada:
 * el servidor vuelve a validar al reservar, y esto existe para no ofrecerle a nadie un
 * horario que va a ser rechazado.
 */
export interface BusyInterval {
  /** 'YYYY-MM-DD'. */
  date: string;
  /** Minutos desde la medianoche. */
  start: number;
  /** Exclusivo: dos citas contiguas caben. */
  end: number;
}

/** Bloque de agenda: hora de inicio y cuantas sesiones seguidas salen de ahi. */
export type ScheduleBlock = readonly [string, number];

export const SESSION_MINUTES = 40;
export const BREAK_MINUTES = 10;
export const SLOT_MINUTES = SESSION_MINUTES + BREAK_MINUTES;

/**
 * Ventana de fechas de sesion. Espeja shared/navidad.py: la temporada arranca igual
 * (31-oct) pero termina antes en preventa (6-dic) que en regular (14-dic), y en preventa
 * solo se abren fines de semana. Las fechas se comparan como texto 'YYYY-MM-DD', que
 * ordena cronologicamente y evita `new Date(texto)` (que corre el dia por UTC).
 */
export const SESSION_WINDOW_START = '2026-10-31';
export const SESSION_WINDOW_END_PREVENTA = '2026-12-06';
export const SESSION_WINDOW_END_REGULAR = '2026-12-14';

/** Preventa: 18 al 25 de septiembre de 2026 (inclusive). */
export const PREVENTA_START = '2026-09-18';
export const PREVENTA_END = '2026-09-25';

/** 'YYYY-MM-DD' de una fecha local, sin pasar por Date (que interpreta UTC). */
function dateKeyOfDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Si la campaña esta en preventa hoy. Solo mira la fecha; el cupo lo cierra el backend. */
export function isPreventaActive(today: Date = new Date()): boolean {
  const key = dateKeyOfDate(today);
  return key >= PREVENTA_START && key <= PREVENTA_END;
}

/** Fin de la temporada segun el regimen vigente hoy. */
function sessionWindowEnd(today: Date): string {
  return isPreventaActive(today) ? SESSION_WINDOW_END_PREVENTA : SESSION_WINDOW_END_REGULAR;
}

/** Si la fecha cae dentro de la temporada de sesiones vigente. */
export function isWithinSessionWindow(dateKey: string, today: Date = new Date()): boolean {
  if (!dateKey) return false;
  return dateKey >= SESSION_WINDOW_START && dateKey <= sessionWindowEnd(today);
}

/**
 * Agenda semanal, indexada como `Date.getDay()` (0 = domingo).
 *
 * Se declara con bloques `(inicio, número de sesiones)` porque asi lo definio el
 * estudio: cuatro sesiones desde las 16:00, ocho el fin de semana repartidas en dos
 * bloques. Escrito asi se verifica de un vistazo y no depende de si la hora final
 * era inclusiva.
 */
export const WEEKLY_SCHEDULE: Readonly<Record<number, readonly ScheduleBlock[]>> = {
  0: [['09:00', 4], ['14:30', 4]],   // domingo
  1: [],                             // lunes: cerrado
  2: [],                             // martes: cerrado
  3: [['16:00', 4]],                 // miércoles
  4: [['16:00', 4]],                 // jueves
  5: [['16:00', 5]],                 // viernes
  6: [['09:00', 4], ['14:30', 4]],   // sábado
};

export function toMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function toTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** El dia de la semana de 'YYYY-MM-DD', armado por partes: `new Date(texto)` es UTC. */
export function weekdayOf(dateKey: string): number | null {
  const [year, month, day] = (dateKey || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).getDay();
}

export function slotsForWeekday(weekday: number): string[] {
  const slots: string[] = [];
  for (const [start, count] of WEEKLY_SCHEDULE[weekday] ?? []) {
    const startMin = toMinutes(start);
    if (startMin === null) continue;
    for (let i = 0; i < count; i++) slots.push(toTime(startMin + i * SLOT_MINUTES));
  }
  return slots.sort();
}

/** Fin de semana en `Date.getDay()`: sabado = 6, domingo = 0. */
function isWeekend(weekday: number): boolean {
  return weekday === 0 || weekday === 6;
}

export function slotsForDate(dateKey: string, today: Date = new Date()): string[] {
  const weekday = weekdayOf(dateKey);
  if (weekday === null) return [];
  // Fuera de la temporada no hay sesiones.
  if (!isWithinSessionWindow(dateKey, today)) return [];
  // En preventa la campaña solo abre fin de semana.
  if (isPreventaActive(today) && !isWeekend(weekday)) return [];
  return slotsForWeekday(weekday);
}

/** Un dia sin agenda: fuera de temporada, dia cerrado o restringido por preventa. */
export function isDayClosed(dateKey: string, today: Date = new Date()): boolean {
  return slotsForDate(dateKey, today).length === 0;
}

/** Fin de la sesion que empieza a esa hora: es lo que se le muestra a la clienta. */
export function slotEnd(time: string): string {
  const start = toMinutes(time);
  return start === null ? '' : toTime(start + SESSION_MINUTES);
}

function overlaps(start: number, end: number, busy: BusyInterval): boolean {
  return start < busy.end && busy.start < end;
}

export function availableSlots(
  dateKey: string,
  intervals: readonly BusyInterval[],
  today: Date = new Date(),
): string[] {
  if (!dateKey) return [];
  const delDia = (intervals || []).filter((i) => i.date === dateKey);

  return slotsForDate(dateKey, today).filter((slot) => {
    const start = toMinutes(slot)!;
    // El hueco ocupa la sesion mas su cambio: si no cabe completo, no se ofrece.
    return !delDia.some((busy) => overlaps(start, start + SLOT_MINUTES, busy));
  });
}

export function isDayFull(dateKey: string, intervals: readonly BusyInterval[], today: Date = new Date()): boolean {
  return availableSlots(dateKey, intervals, today).length === 0;
}

/** 'YYYY-MM-DD' de un dia del calendario, sin pasar por Date (que interpreta UTC). */
export function dateKeyOf(day: number, month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
