/**
 * Datos de la cuenta de depósito para el apartado navideño (lógica pura).
 *
 * Editables por Daniela desde Studio y publicados por el backend en `config.content.payment`.
 * La landing solo los muestra en la confirmación (paso `listo`), nunca antes de reservar, para
 * no volver invasivo el flujo. Aquí viven la lectura con respaldo, el formateo de la CLABE y la
 * decisión de si hay datos suficientes para mostrar la tarjeta — todo sin tocar Angular.
 */

/** Datos bancarios editables de la campaña. */
export interface PaymentInfo {
  bank: string;
  accountHolder: string;
  clabe: string;
  /** Instrucción opcional adicional (ej. "Envía tu comprobante por WhatsApp"). */
  instructions?: string;
}

/** Forma mínima del contenido de campaña que nos interesa aquí. */
interface ContentWithPayment {
  payment?: Partial<PaymentInfo>;
}

/** Solo dígitos. */
function digits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/**
 * Lee los datos de pago de la config con respaldo. Devuelve `null` si no hay datos
 * suficientes para mostrar (sin banco ni CLABE no tiene sentido pintar la tarjeta).
 */
export function resolvePaymentInfo(
  content: ContentWithPayment | null | undefined,
  fallback: PaymentInfo | null = null,
): PaymentInfo | null {
  const p = content?.payment;
  const source: Partial<PaymentInfo> = p && (p.clabe || p.bank) ? p : (fallback ?? {});
  const clabe = digits(source.clabe || '');
  const bank = (source.bank || '').trim();
  if (!clabe && !bank) return null;
  return {
    bank,
    accountHolder: (source.accountHolder || '').trim(),
    clabe,
    instructions: (source.instructions || '').trim() || undefined,
  };
}

/**
 * Formatea la CLABE en grupos de 4 para leerla y dictarla sin errores:
 * '012320001234567890' -> '0123 2000 1234 5678 90'. Si no son 18 dígitos, la muestra tal cual.
 */
export function formatClabe(clabe: string): string {
  const d = digits(clabe);
  if (!d) return '';
  return d.replace(/(.{4})/g, '$1 ').trim();
}

/** La CLABE mexicana válida tiene exactamente 18 dígitos. */
export function isValidClabe(clabe: string): boolean {
  return digits(clabe).length === 18;
}
