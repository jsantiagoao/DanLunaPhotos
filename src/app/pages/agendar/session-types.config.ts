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
      { id: 'ceremonia', name: 'Ceremonia', price: 1850, fields: ['iglesia'] },
      { id: 'ceremonia_fiesta_1h', name: 'Ceremonia + Fiesta 1h', price: 2850, fields: ['iglesia', 'lugarFiesta'] },
      { id: 'ceremonia_fiesta_2h', name: 'Ceremonia + Fiesta 2h', price: 3950, fields: ['iglesia', 'lugarFiesta'] },
    ]
  },
  {
    id: 'embarazo',
    label: 'Embarazo',
    packages: [
      { id: 'estudio', name: 'Estudio', price: 1500, fields: [] },
      { id: 'exteriores', name: 'Exteriores', price: 2000, fields: ['ubicacion'] },
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
      { id: 'mini', name: 'Mini sesión 30min', price: 1200, fields: ['ubicacion'] },
      { id: 'completa', name: 'Sesión completa 1h', price: 2200, fields: ['ubicacion'] },
    ]
  },
  {
    id: 'xv',
    label: 'XV Años',
    packages: [
      { id: 'casual', name: 'Sesión casual', price: 2500, fields: ['ubicacion'] },
      { id: 'evento', name: 'Evento completo', price: 5000, fields: ['iglesia', 'salon'] },
    ]
  },
  {
    id: 'comunion',
    label: 'Primera Comunión',
    packages: [
      { id: 'ceremonia', name: 'Ceremonia', price: 1850, fields: ['iglesia'] },
      { id: 'ceremonia_evento', name: 'Ceremonia + Evento', price: 3000, fields: ['iglesia', 'lugarEvento'] },
    ]
  },
];

export const FIELD_LABELS: Record<string, string> = {
  iglesia: 'Iglesia / Lugar de ceremonia',
  lugarFiesta: 'Lugar de la fiesta',
  lugarEvento: 'Lugar del evento',
  ubicacion: 'Ubicación de la sesión',
  salon: 'Salón de evento',
};
