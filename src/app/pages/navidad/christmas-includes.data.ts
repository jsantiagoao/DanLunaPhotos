/**
 * Contenido de la campaña navideña 2026, tal como lo definio el estudio en
 * `que incluye.txt`. Vive como dato para ajustarlo sin tocar la plantilla.
 */
export const CAMPAIGN_NAME = 'NOËL TALE';
export const CAMPAIGN_SUBTITLE = 'Christmas Sessions 2026';
export const LOCATION = 'Residencial El Refugio, Querétaro';

/** Lo que se aparta para reservar. Es el mismo monto en preventa y en precio regular. */
export const APARTADO_AMOUNT = 500;

/** Mas alla de las 5 personas incluidas. */
export const EXTRA_PERSON_PRICE = 250;

export interface IncludeItem {
  /** Nombre del icono inline que dibuja la pagina. */
  icon: 'clock' | 'camera' | 'users' | 'palette' | 'gallery' | 'paw';
  title: string;
  detail: string;
}

export const CHRISTMAS_INCLUDES: readonly IncludeItem[] = [
  { icon: 'clock', title: '40 minutos en nuestro set navideño', detail: 'Con mini set editorial incluido' },
  { icon: 'camera', title: '+30 fotografías digitales', detail: 'En alta calidad y con edición editorial' },
  { icon: 'users', title: '5 personas por sesión', detail: `Persona extra $${EXTRA_PERSON_PRICE} c/u · máximo 3 personas extra` },
  { icon: 'palette', title: 'Guía de outfits', detail: '' },
  { icon: 'gallery', title: 'Entrega entre 8 a 10 días', detail: '' },
  { icon: 'paw', title: 'Pet friendly', detail: 'Tu mascota es parte de la familia' },
];
