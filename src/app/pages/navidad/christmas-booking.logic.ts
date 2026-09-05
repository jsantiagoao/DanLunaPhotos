import { slotEnd } from './christmas-slots';

/**
 * Reglas del formulario de reserva navideña.
 *
 * Fuera del componente para poder probarlas sin renderizar nada, y en funciones puras
 * para que la pagina se limite a orquestar. Es el gemelo de `shared/navidad.py`: el
 * servidor valida lo mismo, aqui se valida para avisar antes de enviar.
 */
/**
 * Id del paquete navideño en el catalogo `packages`.
 *
 * Viaja en la reserva para que en el panel la sesion se vea con su nombre y su
 * precio de catalogo, como cualquier otra.
 */
export const CHRISTMAS_PACKAGE_ID = 'noel_tale';

export const MAX_PERSONAS = 5;
/** Se pueden agregar hasta 3 personas mas, sin pasar del aforo del set. */
export const MAX_PERSONAS_EXTRA = 3;
/** Aforo fisico del set: no depende de lo que la clienta quiera pagar. */
export const MAX_AFORO = 8;
export const EXTRA_PERSON_PRICE = 250;

/**
 * Limites y precio de aforo de la campaña. Editables por Daniela desde Studio; el backend
 * los publica en `config.attendees` / `config.pricing`. Las constantes de arriba son solo
 * el respaldo si la config no llego. Se inyectan a las funciones puras para no acoplar las
 * reglas a un valor fijo (mismo patron que `shared/navidad.py`).
 */
export interface CampaignLimits {
  maxPersonas: number;
  maxExtra: number;
  aforo: number;
  extraPrice: number;
}

export const DEFAULT_LIMITS: CampaignLimits = {
  maxPersonas: MAX_PERSONAS,
  maxExtra: MAX_PERSONAS_EXTRA,
  aforo: MAX_AFORO,
  extraPrice: EXTRA_PERSON_PRICE,
};
export const PET_SIZES = ['chico', 'mediano', 'grande'] as const;
export const MAX_PETICION = 500;
// Reexportado desde la fuente compartida para no tener dos numeros en el repo.
// Se importa ademas de reexportar porque whatsappConfirmUrl lo usa aqui mismo.
import { WHATSAPP_NUMBER } from '../../shared/contact-info';
export { WHATSAPP_NUMBER };

export type PetSize = (typeof PET_SIZES)[number] | '';

export interface ChristmasForm {
  name: string;
  email: string;
  phone: string;
  personas: number;
  personasExtra: number;
  mascota: boolean;
  mascotaTamano: PetSize;
  mascotaNombre: string;
  peticionEspecial: string;
  date: string;
  time: string;
}

export interface ChristmasBookingRequest {
  name: string;
  email: string;
  phone: string;
  type: 'navidad';
  package: string;
  date: string;
  time: string;
  details: Record<string, any>;
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function emptyChristmasForm(): ChristmasForm {
  return {
    name: '', email: '', phone: '',
    personas: 1,
    personasExtra: 0,
    // El consentimiento de traer mascota se declara, no se presume: el set se
    // prepara distinto y Daniela necesita saberlo de antemano.
    mascota: false,
    mascotaTamano: '',
    mascotaNombre: '',
    peticionEspecial: '',
    date: '', time: '',
  };
}

function digits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/** El primer problema del formulario, en la voz con la que se le habla a la clienta. */
export function validateChristmasForm(form: ChristmasForm, limits: CampaignLimits = DEFAULT_LIMITS): string | null {
  if ((form.name || '').trim().length < 3) return 'Escribe tu nombre completo';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '')) return 'Escribe un correo electrónico válido';
  if (digits(form.phone).length !== 10) return 'El teléfono debe tener 10 dígitos';

  const personas = Number(form.personas);
  if (!personas || personas < 1 || personas > limits.maxPersonas) {
    return `El número de personas debe estar entre 1 y ${limits.maxPersonas}`;
  }

  const extra = Number(form.personasExtra) || 0;
  if (extra < 0 || extra > limits.maxExtra) {
    return `Puedes agregar hasta ${limits.maxExtra} personas extra`;
  }
  if (personas + extra > limits.aforo) {
    return `En el set caben hasta ${limits.aforo} personas`;
  }

  if (form.mascota) {
    if (!PET_SIZES.includes(form.mascotaTamano as any)) return 'Elige el tamaño de tu mascota';
    if (!(form.mascotaNombre || '').trim()) return 'Escribe el nombre de tu mascota';
  }

  if ((form.peticionEspecial || '').length > MAX_PETICION) {
    return `La petición especial no puede pasar de ${MAX_PETICION} caracteres`;
  }

  if (!form.date || !form.time) return 'Elige el día y el horario de tu sesión';

  return null;
}

/**
 * El cuerpo que espera `POST /booking/reserve`.
 *
 * Lo que la clienta descarto no viaja: si contesto que no lleva mascota, el nombre
 * que alcanzo a escribir no se manda ni se guarda.
 */
export function toBookingRequest(form: ChristmasForm): ChristmasBookingRequest {
  const details: Record<string, any> = {
    personas: Number(form.personas),
    mascota: !!form.mascota,
  };

  // Sin extras no se manda el campo: un cero no dice nada que la ausencia no diga.
  const extra = Number(form.personasExtra) || 0;
  if (extra > 0) details['personasExtra'] = extra;

  if (form.mascota) {
    details['mascotaTamano'] = form.mascotaTamano;
    details['mascotaNombre'] = (form.mascotaNombre || '').trim();
  }

  const peticion = (form.peticionEspecial || '').trim();
  if (peticion) details['peticionEspecial'] = peticion;

  return {
    name: (form.name || '').trim(),
    email: (form.email || '').trim(),
    phone: digits(form.phone),
    type: 'navidad',
    package: CHRISTMAS_PACKAGE_ID,
    date: form.date,
    time: form.time,
    details,
  };
}

/** Lo que se va a cobrar: el precio de la sesion mas las personas extra. */
export function sessionTotal(basePrice: number, form: ChristmasForm, extraPrice: number = EXTRA_PERSON_PRICE): number {
  return basePrice + Math.max(0, Number(form.personasExtra) || 0) * extraPrice;
}

/** Lo minimo que necesita saber el aviso del precio, sin acoplarse a toda la campaña. */
interface CampaignPrice {
  price: number;
}

/**
 * Aviso cuando el precio cambio entre que la clienta abrio el formulario y lo envio.
 *
 * La preventa puede agotarse mientras llena sus datos: el servidor cobrara el precio
 * correcto, pero ella vio otro. Se le avisa solo si el precio SUBIO (lo que la
 * perjudica); si bajo, no hay nada que advertir. Devuelve el mensaje o `null`.
 */
export function priceChangeNotice(
  seenPrice: number | null,
  campaign: CampaignPrice | null,
): string | null {
  if (!seenPrice || !campaign) return null;
  if (campaign.price <= seenPrice) return null;
  return `El precio de preventa se agotó. Tu sesión ahora cuesta $${campaign.price.toLocaleString('es-MX')}.`;
}

/** '2026-12-06' -> '6 de diciembre'. Se parte el texto: `new Date` lo leeria como UTC. */
export function humanDate(dateKey: string): string {
  const [, month, day] = (dateKey || '').split('-');
  if (!month || !day) return '';
  return `${Number(day)} de ${MONTHS[Number(month) - 1]}`;
}

/** La ventana de la sesion tal como se le muestra: '09:25 a 09:45 h'. */
export function humanSlot(time: string): string {
  return time ? `${time} a ${slotEnd(time)} h` : '';
}

/**
 * El mensaje con el que la clienta confirma su lugar.
 *
 * La reserva nace pendiente: se confirma cuando llega el comprobante del apartado.
 * Por eso el mensaje ya viene escrito — pedirle que redacte es perder reservas.
 */
export function whatsappConfirmUrl(form: ChristmasForm): string {
  const texto = [
    `¡Hola! Soy ${(form.name || '').trim()}.`,
    `Aparté mi sesión navideña del ${humanDate(form.date)} a las ${form.time}.`,
    'Les envío mi comprobante del apartado para confirmar mi lugar.',
  ].join(' ');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
}
