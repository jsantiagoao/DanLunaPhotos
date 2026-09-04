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
 * Config de campaña que la landing consume del backend (`GET /availability` -> `config`).
 * Es un subconjunto: solo lo que la landing necesita para pintar el calendario. `weekly`
 * viene indexado como en el backend (lunes = 0) y se convierte al leer.
 */
export interface CampaignConfig {
  dates: {
    preventaStart: string;
    preventaEnd: string;
    seasonStart: string;
    seasonEndPreventa: string;
    seasonEndRegular: string;
  };
  agenda: {
    sessionMinutes: number;
    breakMinutes: number;
    presaleWeekendOnly: boolean;
    /** Clave: dia de la semana con lunes = 0 (como el backend). */
    weekly: Record<string, ReadonlyArray<readonly [string, number]>>;
  };
  /** Precios editables. La landing usa extraPersonPrice; los demas los resuelve el backend en `campaign`. */
  pricing?: {
    preventaPrice: number;
    regularPrice: number;
    totalSlots: number;
    apartado: number;
    extraPersonPrice: number;
  };
  /** Aforo y personas editables: mandan los selectores y validaciones del formulario. */
  attendees?: {
    included: number;
    maxExtra: number;
    aforo: number;
  };
  /** Contenido editable de la landing: nombre, textos, imagen de fondo e items de "que incluye". */
  content?: {
    name: string;
    subtitle: string;
    location: string;
    heroImage: string;
    includes: ReadonlyArray<{ icon: string; title: string; detail: string }>;
  };
}

/**
 * Respaldo si el backend aun no publica config: los valores actuales de la campaña.
 * `weekly` va con lunes = 0 (mie/jue 4 desde 16:00, vie 5, sab/dom 4+4).
 */
export const DEFAULT_CAMPAIGN_CONFIG: CampaignConfig = {
  dates: {
    preventaStart: '2026-09-18',
    preventaEnd: '2026-09-25',
    seasonStart: '2026-10-31',
    seasonEndPreventa: '2026-12-06',
    seasonEndRegular: '2026-12-14',
  },
  agenda: {
    sessionMinutes: 40,
    breakMinutes: 10,
    presaleWeekendOnly: true,
    weekly: {
      '0': [], '1': [],
      '2': [['16:00', 4]], '3': [['16:00', 4]], '4': [['16:00', 5]],
      '5': [['09:00', 4], ['14:30', 4]], '6': [['09:00', 4], ['14:30', 4]],
    },
  },
};

function cfg(config?: CampaignConfig): CampaignConfig {
  return config ?? DEFAULT_CAMPAIGN_CONFIG;
}

// Constantes de compatibilidad (defaults). Las funciones ahora leen de `config`.
export const SESSION_WINDOW_START = DEFAULT_CAMPAIGN_CONFIG.dates.seasonStart;
export const SESSION_WINDOW_END_PREVENTA = DEFAULT_CAMPAIGN_CONFIG.dates.seasonEndPreventa;
export const SESSION_WINDOW_END_REGULAR = DEFAULT_CAMPAIGN_CONFIG.dates.seasonEndRegular;
export const PREVENTA_START = DEFAULT_CAMPAIGN_CONFIG.dates.preventaStart;
export const PREVENTA_END = DEFAULT_CAMPAIGN_CONFIG.dates.preventaEnd;

/** 'YYYY-MM-DD' de una fecha local, sin pasar por Date (que interpreta UTC). */
function dateKeyOfDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Si la campaña esta en preventa hoy. Solo mira la fecha; el cupo lo cierra el backend. */
export function isPreventaActive(today: Date = new Date(), config?: CampaignConfig): boolean {
  const key = dateKeyOfDate(today);
  const d = cfg(config).dates;
  return key >= d.preventaStart && key <= d.preventaEnd;
}

/** Fin de la temporada segun el regimen vigente hoy. */
function sessionWindowEnd(today: Date, config?: CampaignConfig): string {
  const d = cfg(config).dates;
  return isPreventaActive(today, config) ? d.seasonEndPreventa : d.seasonEndRegular;
}

/** Si la fecha cae dentro de la temporada de sesiones vigente. */
export function isWithinSessionWindow(dateKey: string, today: Date = new Date(), config?: CampaignConfig): boolean {
  if (!dateKey) return false;
  return dateKey >= cfg(config).dates.seasonStart && dateKey <= sessionWindowEnd(today, config);
}

/** `getDay()` (domingo=0) -> índice del backend (lunes=0). */
function toBackendWeekday(getDayIndex: number): number {
  return getDayIndex === 0 ? 6 : getDayIndex - 1;
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

export function slotsForWeekday(weekday: number, config?: CampaignConfig): string[] {
  const agenda = cfg(config).agenda;
  const slotMin = agenda.sessionMinutes + agenda.breakMinutes;
  const blocks = agenda.weekly[String(toBackendWeekday(weekday))] ?? [];
  const slots: string[] = [];
  for (const [start, count] of blocks) {
    const startMin = toMinutes(start);
    if (startMin === null) continue;
    for (let i = 0; i < count; i++) slots.push(toTime(startMin + i * slotMin));
  }
  return slots.sort();
}

/** Fin de semana en `Date.getDay()`: sabado = 6, domingo = 0. */
function isWeekend(weekday: number): boolean {
  return weekday === 0 || weekday === 6;
}

export function slotsForDate(dateKey: string, today: Date = new Date(), config?: CampaignConfig): string[] {
  const weekday = weekdayOf(dateKey);
  if (weekday === null) return [];
  // Fuera de la temporada no hay sesiones.
  if (!isWithinSessionWindow(dateKey, today, config)) return [];
  // En preventa la campaña solo abre fin de semana (si la config lo pide).
  if (cfg(config).agenda.presaleWeekendOnly && isPreventaActive(today, config) && !isWeekend(weekday)) return [];
  return slotsForWeekday(weekday, config);
}

/** Un dia sin agenda: fuera de temporada, dia cerrado o restringido por preventa. */
export function isDayClosed(dateKey: string, today: Date = new Date(), config?: CampaignConfig): boolean {
  return slotsForDate(dateKey, today, config).length === 0;
}

/** Fin de la sesion que empieza a esa hora: es lo que se le muestra a la clienta. */
export function slotEnd(time: string, config?: CampaignConfig): string {
  const start = toMinutes(time);
  return start === null ? '' : toTime(start + cfg(config).agenda.sessionMinutes);
}

function overlaps(start: number, end: number, busy: BusyInterval): boolean {
  return start < busy.end && busy.start < end;
}

export function availableSlots(
  dateKey: string,
  intervals: readonly BusyInterval[],
  today: Date = new Date(),
  config?: CampaignConfig,
): string[] {
  if (!dateKey) return [];
  const delDia = (intervals || []).filter((i) => i.date === dateKey);
  const agenda = cfg(config).agenda;
  const slotMin = agenda.sessionMinutes + agenda.breakMinutes;

  return slotsForDate(dateKey, today, config).filter((slot) => {
    const start = toMinutes(slot)!;
    // El hueco ocupa la sesion mas su cambio: si no cabe completo, no se ofrece.
    return !delDia.some((busy) => overlaps(start, start + slotMin, busy));
  });
}

export function isDayFull(dateKey: string, intervals: readonly BusyInterval[], today: Date = new Date(), config?: CampaignConfig): boolean {
  return availableSlots(dateKey, intervals, today, config).length === 0;
}

/** 'YYYY-MM-DD' de un dia del calendario, sin pasar por Date (que interpreta UTC). */
export function dateKeyOf(day: number, month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
