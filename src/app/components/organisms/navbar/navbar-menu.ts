import { whatsappUrl } from '../../../shared/contact-info';

export interface MenuLink {
  label: string;
  href: string;
  /** Sale del sitio (WhatsApp): se abre en otra pestaña. */
  external?: boolean;
}

export interface MenuItem {
  label: string;
  href?: string;
  submenu?: MenuLink[];
}

/** Secciones con id que existen en la home: las únicas anclas válidas del menú. */
export const HOME_SECTIONS = ['inicio', 'portfolio', 'sobre-mi', 'testimonios', 'contacto'] as const;

/**
 * Servicio sin página propia: abre WhatsApp con el servicio ya nombrado en el mensaje,
 * en lugar de un ancla a una sección que no existe (antes regresaba al inicio de la página).
 */
function askFor(label: string): MenuLink {
  return {
    label,
    href: whatsappUrl(`Hola, me interesa una sesión de ${label}. ¿Podrían darme más información?`),
    external: true,
  };
}

export const MAIN_MENU: MenuItem[] = [
  {
    label: 'Sesiones al Aire Libre',
    submenu: [
      askFor('En Pareja'),
      // Familiares y Smash the Cake tienen tarjeta en Sesiones Destacadas.
      { label: 'Familiares', href: '#portfolio' },
      { label: 'Smash the Cake', href: '#portfolio' },
    ],
  },
  {
    label: 'Estudio Fotográfico',
    submenu: [
      { label: 'Día de las Madres', href: '/dia-de-las-madres' },
      { label: 'Navidad', href: '/sesiones-navidad' },
      askFor('Personalizadas'),
    ],
  },
  {
    label: 'Eventos y Celebraciones',
    submenu: [
      { label: 'Bodas', href: '/fotografia-bodas-queretaro' },
      { label: 'Bautizos', href: '/fotografia-bautizo-queretaro' },
      askFor('Primera Comunión/Presentación'),
      askFor('Fiestas/Piñatas'),
      askFor('Graduaciones'),
    ],
  },
  {
    label: 'Fotografía Comercial',
    submenu: [askFor('Deportes'), askFor('Productos'), askFor('Perfil Profesional')],
  },
  { label: 'Contáctame', href: '#contacto' },
];
