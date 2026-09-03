export interface BusySlot {
  date: string;
  time: string | null;
  /** 'traslado' es la hora puente que el backend agrega tras cada sesion. */
  type: 'session' | 'traslado' | 'blocked';
}

/** Estado de la campaña navideña: que precio corre hoy y cuanta preventa queda. */
export interface CampaignStatus {
  name: string;
  price: number;
  regularPrice: number;
  preventaActive: boolean;
  /** 'YYYY-MM-DD', ultimo dia de preventa inclusive. */
  preventaEndsOn: string;
  spotsLeft: number;
  apartado: number;
  sessionMinutes: number;
}

export interface AvailabilityResponse {
  month: number;
  year: number;
  busySlots: BusySlot[];
  /**
   * Ocupacion en minutos desde la medianoche. La agrego el calendario navideño,
   * cuyos huecos son de 25 minutos y no caben en una etiqueta por hora.
   * Opcional: `/agendar` sigue leyendo `busySlots` y no la necesita.
   */
  intervals?: { date: string; start: number; end: number }[];
  /** Solo lo consume la pagina navideña; `/agendar` lo ignora. */
  campaign?: CampaignStatus;
}

export interface BookingRequest {
  name: string;
  email: string;
  phone: string;
  type: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  /** Datos propios del tipo de sesion (en Navidad: personas, mascota, peticion). */
  details?: Record<string, any>;
}

export interface BookingResponse {
  message: string;
  sessionId: string;
  date: string;
  time: string;
}
