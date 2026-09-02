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
  { icon: 'clock', title: '40 minutos de sesión', detail: 'En nuestro set navideño, con mini set editorial incluido' },
  { icon: 'camera', title: '45 fotografías digitales', detail: 'En alta calidad y con edición' },
  { icon: 'users', title: 'Hasta 5 personas', detail: `Persona extra $${EXTRA_PERSON_PRICE} c/u · hasta 3 más, aforo máximo 8` },
  { icon: 'palette', title: 'Guía de outfit', detail: 'Con la paleta de colores recomendada para la familia' },
  { icon: 'gallery', title: 'Entrega en 10 a 15 días hábiles', detail: 'En tu galería digital privada' },
  { icon: 'paw', title: 'Pet friendly', detail: 'Tu mascota es parte de la familia' },
];
