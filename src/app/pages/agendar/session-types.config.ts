/**
 * Configuración de tipos de sesión y paquetes.
 * Usado por: Studio (crear/editar sesión) y Sitio público (agendar).
 */

export interface SessionPackage {
  id: string;
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
      { id: 'ceremonia', name: 'Ceremonia', price: 1850, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps'] },
      { id: 'ceremonia_fiesta_1h', name: 'Ceremonia + Fiesta 1h', price: 2850, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps', 'horaFiesta', 'lugarFiesta', 'lugarFiestaMaps'] },
      { id: 'ceremonia_fiesta_2h', name: 'Ceremonia + Fiesta 2h', price: 3950, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps', 'horaFiesta', 'lugarFiesta', 'lugarFiestaMaps'] },
    ]
  },
  {
    id: 'embarazo',
    label: 'Embarazo',
    packages: [
      { id: 'estudio', name: 'Estudio', price: 1500, fields: [] },
      { id: 'exteriores', name: 'Exteriores', price: 2000, fields: ['ubicacion', 'ubicacionMaps'] },
    ]
  },
  {
    id: 'newborn',
    label: 'Newborn',
    packages: [
      { id: 'basico', name: 'Básico', price: 1800, fields: [] },
      { id: 'premium', name: 'Premium', price: 2500, fields: [] },
    ]
  },
  {
    id: 'familia',
    label: 'Familia',
    packages: [
      { id: 'mini', name: 'Mini sesión 30min', price: 1200, fields: ['ubicacion', 'ubicacionMaps'] },
      { id: 'completa', name: 'Sesión completa 1h', price: 2200, fields: ['ubicacion', 'ubicacionMaps'] },
    ]
  },
  {
    id: 'xv',
    label: 'XV Años',
    packages: [
      { id: 'casual', name: 'Sesión casual', price: 2500, fields: ['ubicacion', 'ubicacionMaps'] },
      { id: 'evento', name: 'Evento completo', price: 5000, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps', 'horaEvento', 'salon', 'salonMaps'] },
    ]
  },
  {
    id: 'comunion',
    label: 'Primera Comunión',
    packages: [
      { id: 'ceremonia', name: 'Ceremonia', price: 1850, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps'] },
      { id: 'ceremonia_evento', name: 'Ceremonia + Evento', price: 3000, fields: ['horaCeremonia', 'iglesia', 'iglesiaMaps', 'horaEvento', 'lugarEvento', 'lugarEventoMaps'] },
    ]
  },
];

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
