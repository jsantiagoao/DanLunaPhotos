/**
 * Datos de contacto del estudio — fuente unica.
 *
 * Estaban repetidos a mano en una docena de archivos y se habian desincronizado:
 * los enlaces de WhatsApp apuntaban al 442 490 6891 mientras que la seccion de
 * contacto, el chatbot y los tres bloques de JSON-LD anunciaban un 56 6770 4976
 * que ya no se usa. Google lee el telefono del JSON-LD para el Knowledge Panel,
 * asi que la contradiccion no era solo cosmetica.
 *
 * Cualquier telefono, handle o correo nuevo se agrega aqui, no en el componente.
 */

/** Solo digitos, formato wa.me (52 = Mexico). */
export const WHATSAPP_NUMBER = '524424906891';

/** E.164, el formato que espera schema.org en `telephone`. */
export const WHATSAPP_E164 = '+524424906891';

/** Como se muestra a una persona. */
export const WHATSAPP_DISPLAY = '+52 442 490 6891';

export const INSTAGRAM_HANDLE = '@danlunaphotos';
export const INSTAGRAM_URL = 'https://www.instagram.com/danlunaphotos';
export const FACEBOOK_URL = 'https://www.facebook.com/people/Dan-Luna-Photo/61574229764276';

export const CONTACT_EMAIL = 'hola@danlunaphoto.com';
export const CITY = 'Querétaro, México';

/** Enlace de WhatsApp con mensaje prellenado. */
export function whatsappUrl(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
