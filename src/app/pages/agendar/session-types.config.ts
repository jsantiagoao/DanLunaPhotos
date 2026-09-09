/**
 * Configuración de tipos de sesión y paquetes.
 * Usado por: Studio (crear/editar sesión) y Sitio público (agendar).
 */

export interface SessionPackage {
  _id: string;       // id del paquete = _id de Mongo (ADR-005)
  name: string;
  price: number;
  fields: string[]; // campos adicionales requeridos
}

export interface SessionTypeConfig {
  id: string;
  label: string;
  packages: SessionPackage[];
}

export const SESSION_TYPES: SessionTypeConfig[] = [
  {
    id: 'bautizo',
    label: 'Bautizo',
    packages: [
      { _id: 'ceremonia', name: 'Ceremonia', price: 1850, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps'] },
      { _id: 'ceremonia_fiesta_1h', name: 'Ceremonia + Fiesta 1h', price: 2850, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps', 'horaFiesta', 'lugarFiesta', 'lugarFiestaMaps'] },
      { _id: 'ceremonia_fiesta_2h', name: 'Ceremonia + Fiesta 2h', price: 3950, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps', 'horaFiesta', 'lugarFiesta', 'lugarFiestaMaps'] },
    ]
  },
  {
    id: 'embarazo',
    label: 'Embarazo',
    packages: [
      { _id: 'estudio', name: 'Estudio', price: 1500, fields: [] },
      { _id: 'exteriores', name: 'Exteriores', price: 2000, fields: ['ubicacion', 'ubicacionMaps'] },
    ]
  },
  {
    id: 'newborn',
    label: 'Newborn',
    packages: [
      { _id: 'basico', name: 'Básico', price: 1800, fields: [] },
      { _id: 'premium', name: 'Premium', price: 2500, fields: [] },
    ]
  },
  {
    id: 'familia',
    label: 'Familia',
    packages: [
      { _id: 'mini', name: 'Mini sesión 30min', price: 1200, fields: ['ubicacion', 'ubicacionMaps'] },
      { _id: 'completa', name: 'Sesión completa 1h', price: 2200, fields: ['ubicacion', 'ubicacionMaps'] },
    ]
  },
  {
    id: 'xv',
    label: 'XV Años',
    packages: [
      { _id: 'casual', name: 'Sesión casual', price: 2500, fields: ['ubicacion', 'ubicacionMaps'] },
      { _id: 'evento', name: 'Evento completo', price: 5000, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps', 'horaEvento', 'salon', 'salonMaps'] },
    ]
  },
  {
    id: 'comunion',
    label: 'Primera Comunión',
    packages: [
      { _id: 'ceremonia', name: 'Ceremonia', price: 1850, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps'] },
      { _id: 'ceremonia_evento', name: 'Ceremonia + Fiesta 1hr', price: 2400, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps', 'horaEvento', 'lugarEvento', 'lugarEventoMaps'] },
    ]
  },
  {
    id: 'set_personalizada',
    label: 'Sesión en Set Personalizada',
    packages: [
      { _id: 'set_personalizada', name: 'Set Personalizada', price: 1800, fields: [] },
    ]
  },
  {
    id: 'sesion_exterior',
    label: 'Sesión Exterior',
    packages: [
      { _id: 'sesion_exterior', name: 'Sesión Exterior', price: 2000, fields: [] },
    ]
  },
];

/**
 * Tipos de sesión que NO se agendan por el flujo genérico de /agendar porque tienen su
 * propio calendario/landing (p. ej. la campaña navideña vive en /sesiones-navidad). El
 * backend /packages los devuelve porque Studio sí los administra; la landing pública los
 * excluye aquí. Añadir un tipo a esta lista lo saca del selector de /agendar.
 */
export const SELF_SERVICE_EXCLUDED_TYPES: readonly string[] = ['navidad'];

/** Deja solo los tipos agendables por el flujo genérico (quita los de flujo propio). */
export function filterBookableTypes(types: SessionTypeConfig[]): SessionTypeConfig[] {
  return types.filter((t) => !SELF_SERVICE_EXCLUDED_TYPES.includes(t.id));
}

export const FIELD_LABELS: Record<string, string> = {
  horaCeremonia: 'Hora de ceremonia',
  horaFiesta: 'Hora de fiesta',
  horaEvento: 'Hora del evento',
  iglesia: 'Iglesia / Lugar de ceremonia',
  iglesiaMaps: 'URL Google Maps (iglesia)',
  lugarFiesta: 'Lugar de la fiesta',
  lugarFiestaMaps: 'URL Google Maps (fiesta)',
  lugarEvento: 'Lugar del evento',
  lugarEventoMaps: 'URL Google Maps (evento)',
  ubicacion: 'Ubicación de la sesión',
  ubicacionMaps: 'URL Google Maps (ubicación)',
  salon: 'Salón de evento',
  salonMaps: 'URL Google Maps (salón)',
};

export const FIELD_TYPES: Record<string, string> = {
  horaCeremonia: 'time',
  horaFiesta: 'time',
  horaEvento: 'time',
  iglesiaMaps: 'url',
  lugarFiestaMaps: 'url',
  lugarEventoMaps: 'url',
  ubicacionMaps: 'url',
  salonMaps: 'url',
};
