import { HttpErrorResponse } from '@angular/common/http';

/** Contrato unico de errores del API (ADR-005 en LambdasDL). */
export interface ApiErrorBody {
  code: string;
  message: string;
  [extra: string]: unknown;
}

const SERVER_PROBLEM = 'Tuvimos un problema en el servidor. Inténtalo de nuevo en unos minutos.';

const CATALOG: Readonly<Record<number, Readonly<{ code: string; message: string }>>> = {
  0: { code: 'NETWORK_ERROR', message: 'No se pudo conectar al servidor. Verifica tu conexión.' },
  400: { code: 'BAD_REQUEST', message: 'Los datos enviados no son válidos. Revísalos e inténtalo de nuevo.' },
  401: { code: 'UNAUTHENTICATED', message: 'Tu sesión expiró. Vuelve a entrar.' },
  403: { code: 'FORBIDDEN', message: 'No tienes permiso para ver esto.' },
  404: { code: 'NOT_FOUND', message: 'No encontramos lo que buscas.' },
  409: { code: 'CONFLICT', message: 'No se pudo completar porque la información cambió. Actualiza e inténtalo de nuevo.' },
  410: { code: 'GONE', message: 'Este contenido ya no está disponible.' },
  413: { code: 'PAYLOAD_TOO_LARGE', message: 'El archivo o los datos son demasiado grandes.' },
  429: { code: 'RATE_LIMITED', message: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' },
  500: { code: 'INTERNAL_ERROR', message: SERVER_PROBLEM },
  502: { code: 'BAD_GATEWAY', message: SERVER_PROBLEM },
  503: { code: 'SERVICE_UNAVAILABLE', message: 'El servicio no está disponible por el momento. Inténtalo de nuevo en unos minutos.' },
  504: { code: 'TIMEOUT', message: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.' },
};

/** Textos que API Gateway genera por su cuenta, sin pasar por la lambda. */
const GATEWAY_MESSAGES = new Set([
  'internal server error', 'endpoint request timed out', 'service unavailable', 'bad gateway', 'not found',
  'forbidden', 'missing authentication token', 'unauthorized', 'too many requests', 'request too long', 'access denied',
]);

export function errorForStatus(status: number): ApiErrorBody {
  return { ...(CATALOG[status] ?? CATALOG[status >= 500 ? 500 : 400]) };
}

function asRecord(body: unknown): Record<string, unknown> {
  const isPlainObject = typeof body === 'object' && body !== null && Object.getPrototypeOf(body) === Object.prototype;
  return isPlainObject ? (body as Record<string, unknown>) : {};
}

function isSafeMessage(message: unknown, status: number, hasCode: boolean): message is string {
  if (typeof message !== 'string' || !message.trim()) return false;
  if (GATEWAY_MESSAGES.has(message.trim().toLowerCase())) return false;
  // Un 5xx sin `code` no viene del contrato: su texto puede traer detalles internos.
  return hasCode || status < 500;
}

export function toApiErrorBody(status: number, body: unknown): ApiErrorBody {
  const record = asRecord(body);
  const hasCode = typeof record['code'] === 'string' && !!record['code'];
  const fallback = errorForStatus(status);
  return {
    ...record,
    code: hasCode ? (record['code'] as string) : fallback.code,
    message: isSafeMessage(record['message'], status, hasCode) ? record['message'] : fallback.message,
  };
}

/** Misma respuesta con el cuerpo normalizado: `e.error.message` siempre es apto para la persona. */
export function normalizeHttpError(error: HttpErrorResponse): HttpErrorResponse {
  return new HttpErrorResponse({
    error: toApiErrorBody(error.status, error.error),
    headers: error.headers,
    status: error.status,
    statusText: error.statusText,
    url: error.url ?? undefined,
  });
}
