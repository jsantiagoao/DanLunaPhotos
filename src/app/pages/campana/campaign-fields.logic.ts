/**
 * Campos dinámicos de campaña en la landing (ADR-007), espejo del `fieldSchema` del backend.
 *
 * El servidor es la autoridad (revalida todo), pero el cliente muestra/oculta y valida en
 * vivo para una buena UX. Genérico: no conoce mascota/personas — todo es dato.
 */
export type CampaignFieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'select';

export interface CampaignField {
  key: string;
  label: string;
  type: CampaignFieldType;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  options?: string[];
  showIf?: string;
  pricing?: { kind: 'included' | 'per_unit'; price?: number };
}

const TRUTHY = new Set(['si', 'sí', 'true', '1', 'yes', 'on']);

function asBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  return TRUTHY.has(String(v ?? '').trim().toLowerCase());
}

/** ¿El campo se muestra según su showIf ("campo==valor")? Sin showIf, siempre. */
export function fieldIsVisible(field: CampaignField, details: Record<string, unknown>): boolean {
  const cond = field.showIf;
  if (!cond || !cond.includes('==')) return true;
  const [refKey, expected] = cond.split('==').map((s) => s.trim());
  const actual = (details || {})[refKey];
  if (expected === 'true' || expected === 'false') {
    return asBool(actual) === (expected === 'true');
  }
  return String(actual) === expected;
}

/** Campos actualmente visibles según los datos. */
export function visibleFields(schema: CampaignField[], details: Record<string, unknown>): CampaignField[] {
  return (schema || []).filter((f) => fieldIsVisible(f, details));
}

/**
 * Valida los campos visibles. Devuelve el mensaje del primer problema (para el cliente)
 * o null. Los ocultos por showIf no se exigen.
 */
export function validateDynamicFields(
  schema: CampaignField[],
  details: Record<string, unknown>,
): string | null {
  for (const f of schema || []) {
    if (!fieldIsVisible(f, details)) continue;
    const raw = (details || {})[f.key];
    const present = raw !== undefined && raw !== null && raw !== '';

    if (f.required && !present) return `Indica ${f.label.toLowerCase()}`;
    if (!present) continue;

    if (f.type === 'number') {
      const n = Number(raw);
      if (Number.isNaN(n)) return `${f.label} debe ser un número`;
      if (f.min != null && n < f.min) return `${f.label} no puede ser menor que ${f.min}`;
      if (f.max != null && n > f.max) return `${f.label} no puede ser mayor que ${f.max}`;
    } else if (f.type === 'select') {
      if (!(f.options || []).includes(String(raw))) return `Elige una opción válida para ${f.label.toLowerCase()}`;
    } else if ((f.type === 'text' || f.type === 'textarea') && f.maxLength != null) {
      if (String(raw).length > f.maxLength) return `${f.label} no puede exceder ${f.maxLength} caracteres`;
    }
  }
  return null;
}
